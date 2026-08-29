import { LAST_UPDATED } from "@/config/site";

export { LAST_UPDATED };

export const TERMS_VERSION = "1.0.0";
export const PRIVACY_VERSION = "1.0.0";

/* עמוד מדיניות בלי תאריך עדכון הוא ליקוי. אל תיתן לזה לעלות לאוויר. */
if (import.meta.env.PROD && !LAST_UPDATED) {
  throw new Error(
    "LAST_UPDATED ריק ב-src/config/site.ts — אי אפשר לפרוס עמודים משפטיים בלי תאריך עדכון.",
  );
}

/** 2026-08-30 → 30.8.2026 */
export function formatLegalDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${y}`;
}
