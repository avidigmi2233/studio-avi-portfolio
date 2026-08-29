/* ==========================================================================
   מודל ההסכמה. ברירת המחדל היא סירוב — כל קטגוריה שאינה necessary
   מתחילה כ-false, וכל עוד לא התקבלה החלטה שום סקריפט לא נטען.
   ========================================================================== */

export const CONSENT_VERSION = "1.0.0";
export const CONSENT_STORAGE_KEY = "ad_consent";
export const CONSENT_MAX_AGE_DAYS = 180;

export type ConsentCategory = "necessary" | "analytics" | "marketing" | "functional";

export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  version: string;
  timestamp: string; // ISO 8601
  method: "accept_all" | "reject_all" | "custom";
  categories: ConsentCategories;
}

export const DENIED: ConsentCategories = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const GRANTED: ConsentCategories = {
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
};

export const CONSENT_EVENT = "consentchange";

export function isStaleRecord(rec: ConsentRecord | null): boolean {
  if (!rec) return true;
  if (rec.version !== CONSENT_VERSION) return true;
  const age = Date.now() - new Date(rec.timestamp).getTime();
  if (Number.isNaN(age)) return true;
  return age > CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (!parsed?.categories || typeof parsed.timestamp !== "string") return null;
    return { ...parsed, categories: { ...parsed.categories, necessary: true as const } };
  } catch {
    return null; // מצב פרטי / אחסון חסום — מתייחסים כאילו אין החלטה
  }
}

/** קריאה סינכרונית לשימוש מחוץ ל-React (שכבת המעקב). ישן/חסר = סירוב. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const rec = readConsent();
  if (isStaleRecord(rec)) return false;
  return rec!.categories[category] === true;
}
