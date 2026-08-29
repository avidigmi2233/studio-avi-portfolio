/* ==========================================================================
   סטודיו אבי — קליטת ליד (לוגיקה בלבד, ללא תלות בפריימוורק)
   ה-server route רק קורא ל-handleLeadIntake ומחזיר את התוצאה.

   עיקרון מנחה: ליד לא הולך לאיבוד. אם ה-CRM נופל — המייל עדיין יוצא.
   אם מייל האישור ללקוח נכשל — ההתרעה לאבי עדיין יוצאת.
   כל ערוץ נכשל בנפרד ומדווח בנפרד.
   ========================================================================== */

import { SITE } from "@/config/site";
import { buildLeadEmail, buildOwnerEmail, type LeadPayload } from "./emails";

const CRM_GATEWAY =
  "https://pcdvwhuxsahtyjttbgjd.supabase.co/functions/v1/api-gateway?action=ingest_lead";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const OWNER_EMAIL = SITE.contactEmail;

export type IntakeEnv = {
  CRM_CLIENT_ID?: string;
  CRM_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  /** כתובת השולח. עד שהדומיין מאומת — onboarding@resend.dev */
  MAIL_FROM?: string;
};

export type IntakeInput = {
  name: string;
  phone: string;
  email: string;
  type: string;
  budget?: string;
  message?: string;
  /** שדה דבש — בוטים ממלאים אותו, בני אדם לא רואים אותו */
  company?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_url?: string;
  /** תיעוד ההסכמה מהטופס, כ-JSON. הראיה שהתנאים אושרו בעת השליחה. */
  consent_snapshot?: string;
};

export type IntakeResult = {
  ok: boolean;
  firstName: string;
  crmLeadId: string | null;
  errors: string[];
  fieldErrors?: Record<string, string>;
  /** מסומן כשזוהה בוט — מחזירים 200 כדי לא ללמד אותו מה נכשל */
  silentDrop?: boolean;
};

/* ── ולידציה ───────────────────────────────────────────────────── */

const PHONE_RE = /^[0-9+\-\s()]{9,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(input: IntakeInput): Record<string, string> {
  const e: Record<string, string> = {};
  if ((input.name ?? "").trim().length < 2) e.name = "איך קוראים לכם?";
  if (!PHONE_RE.test((input.phone ?? "").trim())) e.phone = "מספר טלפון לא תקין";
  if (!EMAIL_RE.test((input.email ?? "").trim())) e.email = "כתובת אימייל לא תקינה";
  if (!(input.type ?? "").trim()) e.type = "בחרו סוג פרויקט";
  if ((input.message ?? "").length > 4000) e.message = "ההודעה ארוכה מדי";
  return e;
}

/* ── מיפוי לשדות ה-CRM ─────────────────────────────────────────── */

/** טווחי התקציב באתר → מפתח יציב + הערכה מספרית לשווי הצנרת */
const BUDGET_MAP: Record<string, { range: string; value: number }> = {
  "עד 8,000 ₪": { range: "0-8k", value: 6000 },
  "8,000–20,000 ₪": { range: "8-20k", value: 14000 },
  "20,000–50,000 ₪": { range: "20-50k", value: 35000 },
  "50,000 ₪ ומעלה": { range: "50k+", value: 60000 },
};

const TYPE_MAP: Record<string, string> = {
  "אתר תדמית קולנועי": "business_site",
  "אתר / חוויית תלת מימד": "business_site",
  "דף נחיתה": "landing_page",
  "חנות אונליין": "ecommerce",
  "מערכת / אפליקציית ווב": "custom_app",
  "מיתוג דיגיטלי מלא": "business_site",
  "עדיין לא בטוח": "",
};

/** utm_source גולמי → ערכי LeadSource של ה-CRM */
function mapSource(utm?: string, referrer?: string): string {
  const s = (utm ?? "").toLowerCase();
  if (s.includes("face") || s === "fb" || s === "meta") return "facebook";
  if (s.includes("insta") || s === "ig") return "instagram";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("youtube") || s === "yt") return "youtube";
  if (s.includes("google") || s.includes("adwords")) return "google";
  if (s) return "organic";

  const r = (referrer ?? "").toLowerCase();
  if (r.includes("facebook")) return "facebook";
  if (r.includes("instagram")) return "instagram";
  if (r.includes("google")) return "google";
  return "organic";
}

