/* ==========================================================================
   סטודיו אבי — דף תודה
   נחיתה אחרי שליחת הטופס. שלוש מטרות, לפי סדר:
   1. להרגיע — הפרטים הגיעו, וזה מה שקורה עכשיו.
   2. לקצר את הדרך — וואטסאפ ויומן, לפני שהמומנטום נגמר.
   3. להחזיק בסביבה — עבודות נבחרות במקום דף מת.
   ========================================================================== */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowUpRight, CalendarDays, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/config/site";
import { trackLead } from "@/lib/tracking";
import { LegalNav } from "@/components/legal/LegalNav";

/* ← הדבק כאן את קישור Cal.com אחרי פתיחת החשבון. ריק = הכפתור לא מוצג. */
const BOOKING_URL = "";

const WHATSAPP = SITE.whatsapp;

const STEPS: [string, string][] = [
  ["אני קורא את הפנייה", "עובר על מה שכתבתם ומסתכל על המותג שלכם לפני שאני חוזר — כדי שהשיחה תתחיל מהמקום הנכון."],
  ["שיחה קצרה, עד 24 שעות", "בלי מצגת מכירה. נבין מה אתם צריכים, ואגיד בכנות אם זה מתאים לי ולכם."],
  ["כיוון ראשון והצעה", "תצאו עם כיוון ברור לפרויקט והצעת מחיר מפורטת — גם אם נחליט לא לעבוד יחד."],
];

const WORK = [
  { img: "/img/covers/tayar.jpg", title: "TAYAR", tag: "אתר תדמית · ניקיון מתקדם" },
  { img: "/img/covers/timing.jpg", title: "TIMING", tag: "חוויית תלת מימד" },
  { img: "/img/covers/dominic.webp", title: "DOMINIC", tag: "מיתוג דיגיטלי" },
];

/* ── חותם האישור ───────────────────────────────────────────────── */

function Seal() {
  return (
    <div className="relative mx-auto h-[92px] w-[92px]">
      <span
        aria-hidden
        className="absolute inset-[-26px] rounded-full bg-gold/20 blur-3xl motion-safe:animate-pulse-dot"
      />
      <svg viewBox="0 0 92 92" className="relative h-full w-full" aria-hidden>
        <circle cx="46" cy="46" r="44" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.22" strokeWidth="1" />
        <circle
          cx="46" cy="46" r="44" fill="none"
          stroke="hsl(var(--gold))" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="277" strokeDashoffset="277"
          transform="rotate(-90 46 46)"
          style={{ animation: "sealRing 1.15s cubic-bezier(.16,1,.3,1) .1s forwards" }}
        />
        <path
          d="M30 47.5 L41 58 L63 34"
          fill="none" stroke="hsl(var(--gold-hi))" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="52" strokeDashoffset="52"
          style={{ animation: "sealTick .55s cubic-bezier(.16,1,.3,1) .85s forwards" }}
        />
      </svg>
      <style>{`
        @keyframes sealRing { to { stroke-dashoffset: 0 } }
        @keyframes sealTick { to { stroke-dashoffset: 0 } }
        @media (prefers-reduced-motion: reduce) {
          [style*="sealRing"], [style*="sealTick"] { animation: none !important; stroke-dashoffset: 0 !important }
        }
      `}</style>
    </div>
  );
}

/* ── כפתור בשפת האתר ───────────────────────────────────────────── */

function CtaButton({
  href, children, variant = "solid", icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  icon?: React.ElementType;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-8 py-[17px]",
        "text-[15px] font-bold tracking-[0.03em] transition-[transform,box-shadow,background,color,border-color]",
        "duration-500 ease-cinematic hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "solid"
          ? "bg-[linear-gradient(102deg,hsl(var(--gold-hi)),hsl(var(--gold)))] text-ink-inverse shadow-[0_18px_44px_-18px_hsl(var(--gold)/0.7)] hover:shadow-[0_24px_58px_-18px_hsl(var(--gold)/0.85)]"
          : "border border-gold/30 bg-gold/[0.05] text-gold hover:border-gold/60 hover:bg-gold/[0.1]",
      )}
    >
      {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />}
      <span className="relative z-[2]">{children}</span>
      {variant === "solid" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] -translate-x-[130%] bg-[linear-gradient(110deg,transparent_36%,hsl(0_0%_100%/0.6)_50%,transparent_64%)] transition-transform duration-1000 ease-cinematic group-hover:translate-x-[130%]"
        />
      )}
    </a>
  );
}

/* ── הדף ───────────────────────────────────────────────────────── */

