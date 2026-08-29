/* ==========================================================================
   באנר הקוקיז. כרטיס צף בתחתית, לא מודאל ולא overlay:
   התוכן נשאר נגיש, הגלילה לא ננעלת, והפוקוס לא נלכד.

   "אישור הכל" ו"רק הכרחיים" זהים לחלוטין בגודל, במשקל ובצבע — זו בדיוק
   הנקודה שעליה תובעים, ולכן אין כאן היררכיה בין השניים.
   ========================================================================== */

import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { useConsent } from "@/lib/consent/ConsentProvider";

const choiceBtn =
  "inline-flex flex-1 min-w-[142px] items-center justify-center rounded-full border border-gold/45 bg-gold/[0.08] px-5 py-3 text-[14px] font-bold text-gold transition-colors duration-300 hover:border-gold/75 hover:bg-gold/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function CookieBanner() {
  const { hasDecided, prefsOpen, acceptAll, rejectAll, reopen } = useConsent();
  const cardRef = useRef<HTMLDivElement>(null);

  const visible = hasDecided === false && !prefsOpen;

  // הפוקוס עובר לבאנר כשהוא מוצג, אבל לא נלכד בו — הבאנר אינו חוסם
  useEffect(() => {
    if (visible) cardRef.current?.focus();
  }, [visible]);

  // Esc לא סוגר בלי החלטה. במקום זה הוא פותח את מרכז ההעדפות.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        reopen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, reopen]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      dir="rtl"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
        tabIndex={-1}
        className={cn(
          "pointer-events-auto w-full max-w-[560px] rounded-2xl border border-foreground/12 p-5 shadow-[0_40px_90px_-40px_hsl(0_0%_0%/0.95)] backdrop-blur-2xl",
          "bg-[linear-gradient(180deg,hsl(225_25%_7%/0.97),hsl(225_29%_3%/0.98))]",
          "motion-safe:animate-[bannerIn_250ms_cubic-bezier(.16,1,.3,1)_both] focus-visible:outline-none",
        )}
      >
        <h2 id="cookie-banner-title" className="font-display text-[17px] font-bold text-foreground">
          קובצי Cookie באתר
        </h2>
        <p id="cookie-banner-desc" className="mt-2.5 text-[14px] leading-[1.8] text-ink-2">
          אנחנו משתמשים בקובצי Cookie כדי שהאתר יעבוד, וכדי למדוד ולשפר את חוויית הגלישה. אפשר לאשר
          הכול, להסתפק בהכרחיים בלבד, או לבחור בעצמך.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" onClick={acceptAll} className={choiceBtn}>
            אישור הכל
          </button>
          <button type="button" onClick={rejectAll} className={choiceBtn}>
            רק הכרחיים
          </button>
          <button
            type="button"
            onClick={reopen}
            className="inline-flex flex-1 min-w-[142px] items-center justify-center rounded-full border border-foreground/20 px-5 py-3 text-[14px] font-bold text-ink-2 transition-colors duration-300 hover:border-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ניהול העדפות
          </button>
        </div>

        <p className="mt-4 text-[12.5px] text-muted-ink">
          <Link to="/cookies" className="underline underline-offset-4 transition-colors hover:text-gold">
            מדיניות Cookie
          </Link>
        </p>
      </div>
    </div>
  );
}
