/* ==========================================================================
   מנוע ההסכמה. עוטף את האתר כולו ומחזיק שלוש עובדות:
   מה נבחר, האם בכלל הוכרע, והאם מרכז ההעדפות פתוח.

   SSR: הקריאה מ-localStorage קורית רק אחרי הרכבה (useEffect), אחרת
   השרת והלקוח מרנדרים מצבים שונים והידרציה נשברת.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  DENIED,
  GRANTED,
  isStaleRecord,
  readConsent,
  type ConsentCategories,
  type ConsentRecord,
} from "./types";

type ConsentContextValue = {
  /** הקטגוריות הפעילות. לפני הכרעה — הכל סירוב מלבד necessary. */
  consent: ConsentCategories;
  /** הרשומה השמורה, אם קיימת ותקפה */
  record: ConsentRecord | null;
  /** false = צריך להציג באנר. null עד לסיום ההרכבה בדפדפן. */
  hasDecided: boolean | null;
  isStale: boolean;
  prefsOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (categories: Omit<ConsentCategories, "necessary">) => void;
  reopen: () => void;
  closePrefs: () => void;
  /** מחיקת ההסכמה ואיפוס המצב לחלוטין */
  reset: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function persist(record: ConsentRecord) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* אחסון חסום — ההסכמה תקפה לסשן הזה בלבד */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(null);
  const [mounted, setMounted] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    setRecord(isStaleRecord(stored) ? null : stored);
    setMounted(true);
  }, []);

  const commit = useCallback(
    (categories: ConsentCategories, method: ConsentRecord["method"]) => {
      const next: ConsentRecord = {
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        method,
        categories,
      };
      setRecord(next);
      persist(next);
      setPrefsOpen(false);
    },
    [],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent: record?.categories ?? DENIED,
      record,
      hasDecided: mounted ? record !== null : null,
      isStale: isStaleRecord(record),
      prefsOpen,
      acceptAll: () => commit({ ...GRANTED }, "accept_all"),
      rejectAll: () => commit({ ...DENIED }, "reject_all"),
      save: (c) =>
        commit(
          {
            necessary: true,
            analytics: c.analytics,
            marketing: c.marketing,
            functional: c.functional,
          },
          "custom",
        ),
      reopen: () => setPrefsOpen(true),
      closePrefs: () => setPrefsOpen(false),
      reset: () => {
        try {
          window.localStorage.removeItem(CONSENT_STORAGE_KEY);
        } catch {
          /* אחסון חסום */
        }
        setRecord(null);
        setPrefsOpen(false);
        window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
      },
    }),
    [record, mounted, prefsOpen, commit],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent חייב לרוץ בתוך <ConsentProvider>");
  return ctx;
}
