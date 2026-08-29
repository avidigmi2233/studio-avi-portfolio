/* ==========================================================================
   מרכז ההעדפות — מודאל אמיתי: focus trap, Esc סוגר, פוקוס חוזר לפותח.
   כאן, בשונה מהבאנר, החסימה לגיטימית: המשתמש בחר להיכנס לניהול.
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { COOKIE_CATEGORIES } from "@/content/legal/cookieRegistry";

type Toggles = { analytics: boolean; marketing: boolean; functional: boolean };

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

const actionBtn =
  "inline-flex flex-1 min-w-[150px] items-center justify-center rounded-full border px-5 py-3 text-[14px] font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function PreferencesModal() {
  const { prefsOpen, closePrefs, consent, acceptAll, rejectAll, save, reset, record } = useConsent();
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Toggles>({
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    if (!prefsOpen) return;
    openerRef.current = document.activeElement;
    setToggles({
      analytics: consent.analytics,
      marketing: consent.marketing,
      functional: consent.functional,
    });
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsOpen]);

  useEffect(() => {
    if (!prefsOpen) {
      (openerRef.current as HTMLElement | null)?.focus?.();
      return;
    }
    document.body.classList.add("is-locked");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePrefs();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey);
    };
  }, [prefsOpen, closePrefs]);

  const decidedAt = useMemo(() => {
    if (!record) return null;
    try {
      return new Intl.DateTimeFormat("he-IL", { dateStyle: "long", timeStyle: "short" }).format(
        new Date(record.timestamp),
      );
    } catch {
      return null;
    }
  }, [record]);

  if (!prefsOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center p-4 sm:items-center" dir="rtl">
      <div
        aria-hidden
        onClick={closePrefs}
        className="absolute inset-0 bg-[hsl(225_29%_2%/0.82)] backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        className={cn(
          "relative flex max-h-[88vh] w-full max-w-[620px] flex-col overflow-hidden rounded-2xl border border-foreground/12",
          "bg-[linear-gradient(180deg,hsl(225_25%_7%/0.99),hsl(225_29%_3%))] shadow-[0_60px_140px_-50px_hsl(0_0%_0%/1)]",
          "motion-safe:animate-[bannerIn_250ms_cubic-bezier(.16,1,.3,1)_both]",
        )}
      >
        <div className="border-b border-foreground/10 p-6">
          <h2 id="cookie-prefs-title" className="font-display text-[21px] font-bold text-foreground">
            הגדרות Cookie
          </h2>
          <p className="mt-2 text-[14px] leading-[1.8] text-ink-3">
            בחרו אילו סוגי קוקיז מותר לאתר להפעיל. אפשר לשנות את הבחירה בכל רגע.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ul className="grid gap-4">
            {COOKIE_CATEGORIES.map((cat) => {
              const isOpen = open === cat.key;
              const checked =
                cat.key === "necessary" ? true : toggles[cat.key as keyof Toggles];
              return (
                <li
                  key={cat.key}
                  className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[15.5px] font-bold text-foreground">
                        {cat.title}
                        {cat.locked && <Lock className="h-3.5 w-3.5 text-gold" aria-hidden />}
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-[1.8] text-ink-3">
                        {cat.description}
                      </p>
                    </div>

                    {cat.locked ? (
                      <span
                        role="switch"
                        aria-checked="true"
                        aria-disabled="true"
                        aria-label={`${cat.title} — נדרש לתפקוד האתר`}
                        className="mt-1 inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full border border-gold/40 bg-gold/25 px-0.5"
                      >
                        <span className="h-4.5 w-4.5 translate-x-0 rounded-full bg-gold" style={{ height: 18, width: 18 }} />
                      </span>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-label={cat.title}
                        onClick={() => {
                          const k = cat.key as keyof Toggles;
                          setToggles((t) => ({ ...t, [k]: !t[k] }));
                        }}
                        className={cn(
                          "mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-300",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          checked ? "border-gold/60 bg-gold/30" : "border-foreground/20 bg-foreground/10",
                        )}
                      >
                        <span
                          className={cn(
                            "rounded-full transition-transform duration-300 ease-cinematic",
                            checked ? "-translate-x-[20px] bg-gold" : "translate-x-0 bg-ink-3",
                          )}
                          style={{ height: 18, width: 18 }}
                        />
                      </button>
                    )}
                  </div>

                  {cat.locked && (
                    <p className="mt-2 text-[12.5px] text-gold/80">נדרש לתפקוד האתר</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : cat.key)}
                    aria-expanded={isOpen}
                    aria-controls={`cat-${cat.key}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    פירוט מלא
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>

                  <div id={`cat-${cat.key}`} hidden={!isOpen} className="mt-3">
                    {cat.cookies.length === 0 ? (
                      <p className="text-[13px] leading-[1.8] text-muted-ink">{cat.emptyNote}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[440px] border-collapse text-right text-[12.5px]">
                          <thead>
                            <tr className="text-ink-3">
                              <th scope="col" className="border-b border-foreground/10 py-2 pl-3 font-normal">שם</th>
                              <th scope="col" className="border-b border-foreground/10 py-2 pl-3 font-normal">ספק</th>
                              <th scope="col" className="border-b border-foreground/10 py-2 pl-3 font-normal">מטרה</th>
                              <th scope="col" className="border-b border-foreground/10 py-2 font-normal">משך</th>
                            </tr>
                          </thead>
                          <tbody className="text-ink-2">
                            {cat.cookies.map((c) => (
                              <tr key={c.name} className="align-top">
                                <td className="border-b border-foreground/[0.06] py-2.5 pl-3">{c.name}</td>
                                <td className="border-b border-foreground/[0.06] py-2.5 pl-3">{c.vendor}</td>
                                <td className="border-b border-foreground/[0.06] py-2.5 pl-3 leading-[1.7]">{c.purpose}</td>
                                <td className="border-b border-foreground/[0.06] py-2.5">{c.ttl}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-foreground/10 p-6">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => save(toggles)}
              className={cn(actionBtn, "border-gold/45 bg-gold/[0.08] text-gold hover:border-gold/75 hover:bg-gold/[0.14]")}
            >
              שמירת הבחירה
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className={cn(actionBtn, "border-gold/45 bg-gold/[0.08] text-gold hover:border-gold/75 hover:bg-gold/[0.14]")}
            >
              אישור הכל
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className={cn(actionBtn, "border-gold/45 bg-gold/[0.08] text-gold hover:border-gold/75 hover:bg-gold/[0.14]")}
            >
              דחיית הכל
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-muted-ink">
            {decidedAt ? <span>הבחירה הנוכחית נשמרה ב-{decidedAt}</span> : <span />}
            <button
              type="button"
              onClick={reset}
              className="underline underline-offset-4 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              מחיקת ההסכמה שלי
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
