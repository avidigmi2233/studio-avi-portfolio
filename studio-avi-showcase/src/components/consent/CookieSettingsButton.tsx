/* כפתור צף לפתיחת הגדרות ה-Cookie. מופיע רק אחרי שהתקבלה החלטה,
   כדי שלא יתחרה בבאנר. מטרת מגע 44×44, פינה תחתונה-שמאלית — הפינה
   הימנית תפוסה בכפתור הוואטסאפ. */

import { Cookie } from "lucide-react";

import { useConsent } from "@/lib/consent/ConsentProvider";

export function CookieSettingsButton() {
  const { hasDecided, prefsOpen, reopen } = useConsent();
  if (hasDecided !== true || prefsOpen) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      aria-label="הגדרות Cookie"
      title="הגדרות Cookie"
      className="fixed z-[92] inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-stage/60 text-gold-hi backdrop-blur-md transition-colors duration-300 hover:border-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        left: "calc(var(--frame) + clamp(14px,2.4vw,30px))",
        bottom: "calc(var(--frame) + 15px)",
      }}
    >
      <Cookie className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden />
    </button>
  );
}
