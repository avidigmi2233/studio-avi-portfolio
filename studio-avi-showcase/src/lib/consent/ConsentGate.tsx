/* ==========================================================================
   עוטף כל תוכן צד ג' שמציב קובצי Cookie. בלי הסכמה — התוכן לא נטען,
   ובמקומו מוצג placeholder בשפת האתר עם כפתור שמדליק את הקטגוריה.
   ========================================================================== */

import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConsent } from "./ConsentProvider";
import type { ConsentCategory } from "./types";

export function ConsentGate({
  category,
  label,
  description,
  className,
  children,
}: {
  category: Exclude<ConsentCategory, "necessary">;
  label: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  const { consent, save } = useConsent();

  if (consent[category]) return <>{children}</>;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-foreground/10 bg-card/80 p-8 text-center",
        className,
      )}
    >
      <ShieldCheck className="h-7 w-7 text-gold" aria-hidden strokeWidth={1.6} />
      <div>
        <p className="font-display text-[17px] font-bold text-foreground">{label}</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-[1.85] text-ink-3">
          {description ?? "התוכן הזה נטען משירות חיצוני שמציב קובצי Cookie."}
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          save({
            analytics: category === "analytics" ? true : consent.analytics,
            marketing: category === "marketing" ? true : consent.marketing,
            functional: category === "functional" ? true : consent.functional,
          })
        }
        className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-gold/[0.07] px-6 py-3 text-[14px] font-bold text-gold transition-colors hover:border-gold/70 hover:bg-gold/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        אישור טעינה
      </button>
    </div>
  );
}
