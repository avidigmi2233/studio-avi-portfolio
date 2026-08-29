/* ==========================================================================
   סטודיו אבי — שכבת מעקב המרות, כפופה להסכמה.

   שני כללים שלא נשברים:
   1. שום סקריפט לא נטען לפני הסכמה מפורשת לקטגוריה שלו.
   2. מזהה ריק = כלום. אפשר לפרוס בלי פיקסלים ולהדביק אותם מאוחר יותר
      בלי לגעת בקומפוננטות — הם ייכנסו דרך מערכת ההסכמה, לא סביבה.

   מיפוי: Meta Pixel ו-Google Ads → marketing. GA4 → analytics.
   ========================================================================== */

import { INTEGRATIONS } from "@/config/site";
import { initMetaPixel, revokeMetaPixel } from "./consent/pixel";
import { loadScriptOnce } from "./consent/scriptLoader";
import { CONSENT_EVENT, hasConsent, type ConsentRecord } from "./consent/types";

/** נשמר לשם תאימות לאחור; המקור הוא src/config/site.ts */
export const TRACKING = {
  metaPixelId: INTEGRATIONS.metaPixelId,
  ga4Id: INTEGRATIONS.gaMeasurementId,
  googleAdsId: INTEGRATIONS.googleAdsId,
  googleAdsLabel: INTEGRATIONS.googleAdsLabel,
} as const;

const PENDING_LEAD_KEY = "sa_pending_lead";

let metaLoaded = false;
let googleLoaded = false;
let consentDefaultsSet = false;

/* ── Consent Mode v2 ───────────────────────────────────────────── */

function ensureGtagStub() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
  if (!consentDefaultsSet) {
    consentDefaultsSet = true;
    // ברירת המחדל נקבעת לפני כל טעינה, תמיד denied
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
      wait_for_update: 500,
    });
  }
}

function updateGoogleConsent(analytics: boolean, marketing: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
}

/* ── טעינה בכפוף להסכמה ────────────────────────────────────────── */

/**
 * מסנכרן את הסקריפטים למצב ההסכמה הנוכחי. בטוח לקריאה חוזרת.
 * נקרא בעליית האתר וכל אימת שההסכמה משתנה.
 */
export function syncTrackingWithConsent() {
  if (typeof window === "undefined") return;

  const analytics = hasConsent("analytics");
  const marketing = hasConsent("marketing");

  const needsGoogle =
    (analytics && TRACKING.ga4Id) || (marketing && TRACKING.googleAdsId);

  if (needsGoogle) {
    ensureGtagStub();
    if (!googleLoaded) {
      googleLoaded = true;
      const id = TRACKING.ga4Id || TRACKING.googleAdsId;
      loadScriptOnce("gtag-js", `https://www.googletagmanager.com/gtag/js?id=${id}`);
      window.gtag!("js", new Date());
      if (analytics && TRACKING.ga4Id) window.gtag!("config", TRACKING.ga4Id);
      if (marketing && TRACKING.googleAdsId) window.gtag!("config", TRACKING.googleAdsId);
    }
    updateGoogleConsent(analytics, marketing);
  }

  if (marketing && TRACKING.metaPixelId) {
    if (!metaLoaded) {
      metaLoaded = true;
      initMetaPixel(TRACKING.metaPixelId);
    } else {
      window.fbq?.("consent", "grant");
    }
  } else if (metaLoaded) {
    revokeMetaPixel();
  }

  if (!marketing) updateGoogleConsent(analytics, false);
  if (analytics || marketing) flushPendingLead();
}

/** מאזין גלובלי. נרשם פעם אחת מ-ConsentBridge. */
export function attachTrackingToConsent(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const rec = (e as CustomEvent<ConsentRecord | null>).detail;
    if (!rec || !rec.categories.marketing) revokeMetaPixel();
    syncTrackingWithConsent();
  };
  window.addEventListener(CONSENT_EVENT, handler);
  syncTrackingWithConsent();
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/* ── אירוע ההמרה ───────────────────────────────────────────────── */

type LeadMeta = { type?: string; value?: number };

function fireLead(meta: LeadMeta) {
  window.fbq?.("track", "Lead", {
    content_name: meta.type ?? "פנייה מהאתר",
    value: meta.value ?? 0,
    currency: "ILS",
  });

  window.gtag?.("event", "generate_lead", {
    currency: "ILS",
    value: meta.value ?? 0,
    lead_type: meta.type ?? "site_form",
  });

  if (TRACKING.googleAdsId && TRACKING.googleAdsLabel && hasConsent("marketing")) {
    window.gtag?.("event", "conversion", {
      send_to: `${TRACKING.googleAdsId}/${TRACKING.googleAdsLabel}`,
      value: meta.value ?? 0,
      currency: "ILS",
    });
  }
}

/**
 * אירוע ההמרה. נקרא פעם אחת בדף התודה.
 * בלי הסכמה — לא נורה, אלא נשמר לסשן. אם הגולש יאשר בהמשך, הוא יישלח אז.
 */
export function trackLead(meta: LeadMeta = {}) {
  if (typeof window === "undefined") return;

  if (!hasConsent("analytics") && !hasConsent("marketing")) {
    try {
      sessionStorage.setItem(PENDING_LEAD_KEY, JSON.stringify(meta));
    } catch {
      /* אחסון חסום — ההמרה פשוט לא תדווח */
    }
    return;
  }

  syncTrackingWithConsent();
  fireLead(meta);
}

function flushPendingLead() {
  try {
    const raw = sessionStorage.getItem(PENDING_LEAD_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_LEAD_KEY);
    fireLead(JSON.parse(raw) as LeadMeta);
  } catch {
    /* אחסון חסום */
  }
}

/* ── לכידת מקור התנועה ─────────────────────────────────────────── */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORE_KEY = "sa_attribution";

/**
 * שומר את פרמטרי ה-UTM בכניסה הראשונה לאתר, ב-sessionStorage.
 * זהו מידע תפעולי של האתר עצמו לצורך ייחוס פנייה שהגולש בחר לשלוח,
 * ולכן הוא נשמר גם בלי הסכמה שיווקית. הוא אינו נקרא ואינו נשלח
 * לשום צד שלישי, ונמחק בסגירת הלשונית.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    const existing = sessionStorage.getItem(STORE_KEY);
    // הכניסה הראשונה מנצחת — היא שהביאה את הגולש
    if (existing && !Object.keys(found).length) return;
    sessionStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        ...found,
        referrer: document.referrer || "",
        landing_path: window.location.pathname,
      }),
    );
  } catch {
    /* מצב פרטי / אחסון חסום — נמשיך בלי ייחוס */
  }
}

export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
