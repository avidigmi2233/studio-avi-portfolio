/* ==========================================================================
   Meta Pixel — נטען אך ורק כאשר categories.marketing === true וגם קיים מזהה.
   כרגע INTEGRATIONS.metaPixelId ריק, ולכן הפונקציה היא no-op שקט.
   התשתית קיימת כדי שהפיקסל ייכנס דרך מערכת ההסכמה ולא יודבק ל-head.
   ========================================================================== */

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function initMetaPixel(pixelId: string) {
  if (!pixelId) return; // אין פיקסל מוגדר — יוצאים בשקט, בלי שגיאה
  if (typeof window === "undefined") return;
  if (window.fbq) {
    window.fbq("consent", "grant");
    return;
  }

  /* ה-snippet הרשמי של fbq, בכתיב מודרני */
  const queue: unknown[] = [];
  // ההערה המפורשת חיונית: בלעדיה TS רואה הפניה עצמית באתחול.
  const n: Fbq = function fbq(...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else queue.push(args);
  } as Fbq;
  n.queue = queue;
  n.loaded = true;
  n.version = "2.0";
  n.push = n;
  window.fbq = n;
  window._fbq = window._fbq ?? n;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  window.fbq("consent", "grant");
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

export function revokeMetaPixel() {
  if (typeof window !== "undefined" && window.fbq) window.fbq("consent", "revoke");
}