function ThankYou() {
  const { name, type } = Route.useSearch();
  const first = (name ?? "").trim().split(" ")[0];

  // אירוע ההמרה — פעם אחת, כאן. זו הנקודה היחידה שבה אנחנו בטוחים שהטופס נשלח.
  useEffect(() => {
    trackLead({ type: type || "פנייה מהאתר" });
  }, [type]);

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* אווירה */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[22%] h-[70vh] bg-[radial-gradient(58%_52%_at_50%_0%,hsl(var(--gold)/0.16),transparent_72%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay motion-safe:animate-grain"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-6 py-[clamp(64px,11vh,120px)]">
        {/* ── אישור ── */}
        <section className="text-center motion-safe:animate-rise-in">
          <Seal />

          <p className="mt-9 flex items-center justify-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
            <span className="h-px w-10 bg-gold/25" />
            הפנייה נקלטה
            <span className="h-px w-10 bg-gold/25" />
          </p>

          <h1 className="mt-4 font-display text-[clamp(34px,5.6vw,70px)] font-bold leading-[1.08] tracking-[-0.025em]">
            {first ? `תודה, ${first}.` : "תודה."}
            <br />
            <span className="bg-[linear-gradient(96deg,hsl(var(--gold-dp))_4%,hsl(var(--gold-hi))_42%,hsl(var(--gold))_78%)] bg-clip-text text-transparent">
              נדבר בקרוב מאוד.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-[52ch] text-[16.5px] leading-[1.95] text-ink-2">
            הפרטים הגיעו אליי ושלחתי לכם מייל אישור. אני עונה אישית לכל פנייה — לא בוט ולא מוקד —
            ואחזור אליכם <strong className="font-bold text-foreground">תוך 24 שעות</strong> עם כיוון ראשון לפרויקט.
          </p>

          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <CtaButton href={WHATSAPP} icon={MessageCircle}>
              דברו איתי בוואטסאפ
            </CtaButton>
            {BOOKING_URL && (
              <CtaButton href={BOOKING_URL} variant="ghost" icon={CalendarDays}>
                תיאום שיחה ביומן
              </CtaButton>
            )}
          </div>
          <p className="mt-5 text-[13px] text-muted-ink">
            {BOOKING_URL ? "בוואטסאפ אני בדרך כלל מהיר יותר" : "בוואטסאפ אני בדרך כלל מהיר יותר מבמייל"}
          </p>
        </section>

        {/* ── מה קורה עכשיו ── */}
        <section className="mt-[clamp(72px,11vh,128px)]">
          <div className="mb-12 flex items-center gap-5">
            <h2 className="shrink-0 font-display text-[clamp(21px,2.6vw,29px)] font-bold tracking-[-0.02em]">
              מה קורה עכשיו
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-gold/25 to-transparent" />
          </div>

          <ol className="grid gap-x-9 gap-y-11 md:grid-cols-3">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="group relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.06] font-display text-[15px] font-bold text-gold transition-[box-shadow,transform] duration-500 ease-cinematic group-hover:-translate-y-0.5 group-hover:shadow-[0_0_26px_hsl(var(--gold)/0.35)]">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-gold/20 to-transparent md:block" />
                </div>
                <h3 className="mt-6 text-[17.5px] font-bold text-foreground">{title}</h3>
                <p className="mt-2.5 text-[15px] leading-[1.9] text-ink-3">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── עבודות ── */}
        <section className="mt-[clamp(72px,11vh,128px)]">
          <div className="mb-12 flex flex-wrap items-center gap-5">
            <h2 className="shrink-0 font-display text-[clamp(21px,2.6vw,29px)] font-bold tracking-[-0.02em]">
              בינתיים, כמה עבודות
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-gold/25 to-transparent" />
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 text-[14px] text-ink-3 transition-colors hover:text-gold"
            >
              לתיק המלא
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-cinematic group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WORK.map((w) => (
              <Link
                key={w.title}
                to="/"
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card transition-[transform,border-color,box-shadow] duration-500 ease-cinematic hover:-translate-y-1.5 hover:border-gold/30 hover:shadow-[0_30px_70px_-32px_hsl(0_0%_0%/0.9)]"
              >
                <img
                  src={w.img}
                  alt={w.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-cinematic group-hover:scale-[1.06]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_38%,hsl(225_29%_3%/0.92))]"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-display text-[17px] font-bold tracking-[0.02em] text-foreground">{w.title}</p>
                  <p className="mt-1 text-[12.5px] text-ink-3">{w.tag}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── סיום ── */}
        <footer className="mt-[clamp(72px,11vh,128px)] border-t border-foreground/10 pt-9">
          <div className="flex flex-wrap items-center justify-between gap-5 text-[14px] text-ink-3">
            <Link to="/" className="transition-colors hover:text-gold">
              ← חזרה לאתר
            </Link>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
              <a href={`tel:${SITE.phoneIntl}`} dir="ltr" className="transition-colors hover:text-gold">
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.contactEmail}`} dir="ltr" className="transition-colors hover:text-gold">
                {SITE.contactEmail}
              </a>
            </div>
          </div>
          <LegalNav className="mt-7 text-[13px] text-ink-3" />
        </footer>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/thank-you")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name.slice(0, 60) : "",
    type: typeof search.type === "string" ? search.type.slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "תודה · סטודיו אבי" },
      { name: "description", content: "הפנייה שלכם התקבלה. אחזור אליכם תוך 24 שעות עם כיוון ראשון לפרויקט." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ThankYou,
});