/* ── ערוץ 1: ה-CRM ─────────────────────────────────────────────── */

async function pushToCrm(input: IntakeInput, env: IntakeEnv): Promise<string | null> {
  if (!env.CRM_CLIENT_ID || !env.CRM_CLIENT_SECRET) {
    throw new Error("חסרים CRM_CLIENT_ID / CRM_CLIENT_SECRET");
  }

  const b = BUDGET_MAP[input.budget ?? ""] ?? { range: "", value: 0 };

  const res = await fetch(CRM_GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": env.CRM_CLIENT_ID,
      "x-client-secret": env.CRM_CLIENT_SECRET,
    },
    body: JSON.stringify({
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim().toLowerCase(),
      source: mapSource(input.utm_source, input.referrer),
      budget: b.value,
      budget_range: b.range,
      project_type: TYPE_MAP[input.type] ?? "",
      notes: [input.type, input.budget, input.message].filter(Boolean).join(" · "),
      core_needs: input.message ?? "",
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_content: input.utm_content,
      utm_term: input.utm_term,
      campaign_name: input.utm_campaign,
      landing_url: input.landing_url,
      consent_snapshot: input.consent_snapshot,
      // מפתח ייחודי למניעת כפילות אם הגולש שולח פעמיים
      external_id: `site:${input.email.trim().toLowerCase()}`,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok) throw new Error(json.error || `CRM החזיר ${res.status}`);
  return json.id ?? null;
}

/* ── ערוץ 2: מיילים ────────────────────────────────────────────── */

async function sendEmail(
  env: IntakeEnv,
  to: string,
  mail: { subject: string; html: string; text: string },
  replyTo?: string,
) {
  if (!env.RESEND_API_KEY) throw new Error("חסר RESEND_API_KEY");

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || "סטודיו אבי <onboarding@resend.dev>",
      to: [to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(replyTo ? { reply_to: [replyTo] } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body.slice(0, 180)}`);
  }
}

/* ── התזמורת ───────────────────────────────────────────────────── */

export async function handleLeadIntake(
  input: IntakeInput,
  env: IntakeEnv,
): Promise<IntakeResult> {
  const firstName = (input.name ?? "").trim().split(" ")[0] || "";

  // שדה הדבש מלא → בוט. מחזירים הצלחה מדומה בלי לעשות כלום.
  if ((input.company ?? "").trim()) {
    return { ok: true, firstName, crmLeadId: null, errors: [], silentDrop: true };
  }

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length) {
    return { ok: false, firstName, crmLeadId: null, errors: [], fieldErrors };
  }

  const errors: string[] = [];

  // ה-CRM ראשון, כדי שמזהה הליד ייכנס למייל ההתרעה
  let crmLeadId: string | null = null;
  try {
    crmLeadId = await pushToCrm(input, env);
  } catch (e) {
    errors.push(`CRM: ${(e as Error).message}`);
  }

  const payload: LeadPayload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    type: input.type,
    budget: input.budget ?? "",
    message: input.message ?? "",
    crmLeadId,
    source: {
      utmSource: input.utm_source,
      utmCampaign: input.utm_campaign,
      utmMedium: input.utm_medium,
      referrer: input.referrer,
      landingUrl: input.landing_url,
    },
  };

  // ההתרעה לאבי היא הערוץ הקריטי — היא רצה גם אם ה-CRM נפל
  try {
    await sendEmail(env, OWNER_EMAIL, buildOwnerEmail(payload), input.email.trim());
  } catch (e) {
    errors.push(`מייל התרעה: ${(e as Error).message}`);
  }

  // אישור ללקוח — נחמד שיהיה, לא קריטי. דורש דומיין מאומת.
  try {
    await sendEmail(env, input.email.trim(), buildLeadEmail(payload), OWNER_EMAIL);
  } catch (e) {
    errors.push(`מייל אישור ללקוח: ${(e as Error).message}`);
  }

  // הליד נחשב נקלט אם לפחות ערוץ אחד הצליח
  const ok = crmLeadId !== null || errors.length < 3;
  return { ok, firstName, crmLeadId, errors };
}
