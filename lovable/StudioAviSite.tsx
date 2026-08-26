/* ==========================================================================
   סטודיו אבי — אתר תיק עבודות קולנועי
   הומר מ-HTML/Canvas סטטי ל-React + Tailwind.
   שינוי ארכיטקטוני מהותי: מנוע רצפי-התמונות (1,162 קבצי WebP, 52MB) הוחלף
   ב-<video> — הרצפים נוגנו לינארית עם callback בסיום, בדיוק מה ש-<video>
   עושה נייטיב. התוצאה: ~33MB במקום 52MB, טעינה בזרימה במקום preload מלא.
   ========================================================================== */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ========================== תוכן ========================== */

const TOTAL_PAGES = 9;
const CONTACT_EMAIL = "avidigmi14@gmail.com";
const WHATSAPP = "https://wa.me/972556696675";

type Act = {
  n: 1 | 2 | 3;
  eyebrow?: string;
  lines: [string, string];
  lede: React.ReactNode;
  cta: string;
  hint?: string;
  clip: string;
};

const ACTS: Act[] = [
  {
    n: 1,
    lines: ["אני בונה אתרים", "שלא מהעולם הזה"],
    lede: (
      <>
        בזמן שהמתחרים שלכם בוחרים תבנית — <strong className="font-bold text-foreground">אתם נכנסים דרך שער</strong>.
        חוויות גלילה קולנועיות, עולמות תלת מימד ואנימציה שמספרות סיפור. אתרים שאנשים זוכרים, לא רק גוללים.
      </>
    ),
    cta: "פתחו את השער",
    hint: "לחץ כאן ונצא לדרך",
    clip: "s2",
  },
  {
    n: 2,
    eyebrow: "הבידול",
    lines: ["אתר רגיל מציג מידע.", "אתר שלי מייצר תחושה."],
    lede: (
      <>
        לקוח שוכח מה כתוב באתר תוך שנייה — הוא לא שוכח איך האתר גרם לו להרגיש. כל פרויקט נבנה מאפס, כולל עולם
        תלת מימד ותנועה משלו: <strong className="font-bold text-foreground">בלי ערכות עיצוב, בלי תבניות</strong>, בלי עוד אתר כמו כולם.
      </>
    ),
    cta: "התקדמו אל הארמון",
    clip: "s3",
  },
  {
    n: 3,
    eyebrow: "הכניסה",
    lines: ["מאחורי הדלת הזו", "נמצא המותג שלכם"],
    lede: (
      <>
        עיצוב, קוד, תלת מימד וביצועים — הכול תחת גג אחד. התוצאה: אתר שנטען מהר, מדורג בגוגל, וממיר מבקרים
        ללקוחות בלי לוותר על שום רושם.
      </>
    ),
    cta: "היכנסו פנימה",
    clip: "s4",
  },
];

const PROJECTS = [
  {
    no: "01",
    href: "https://tayargroup.com/",
    img: "/img/covers/tayar.jpg",
    alt: "קאבר פרויקט טאיאר — אתר תדמית לחברת פתרונות ניקיון",
    title: "טאיאר · פתרונות ניקיון",
    body: "אתר תדמית B2B בעברית מלאה, שנבנה כדי להפוך גולשים ללידים: כותרת ראשית על גבי צילומי נכסים, תפריט צף ומסלול פנייה כפול — ייעוץ מקצועי או צפייה בשירותים.",
    tag: "תדמית · B2B",
  },
  {
    no: "02",
    href: "https://projects.avidigmi.com/business-consultant/",
    img: "/img/covers/dominic.webp",
    alt: "קאבר פרויקט דומיניק — דף נחיתה למותג אישי",
    title: "דומיניק · מיתוג אישי",
    body: "דף נחיתה למותג אישי שממקם את האדם, לא את רשימת השירותים, במרכז: צילום סטודיו במסך מלא, ניגודיות גבוהה וטיפוגרפיה נקייה שמעבירות אמינות כבר בפגישה הראשונה עם הגולש.",
    tag: "מיתוג אישי · Landing Page",
  },
  {
    no: "03",
    href: "https://timingwatches.co.il/home/",
    img: "/img/covers/timing.jpg",
    alt: "קאבר פרויקט טיימינג — קטלוג שעוני יוקרה",
    title: "טיימינג · שעוני יוקרה",
    body: "קטלוג בוטיק לשעונים מכניים שגורם למסך להרגיש כמו ויטרינה: צילומי מאקרו בפריים רחב, גלילה איטית ופרטים שנחשפים בהדרגה — תחושת חנות יוקרה, לא טבלת מוצרים.",
    tag: "מסחר · קטלוג יוקרה",
  },
];

const SKILLS = [
  { b: "עיצוב", s: "שפה חזותית, טיפוגרפיה עברית, מערכת מסכים" },
  { b: "פיתוח", s: "HTML · CSS · JavaScript, בלי תלות בתבניות" },
  { b: "תלת מימד", s: "מידול, תאורה ורינדור — עולמות תלת ממדיים שרצים חלק בדפדפן", accent: "dim" as const },
  { b: "אנימציה", s: "גלילה, רצפי תמונות, מעברים מבוססי תנועה" },
  { b: "ביצועים", s: "מהירות טעינה, נגישות, SEO טכני" },
];

const SERVICES = [
  { num: "01", h: "אתרי תדמית קולנועיים", p: "חוויית גלילה עם וידאו מפורק לפריימים, אנימציות מבוססות תנועה וסיפור שמתגלה שלב אחרי שלב — כמו סרט קצר על המותג שלכם." },
  { num: "02", h: "עולמות תלת מימד", p: "סצנות ואובייקטים תלת ממדיים בזמן אמת בתוך הדפדפן — לוגו שמסתובב, מוצר שאפשר לסובב, סצנה שמגיבה לגלילה. לא סרטון, אתר שחי.", accent: "dim" as const },
  { num: "03", h: "דפי נחיתה שממירים", p: "עיצוב שמושך את העין ומבנה שמוביל ללחיצה. מהירות, בהירות ומסר אחד חד — בלי הסחות דעת, לקמפיינים שצריכים להמיר מהיום הראשון." },
  { num: "04", h: "חנויות ומערכות", p: "מסחר אונליין, אזורים אישיים וממשקי ניהול. פונקציונליות מלאה בעטיפה שלא נראית כמו תבנית." },
  { num: "05", h: "מיתוג דיגיטלי מלא", p: "שפה חזותית, טיפוגרפיה עברית, מוטיבים, אנימציה ותלת מימד — מערכת שלמה שעובדת בכל מסך ובכל מדיה." },
];

const STATS = [
  { b: "100%", s: "קוד בהתאמה אישית" },
  { b: "1.2s", s: "זמן טעינה ממוצע" },
  { b: "∞", s: "גבול לדמיון" },
];

const STEPS = [
  { n: "01", h: "שיחת גילוי", p: "מבינים את המותג, הקהל והמטרה. יוצאים עם כיוון יצירתי אחד ברור." },
  { n: "02", h: "קונספט ועיצוב", p: "מסך ראשון שמכריע. מכאן בונים שפה שלמה — כולל עולם תלת מימד כשרלוונטי — לכל שאר האתר." },
  { n: "03", h: "פיתוח ואנימציה", p: "קוד נקי, אנימציית תנועה ותלת מימד אינטראקטיבי, אופטימיזציה לנייד ולמנועי חיפוש." },
  { n: "04", h: "שיגור וליווי", p: "עולים לאוויר, מודדים, משפרים. אתם לא נשארים לבד אחרי המסירה." },
];

const FAQ = [
  { q: "כמה עולה אתר כזה?", a: "אין מחירון אחיד, כי אין שני פרויקטים זהים. אתר תדמית מתחיל בדרך כלל באזור 8,000 ₪, וחוויה קולנועית מלאה עם עולם תלת מימד, רצפי תמונות ואנימציה נעה בטווח גבוה יותר. אחרי שיחה אחת קצרה תקבלו הצעת מחיר מפורטת, ללא עלות וללא התחייבות." },
  { q: "כמה זמן לוקח לבנות?", a: "דף נחיתה — שבועיים עד שלושה. אתר תדמית מלא — ארבעה עד שמונה שבועות, תלוי בכמות התוכן ובהיקף האנימציה. אני עובד על מספר פרויקטים מצומצם במקביל, כך שלוח הזמנים שנקבע בהתחלה הוא זה שנשמר." },
  { q: "האם האתר יהיה מהיר גם עם כל האנימציות?", a: "כן — זה בדיוק העניין. הכול נכתב ידנית בלי ספריות מיותרות ובלי בילדרים, אלמנטים תלת ממדיים נטענים ומותאמים במשקל הנכון למסך, התמונות נשלחות בפורמט WebP במידה המדויקת, והחוויות הכבדות נטענות ברקע בזמן שאתם כבר קוראים. האתר הזה עצמו נטען בכ-1.2 שניות." },
  { q: "אני יכול לערוך את התוכן בעצמי אחר כך?", a: "בהחלט. אם זה חשוב לכם, אני מחבר את האתר למערכת ניהול תוכן פשוטה שמאפשרת לעדכן טקסטים, תמונות ופרויקטים בלי לגעת בקוד. אם אתם מעדיפים שאני אטפל בעדכונים — יש גם מסלול ליווי חודשי." },
  { q: "למי שייך האתר בסוף?", a: "לכם. הקוד, העיצוב, הדומיין והחשבונות רשומים על שמכם ומועברים אליכם במסירה. אין נעילה לפלטפורמה שלי ואין דמי שימוש חודשיים כדי שהאתר פשוט ימשיך לעבוד." },
];

const MENU = [
  { p: 1, name: "פתיחה", note: "מסך הכניסה" },
  { p: 2, name: "הבידול", note: "למה זה שונה" },
  { p: 3, name: "הכניסה", note: "אל מאחורי הדלת" },
  { p: 4, name: "פרויקטים", note: "הפורטפוליו" },
  { p: 5, name: "אודות", note: "מי עומד מאחורי זה" },
  { p: 6, name: "שירותים", note: "מה אני בונה" },
  { p: 7, name: "תהליך", note: "איך זה עובד" },
  { p: 8, name: "שאלות נפוצות", note: "מחיר, זמנים, בעלות" },
  { p: 9, name: "יצירת קשר", note: "הצעד האחרון" },
];

/* ========================== עזרים ========================== */

const pad = (n: number) => String(n).padStart(2, "0");

/** האם המכשיר תומך בריחוף עכבר אמיתי — כל אפקטי הסמן מגודרים מאחורי זה */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover:hover) and (pointer:fine)");
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

function useReducedMotion() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setCalm(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return calm;
}

/** חשיפה בגלילה — מחליף את מנגנון ה-.rv/.in המקורי */
function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const calm = useReducedMotion();

  useEffect(() => {
    if (calm) return setSeen(true);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [calm]);

  return (
    <Tag
      ref={ref as never}
      className={cn(
        "transition-[opacity,transform] duration-[1100ms] ease-cinematic",
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        className
      )}
      style={{ transitionDelay: seen ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/* ========================== סמל המותג ========================== */
/* מוח קווי לבן — שתי המיספרות עם קווי מתאר מפורצים, בקע אורכי ושתי פאות
   תלת-ממדיות. לבן מלא, בלי צבע מותג, בשפת הרפרנס. */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("block h-full w-full overflow-visible", className)}
    >
      <path d="M20 5C16 4 12 6 11.5 10C8 10.5 7 14 8.5 17C6.5 19 7 23 9.5 24.5C9.5 28 13 30.5 16.5 30C17.5 31 19 31.5 20 31.5" />
      <path d="M20 5C24 4 28 6 28.5 10C32 10.5 33 14 31.5 17C33.5 19 33 23 30.5 24.5C30.5 28 27 30.5 23.5 30C22.5 31 21 31.5 20 31.5" />
      <path d="M20 5V31.5" />
      <path d="M11.5 10L20 15L28.5 10" className="opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <path d="M8.5 17L20 22L31.5 17" className="opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
    </svg>
  );
}

/* ========================== כפתור קולנועי ========================== */
/* כפתור המותג — גרדיאנט זהב, ברק חולף ואפקט מגנטי. מכוון לא להיות shadcn Button:
   הווריאנטים שלו נלחמים בעיצוב הבספוק הזה. */
function CineButton({
  children,
  onClick,
  disabled,
  loading,
  loadingText = "טוען···",
  variant = "main",
  full,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: "main" | "ghost";
  full?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const fine = useFinePointer();

  const onMove = (e: React.PointerEvent) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.16;
    const y = (e.clientY - r.top - r.height / 2) * 0.28;
    ref.current.style.transform = `translate(${x}px, ${y - 3}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group relative isolate inline-flex min-h-[58px] items-center justify-center gap-2.5 overflow-hidden rounded-full px-9",
        "text-[15px] font-bold tracking-[0.03em] transition-[transform,box-shadow,background,color,border-color] duration-500 ease-cinematic",
        variant === "main" && [
          "border border-transparent text-ink-inverse",
          "bg-[linear-gradient(102deg,hsl(var(--gold-hi))_0%,hsl(var(--gold))_46%,hsl(var(--gold-dp))_100%)]",
          "shadow-[0_14px_40px_-14px_hsl(var(--gold)/0.75),inset_0_1px_0_hsl(0_0%_100%/0.6)]",
          "hover:shadow-[0_24px_60px_-16px_hsl(var(--gold)/0.95),inset_0_1px_0_hsl(0_0%_100%/0.75)]",
          "disabled:cursor-progress disabled:bg-none disabled:bg-gold/20 disabled:text-gold-hi disabled:shadow-none disabled:border-gold/20",
        ],
        variant === "ghost" && [
          "border border-foreground/25 bg-stage/60 text-foreground backdrop-blur-md",
          "hover:border-gold hover:bg-gold/15 hover:shadow-[0_18px_44px_-20px_hsl(0_0%_0%/0.9)]",
        ],
        full && "w-full",
        "max-md:w-full",
        className
      )}
    >
      {/* ברק חולף */}
      {variant === "main" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] -translate-x-[130%] bg-[linear-gradient(110deg,transparent_36%,hsl(0_0%_100%/0.75)_50%,transparent_64%)] transition-transform duration-1000 ease-cinematic group-hover:translate-x-[130%]"
        />
      )}
      <span className={cn("relative z-[2] transition", loading && "-translate-y-2.5 opacity-0")}>{children}</span>
      {loading && (
        <span className="absolute inset-0 z-[2] flex items-center justify-center text-[13px] tracking-[0.22em]">{loadingText}</span>
      )}
    </button>
  );
}

/* ========================== המסך הקולנועי ========================== */

function Stage({
  clip,
  loop,
  onEnded,
  dim,
  small,
}: {
  clip: string | null;
  loop: boolean;
  onEnded?: () => void;
  dim: number;
  small: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const src = clip ? `/video/${clip}${small ? "-sm" : ""}.mp4` : undefined;

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    v.load();
    // autoplay מושתק — מותר בכל הדפדפנים
    const p = v.play();
    if (p) p.catch(() => {});
  }, [src]);

  return (
    <div className="fixed inset-0 z-0 bg-stage">
      <video
        ref={ref}
        key={src}
        src={src}
        poster={small ? "/img/poster-sm.webp" : "/img/poster.webp"}
        muted
        playsInline
        preload="auto"
        loop={loop}
        onEnded={onEnded}
        /* structural: ממלא את המסך; object-cover שומר על יחס גובה-רוחב בלי עיוות */
        className="h-full w-full object-cover"
      />

      {/* סקרים כיווני — קריאוּת לטקסט בצד ימין ובתחתית */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700 max-md:hidden"
        style={{
          background:
            "linear-gradient(to left,hsl(var(--stage)/0.94) 0%,hsl(var(--stage)/0.8) 22%,hsl(var(--stage)/0.42) 46%,hsl(var(--stage)/0.06) 68%,transparent 82%)," +
            "linear-gradient(to top,hsl(var(--stage)/0.88) 0%,hsl(var(--stage)/0.35) 26%,transparent 55%)," +
            "linear-gradient(to bottom,hsl(var(--stage)/0.72) 0%,transparent 22%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(to top,hsl(var(--stage)/0.95) 0%,hsl(var(--stage)/0.7) 32%,hsl(var(--stage)/0.25) 58%,transparent 78%)," +
            "linear-gradient(to bottom,hsl(var(--stage)/0.7) 0%,transparent 24%)",
        }}
      />

      {/* גרעין פילם */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1/2 animate-grain opacity-[0.045] motion-reduce:animate-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* ויניית */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(125% 95% at 50% 45%,transparent 30%,hsl(0 0% 0%/0.5) 75%,hsl(0 0% 0%/0.88) 100%)" }}
      />
      {/* מעמעם לפי גלילה */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-stage transition-opacity duration-500" style={{ opacity: dim }} />
    </div>
  );
}

/* ========================== מסגרת ופסים ========================== */

function CineFrame({ page, progress }: { page: number; progress: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[86] rounded-[var(--frame-r)] border border-gold/20"
      style={{ inset: "var(--frame)" }}
    >
      {[
        "top-[5px] start-[5px] border-t border-s",
        "top-[5px] end-[5px] border-t border-e",
        "bottom-[5px] start-[5px] border-b border-s",
        "bottom-[5px] end-[5px] border-b border-e",
      ].map((c, i) => (
        <span key={i} className={cn("absolute h-[18px] w-[18px] border-gold-hi opacity-55 max-md:h-3 max-md:w-3", c)} />
      ))}

      <span className="absolute top-1/2 start-3 -translate-y-1/2 whitespace-nowrap text-[9.5px] uppercase tracking-[0.34em] text-muted-ink [writing-mode:vertical-rl] max-md:hidden">
        סטודיו אבי — EST. 2026
      </span>
      <span className="absolute top-1/2 end-3 -translate-y-1/2 rotate-180 whitespace-nowrap text-[9.5px] uppercase tracking-[0.34em] text-ink-3 [writing-mode:vertical-rl] max-md:hidden">
        PAGE {pad(page)} OF {pad(TOTAL_PAGES)}
      </span>

      <div className="absolute -top-px inset-x-[-1px] h-0.5 overflow-hidden rounded-t-[var(--frame-r)]">
        <div
          className="h-full bg-[linear-gradient(90deg,hsl(var(--dim)),hsl(var(--gold)))] shadow-[0_0_20px_hsl(var(--gold))] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ========================== ראש ותחתית ========================== */

function TopRail({
  scrolled,
  showSkip,
  menuOpen,
  onSkip,
  onMenu,
  onLogo,
}: {
  scrolled: boolean;
  showSkip: boolean;
  menuOpen: boolean;
  onSkip: () => void;
  onMenu: () => void;
  onLogo: () => void;
}) {
  return (
    <header
      className="fixed z-[92] flex items-center justify-between gap-5"
      style={{ insetInline: "calc(var(--frame) + clamp(14px,2.4vw,30px))", top: "calc(var(--frame) + 15px)" }}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -z-10 h-[170px] transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
        style={{
          insetInline: "calc(-1 * (var(--frame) + clamp(14px,2.4vw,30px)))",
          top: "calc(-1 * (var(--frame) + 15px))",
          background: "linear-gradient(hsl(var(--stage)/0.82),hsl(var(--stage)/0.34) 46%,transparent)",
        }}
      />
      <button onClick={onLogo} aria-label="סטודיו אבי — לראש העמוד" className="group inline-flex items-center gap-3 text-foreground">
        <span className="h-[30px] w-[30px] shrink-0 text-foreground transition-[filter] duration-500 max-md:h-[26px] max-md:w-[26px] [filter:drop-shadow(0_0_14px_hsl(var(--foreground)/0.28))] group-hover:[filter:drop-shadow(0_0_20px_hsl(var(--foreground)/0.45))]">
          <BrandMark />
        </span>
        <span className="font-display text-[12.5px] font-bold tracking-[0.12em] max-md:text-[10.5px]">סטודיו אבי</span>
      </button>

      <div className="flex items-center gap-[18px] max-md:gap-2.5">
        {showSkip && (
          <button
            onClick={onSkip}
            className="group relative px-0.5 py-2.5 text-[12.5px] tracking-[0.08em] text-ink-3 transition-colors hover:text-gold"
          >
            דלגו לאתר
            <span className="absolute inset-x-0.5 bottom-1.5 h-px origin-right scale-x-0 bg-gold transition-transform duration-500 ease-cinematic group-hover:scale-x-100" />
          </button>
        )}
        <button
          onClick={onMenu}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          className="inline-flex items-center gap-3 rounded-full border border-gold/20 bg-stage/55 px-[18px] py-2.5 text-[12.5px] tracking-[0.14em] text-ink-2 backdrop-blur-md transition-colors hover:border-gold hover:bg-gold/10 hover:text-foreground max-md:gap-2 max-md:px-3.5 max-md:py-2 max-md:text-[11.5px]"
        >
          <span>תפריט</span>
          <span aria-hidden className="relative h-2.5 w-4">
            <i
              className={cn(
                "absolute h-px bg-current transition-all duration-500 ease-cinematic",
                menuOpen ? "top-px w-full translate-y-1 rotate-45" : "top-px w-full"
              )}
            />
            <i
              className={cn(
                "absolute bottom-px end-0 h-px bg-current transition-all duration-500 ease-cinematic",
                menuOpen ? "w-full -translate-y-1 -rotate-45" : "w-[64%]"
              )}
            />
          </span>
        </button>
      </div>
    </header>
  );
}

function BottomRail({
  page,
  onGoto,
  showCue,
  onCue,
  hidden,
}: {
  page: number;
  onGoto: (n: number) => void;
  showCue: boolean;
  onCue: () => void;
  hidden: boolean;
}) {
  return (
    <div
      className={cn(
        "fixed z-[92] flex items-end justify-between gap-5 transition-opacity duration-300",
        hidden && "pointer-events-none opacity-0"
      )}
      style={{ insetInline: "calc(var(--frame) + clamp(14px,2.4vw,30px))", bottom: "calc(var(--frame) + 15px)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[170px] max-md:h-[190px]"
        style={{
          insetInline: "calc(-1 * (var(--frame) + clamp(14px,2.4vw,30px)))",
          bottom: "calc(-1 * (var(--frame) + 15px))",
          background: "linear-gradient(transparent,hsl(var(--stage)/0.42) 44%,hsl(var(--stage)/0.88))",
        }}
      />
      <div className="flex flex-col items-start gap-3 max-md:gap-2">
        <nav aria-label="קפיצה לעמוד" className="flex gap-[5px] max-md:gap-1" dir="ltr">
          {MENU.map((m) => (
            <button
              key={m.p}
              onClick={() => onGoto(m.p)}
              aria-label={`עמוד ${m.p} · ${m.name}`}
              aria-current={page === m.p ? "true" : undefined}
              className={cn(
                "h-[3px] rounded-sm transition-all duration-300 ease-cinematic",
                page === m.p
                  ? "w-7 bg-[linear-gradient(90deg,hsl(var(--gold-hi)),hsl(var(--gold-dp)))] shadow-[0_0_12px_hsl(var(--gold)/0.55)] max-md:w-5"
                  : "w-[15px] bg-foreground/20 hover:bg-gold/60 max-md:w-[11px]"
              )}
            />
          ))}
        </nav>
        <div className="flex items-end gap-2.5" dir="ltr" aria-live="polite">
          <span className="bg-[linear-gradient(180deg,hsl(var(--gold-hi)),hsl(var(--gold-dp)))] bg-clip-text font-display text-[clamp(28px,3.1vw,42px)] font-bold leading-[0.84] text-transparent">
            {pad(page)}
          </span>
          <span aria-hidden className="mb-[7px] h-px w-[13px] -rotate-[62deg] bg-gold/20" />
          <span className="mb-0.5 font-display text-[13px] font-bold leading-none text-ink-3">{pad(TOTAL_PAGES)}</span>
        </div>
      </div>

      {showCue && (
        <button
          onClick={onCue}
          aria-label="גללו למטה"
          className="absolute left-1/2 bottom-0 inline-flex -translate-x-1/2 animate-cue-float items-center gap-3 whitespace-nowrap rounded-full border border-gold/55 bg-stage/70 py-3 pe-[18px] ps-[22px] text-[13.5px] tracking-[0.08em] text-gold-hi backdrop-blur-lg transition-colors hover:border-gold hover:bg-gold/15 motion-reduce:animate-none max-md:gap-2 max-md:px-4 max-md:py-2.5 max-md:text-[12.5px]"
        >
          <span className="relative h-[30px] w-[19px] shrink-0 rounded-[11px] border-[1.6px] border-gold max-md:hidden">
            <i className="absolute left-1/2 top-1.5 h-1.5 w-[3px] -translate-x-1/2 rounded-sm bg-gold" />
          </span>
          <span>גללו למטה</span>
          <ArrowDown className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function MenuOverlay({ open, page, onGoto }: { open: boolean; page: number; onGoto: (n: number) => void }) {
  return (
    <nav
      id="site-menu"
      aria-label="תפריט עמודים"
      {...(!open && { inert: "" as never })}
      className={cn(
        "fixed inset-0 z-[84] flex items-center px-[var(--gut)] backdrop-blur-2xl transition-[opacity,visibility] duration-500 ease-cinematic",
        "bg-[linear-gradient(180deg,hsl(var(--stage)/0.955),hsl(var(--stage)/0.99))]",
        open ? "visible opacity-100" : "invisible opacity-0"
      )}
      style={{ paddingBlock: "calc(var(--frame) + 104px)" }}
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
          עמודי האתר
          <span className="h-px max-w-[70px] flex-1 bg-gold/20" />
        </p>
        <ol className="mt-[clamp(22px,3vw,38px)] border-t border-foreground/10">
          {MENU.map((m, i) => (
            <li
              key={m.p}
              className={cn(
                "border-b border-foreground/10 transition-[opacity,transform] duration-700 ease-cinematic",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
              style={{ transitionDelay: open ? `${i * 60 + 100}ms` : "0ms" }}
            >
              <button
                onClick={() => onGoto(m.p)}
                className="group flex w-full items-baseline gap-[clamp(16px,2.6vw,34px)] px-1 py-[clamp(13px,1.7vw,21px)] text-start text-foreground transition-[color,padding] duration-500 ease-cinematic hover:text-gold hover:ps-[22px]"
              >
                <span className="min-w-8 shrink-0 font-display text-xs font-bold tracking-[0.26em] text-gold max-md:min-w-[26px] max-md:text-[11px]" dir="ltr">
                  {pad(m.p)}
                </span>
                <span className={cn("font-display text-[clamp(26px,4.4vw,54px)] font-bold leading-[1.1] tracking-[-0.02em]", page === m.p && "text-gold")}>
                  {m.name}
                </span>
                <span className="ms-auto text-[12.5px] tracking-[0.1em] text-ink-3 max-md:hidden">{m.note}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-[clamp(26px,3.4vw,44px)] flex flex-wrap gap-x-[30px] gap-y-3.5">
          <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="border-b border-gold/20 pb-1.5 text-sm tracking-[0.06em] text-ink-2 transition-colors hover:border-gold hover:text-gold">
            {CONTACT_EMAIL}
          </a>
          <a href={WHATSAPP} target="_blank" rel="noopener" className="border-b border-gold/20 pb-1.5 text-sm tracking-[0.06em] text-ink-2 transition-colors hover:border-gold hover:text-gold">
            וואטסאפ
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ========================== כרטיס פרויקט ========================== */

function ProjectCard({ p, i, compact }: { p: (typeof PROJECTS)[number]; i: number; compact: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const fine = useFinePointer();
  const calm = useReducedMotion();
  const [tilting, setTilting] = useState(false);

  const onMove = (e: React.PointerEvent) => {
    if (!fine || calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
    ref.current.style.transform = `translateY(-16px) perspective(900px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg)`;
  };
  const onLeave = () => {
    setTilting(false);
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };

  return (
    <article
      className={cn("group relative", !compact && i === 1 && "md:mt-[clamp(0px,4vw,52px)]", !compact && i === 2 && "md:mt-[clamp(0px,8vw,104px)]")}
    >
      <a
        ref={ref}
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`צפייה באתר ${p.title} — נפתח בלשונית חדשה`}
        onPointerEnter={() => setTilting(true)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          "relative block overflow-hidden rounded-2xl border border-gold/20 text-inherit no-underline",
          "shadow-[0_50px_110px_-40px_hsl(0_0%_0%/0.95),0_0_90px_-30px_hsl(var(--dim)/0.3)]",
          "hover:border-gold/55 hover:shadow-[0_70px_130px_-40px_hsl(0_0%_0%/1),0_0_130px_-24px_hsl(var(--gold)/0.45)]",
          tilting ? "transition-transform duration-150 ease-out" : "animate-float transition-transform duration-700 ease-cinematic motion-reduce:animate-none",
          "[--mx:50%] [--my:42%]"
        )}
        style={{ animationDelay: `${i * -2.6}s` }}
      >
        <span className="absolute end-[18px] top-4 z-[3] rounded-full border border-gold/20 bg-stage/55 px-3 py-1.5 font-display text-xs tracking-[0.2em] text-gold-hi backdrop-blur" dir="ltr">
          {p.no}
        </span>
        {/* content: יחס גובה-רוחב נעול, object-cover — לעולם לא נמתח */}
        <img src={p.img} alt={p.alt} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-cinematic group-hover:scale-[1.06]" />
        {/* ספוטלייט עוקב-סמן */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-400 group-hover:opacity-100"
          style={{ background: "radial-gradient(280px circle at var(--mx) var(--my),hsl(var(--gold)/0.32),transparent 72%)" }}
        />
        {/* ברק חולף */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] -translate-x-[130%] bg-[linear-gradient(115deg,transparent_42%,hsl(0_0%_100%/0.2)_50%,transparent_58%)] transition-transform duration-[1200ms] ease-cinematic group-hover:translate-x-[130%]"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,hsl(var(--stage)/0.72))]" />
        <span className="absolute bottom-4 start-[18px] z-[3] inline-flex translate-y-2.5 items-center gap-2 rounded-full bg-[linear-gradient(102deg,hsl(var(--gold-hi)),hsl(var(--gold)))] px-4 py-2.5 text-[12.5px] tracking-[0.06em] text-ink-inverse opacity-0 shadow-[0_12px_30px_-12px_hsl(0_0%_0%/0.9)] transition-[opacity,transform] duration-500 ease-cinematic group-hover:translate-y-0 group-hover:opacity-100">
          צפייה באתר <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </a>

      {!compact && (
        <div className="px-1 pt-7 [&_*]:[text-shadow:0_2px_22px_hsl(var(--stage)/0.92),0_1px_4px_hsl(var(--stage)/0.7)]">
          <h3 className="font-display text-[22px] font-bold tracking-[-0.01em]">{p.title}</h3>
          <p className="mt-3.5 text-[15.5px] leading-[1.85] text-ink-2">{p.body}</p>
          <span className="mt-5 inline-flex rounded-full border border-gold/20 px-4 py-2 text-[11px] tracking-[0.2em] text-gold">{p.tag}</span>
        </div>
      )}
    </article>
  );
}

/* ========================== כרטיס עם ספוטלייט ========================== */

function SpotlightCard({
  children,
  accent = "gold",
  className,
}: {
  children: React.ReactNode;
  accent?: "gold" | "dim";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const v = accent === "dim" ? "var(--dim)" : "var(--gold)";

  const onMove = (e: React.PointerEvent) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.removeProperty("--mx");
    ref.current?.style.removeProperty("--my");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "group/card relative bg-[hsl(222_27%_4%/0.66)] backdrop-blur-lg transition-[background,transform] duration-500 ease-cinematic",
        "hover:-translate-y-1 [--mx:50%] [--my:50%]",
        className
      )}
      style={{ ["--accent" as string]: v }}
    >
      {/* קו מבטא אנכי */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 z-[1] w-px origin-top scale-y-0 transition-transform duration-700 ease-cinematic group-hover/card:scale-y-100"
        style={{ background: `linear-gradient(hsl(${v}),transparent)` }}
      />
      {/* ספוטלייט */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover/card:opacity-100"
        style={{ background: `radial-gradient(260px circle at var(--mx) var(--my),hsl(${v}/0.16),transparent 72%)` }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

/* ========================== הקומפוננטה הראשית ========================== */

type Phase = "acts" | "gate" | "open";

export default function StudioAviSite() {
  const calm = useReducedMotion();
  const [small, setSmall] = useState(false);
  const [phase, setPhase] = useState<Phase>("acts");
  const [act, setAct] = useState<1 | 2 | 3>(1);
  const [page, setPage] = useState(1);
  const [clip, setClip] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCue, setShowCue] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dim, setDim] = useState(0);
  const [blink, setBlink] = useState(false);
  const onEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* נעילת גלילה בזמן הפתיח / התפריט */
  useEffect(() => {
    const locked = phase !== "open" || menuOpen;
    document.body.classList.toggle("is-locked", locked);
    return () => document.body.classList.remove("is-locked");
  }, [phase, menuOpen]);

  /* העדפת תנועה מופחתת — דילוג ישיר לאתר */
  useEffect(() => {
    if (calm && phase === "acts") {
      setPhase("open");
      setClip("s6");
      setPage(4);
      setDim(0.58);
    }
  }, [calm, phase]);

  const playClip = useCallback((name: string, onEnd: () => void) => {
    setPlaying(true);
    onEndRef.current = onEnd;
    setClip(name);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    const fn = onEndRef.current;
    onEndRef.current = null;
    fn?.();
  }, []);

  /* מעבר בין המערכות */
  const advance = useCallback(() => {
    const a = ACTS[act - 1];
    playClip(a.clip, () => {
      if (act < 3) {
        const next = (act + 1) as 2 | 3;
        setAct(next);
        setPage(next);
      } else {
        setPhase("gate");
        setPage(4);
        setDim(0.3);
      }
    });
  }, [act, playClip]);

  /* יציאה מהשער אל האתר המלא */
  const leaveGate = useCallback(() => {
    setPhase("acts");
    playClip("s5", () => {
      setPhase("open");
      setClip("s6");
      setShowCue(true);
    });
  }, [playClip]);

  /* ניווט חופשי עם מצמוץ שחור */
  const jumpTo = useCallback(
    (n: number) => {
      n = Math.max(1, Math.min(TOTAL_PAGES, n));
      setBlink(true);
      window.setTimeout(() => {
        setMenuOpen(false);
        if (n <= 3) {
          setPhase("acts");
          setAct(n as 1 | 2 | 3);
          setClip(n === 1 ? null : ACTS[n - 2].clip);
          setPlaying(false);
          setDim(0);
          setShowCue(false);
        } else {
          setPhase("open");
          setClip("s6");
          window.requestAnimationFrame(() => {
            const el = document.getElementById(MENU[n - 1].name === "פרויקטים" ? "projects" : SECTION_IDS[n] ?? "projects");
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "auto" });
          });
        }
        setPage(n);
        window.setTimeout(() => setBlink(false), 16);
      }, 150);
    },
    []
  );

  /* גלילה: מונה עמודים, פס התקדמות, עמעום */
  useEffect(() => {
    if (phase !== "open") return;
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
      setScrolled(y > 40);
      if (y > 60) setShowCue(false);
      setDim(Math.max(calm ? 0.58 : 0, Math.min(0.84, (y / (window.innerHeight * 0.75)) * 0.84)));

      const mid = window.innerHeight / 2;
      let best = 4;
      let bestDist = Infinity;
      for (const [n, id] of Object.entries(SECTION_IDS)) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          best = +n;
          break;
        }
        const d = r.top > mid ? r.top - mid : mid - r.bottom;
        if (d < bestDist) {
          bestDist = d;
          best = +n;
        }
      }
      setPage(best);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, calm]);

  const activeAct = ACTS[act - 1];

  return (
    <div dir="rtl" className="relative min-h-[100dvh] bg-background text-foreground">
      <Stage clip={clip} loop={clip === "s6"} onEnded={handleEnded} dim={dim} small={small} />

      {/* מצמוץ מעבר */}
      <div
        aria-hidden
        className={cn("pointer-events-none fixed inset-0 z-[200] bg-black", blink ? "opacity-100 duration-[130ms]" : "opacity-0 duration-[160ms]")}
      />

      <CineFrame page={page} progress={progress} />
      <TopRail
        scrolled={scrolled}
        showSkip={phase !== "open"}
        menuOpen={menuOpen}
        onSkip={() => jumpTo(4)}
        onMenu={() => setMenuOpen((v) => !v)}
        onLogo={() => jumpTo(1)}
      />
      <BottomRail page={page} onGoto={jumpTo} showCue={showCue && phase === "open"} onCue={() => window.scrollTo({ top: window.scrollY + window.innerHeight * 0.9, behavior: "smooth" })} hidden={menuOpen} />
      <MenuOverlay open={menuOpen} page={page} onGoto={jumpTo} />

      {/* ====== המערכות (1–3) ====== */}
      {phase === "acts" && (
        <div className="pointer-events-none fixed inset-0 z-30">
          <section
            key={act}
            className="absolute inset-0 grid content-end justify-items-start px-[var(--gut)] pb-[clamp(124px,16vh,172px)] max-md:pb-[clamp(152px,20vh,196px)]"
          >
            <div className="pointer-events-auto max-w-[min(720px,68vw)] max-lg:max-w-full">
              {activeAct.eyebrow && (
                <p className="mb-5 flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
                  {activeAct.eyebrow}
                  <span className="h-px max-w-[70px] flex-1 bg-gold/20" />
                </p>
              )}
              <h1
                className={cn(
                  "animate-rise-in font-display font-bold leading-[1.02] tracking-[-0.015em] [text-wrap:balance] motion-reduce:animate-none",
                  act === 1 ? "text-[clamp(40px,6.8vw,92px)]" : "text-[clamp(34px,5vw,70px)]"
                )}
                style={{ animationDelay: "0.25s", opacity: calm ? 1 : undefined }}
              >
                <span className="block overflow-hidden py-[0.14em] -my-[0.14em]">
                  <span className="block [text-shadow:0_6px_44px_hsl(0_0%_0%/0.9),0_2px_10px_hsl(0_0%_0%/0.6)]">{activeAct.lines[0]}</span>
                </span>
                <span className="block overflow-hidden py-[0.14em] -my-[0.14em]">
                  <span className="block bg-[linear-gradient(96deg,hsl(var(--gold-dp))_4%,hsl(var(--gold-hi))_42%,hsl(var(--gold))_78%)] bg-clip-text text-transparent [filter:drop-shadow(0_4px_30px_hsl(var(--gold)/0.35))]">
                    {activeAct.lines[1]}
                  </span>
                </span>
              </h1>

              <p
                className="mt-7 max-w-[50ch] animate-rise-in text-[clamp(15.5px,1.35vw,18.5px)] leading-[1.9] text-ink-2 [text-shadow:0_2px_18px_hsl(0_0%_0%/0.9)] motion-reduce:animate-none max-md:mt-[22px]"
                style={{ animationDelay: "0.5s" }}
              >
                {activeAct.lede}
              </p>

              <div className="mt-11 flex animate-rise-in flex-wrap items-center gap-x-[26px] gap-y-[18px] motion-reduce:animate-none max-md:mt-8 max-md:gap-3.5" style={{ animationDelay: "0.8s" }}>
                <CineButton onClick={advance} loading={playing} disabled={playing}>
                  {activeAct.cta}
                </CineButton>
                {activeAct.hint && <span className="text-[12.5px] tracking-[0.04em] text-ink-3 max-md:hidden">{activeAct.hint}</span>}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ====== שער הפרויקטים ====== */}
      {phase === "gate" && (
        <div className="relative z-10 grid min-h-[100dvh] content-center px-[var(--gut)] py-[clamp(74px,9vh,104px)] max-md:pb-[132px]">
          <div className="mx-auto mb-[clamp(24px,3vw,36px)] grid max-w-[720px] justify-items-center gap-5 text-center">
            <p className="flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
              <span className="h-px w-[60px] bg-gold/20" />
              הפורטפוליו
              <span className="h-px w-[60px] bg-gold/20" />
            </p>
            <h2 className="font-display text-[clamp(32px,4.8vw,64px)] font-bold leading-[1.08] tracking-[-0.02em]">פרויקטים אחרונים</h2>
          </div>
          <div className="mx-auto grid w-full max-w-[1080px] grid-cols-3 items-start gap-[clamp(20px,3vw,44px)] max-md:grid-cols-1 max-md:gap-8">
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.no} p={p} i={i} compact />
            ))}
          </div>
          <div className="mt-[clamp(28px,3.4vw,44px)] flex flex-col items-center gap-5 text-center max-md:fixed max-md:inset-x-[calc(var(--frame)+20px)] max-md:bottom-[calc(var(--frame)+16px)] max-md:z-[60] max-md:mt-0">
            <p className="text-base text-ink-2 max-md:hidden">זה מה שיצא מכאן. עכשיו נראה לכם איך זה נבנה.</p>
            <CineButton onClick={leaveGate} loading={playing} disabled={playing} className="min-w-[280px] max-md:min-w-0">
              המשיכו הלאה
            </CineButton>
          </div>
        </div>
      )}

      {/* ====== האתר המלא (4–9) ====== */}
      {phase === "open" && (
        <main className="relative z-10">
          <Projects />
          <About />
          <Services />
          <Stats />
          <Process />
          <Faq />
          <Contact />
          <SiteFooter onRestart={() => jumpTo(1)} />
        </main>
      )}
    </div>
  );
}

const SECTION_IDS: Record<number, string> = {
  4: "projects",
  5: "about",
  6: "services",
  7: "process",
  8: "faq",
  9: "contact",
};

/* ========================== סקשנים ========================== */

const secCls =
  "relative isolate mx-auto max-w-[1280px] px-[var(--gut)] py-[clamp(100px,15vh,180px)]";

/** סקרים מקומי — מבטיח קריאוּת מעל כל פריים וידאו, בהיר ככל שיהיה */
function SecScrim({ wide }: { wide?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 -z-10", wide ? "-inset-y-[30%]" : "-inset-y-[4%]")}
      style={{
        background:
          "radial-gradient(82% 68% at 60% 45%,hsl(var(--stage)/0.95) 0%,hsl(var(--stage)/0.86) 34%,hsl(var(--stage)/0.5) 62%,hsl(var(--stage)/0.14) 82%,transparent 92%)",
      }}
    />
  );
}

const shadowText = "[&_*]:[text-shadow:0_2px_22px_hsl(var(--stage)/0.92),0_1px_4px_hsl(var(--stage)/0.7)]";

function SecHead({ eyebrow, title, sub, center }: { eyebrow: string; title: React.ReactNode; sub?: React.ReactNode; center?: boolean }) {
  return (
    <div className={cn("mb-[clamp(56px,7vw,86px)] grid max-w-[720px] gap-[22px]", center && "mx-auto justify-items-center text-center", shadowText)}>
      <p className="flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
        {center && <span className="h-px w-[60px] bg-gold/20" />}
        {eyebrow}
        <span className={cn("h-px bg-gold/20", center ? "w-[60px]" : "max-w-[70px] flex-1")} />
      </p>
      <Reveal as="h2" className="font-display text-[clamp(32px,4.8vw,64px)] font-bold leading-[1.08] tracking-[-0.02em] [text-wrap:balance]">
        {title}
      </Reveal>
      {sub && (
        <Reveal as="p" className="max-w-[56ch] text-[16.5px] leading-[1.95] text-ink-2">
          {sub}
        </Reveal>
      )}
    </div>
  );
}

function Projects() {
  return (
    <section id="projects" className={secCls}>
      <SecScrim />
      <SecHead
        center
        eyebrow="הפורטפוליו"
        title="פרויקטים אחרונים"
        sub="שלושה מותגים שנכנסו פנימה ויצאו אחרת לגמרי. כל פרויקט נבנה בהתאמה אישית מלאה — מהרעיון הראשון ועד השורה האחרונה של הקוד, כדי להזיז מדדים, לא רק להיראות טוב."
      />
      <div className="grid grid-cols-3 items-start gap-[clamp(20px,3vw,44px)] max-md:grid-cols-1 max-md:gap-16">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.no} delay={i * 180}>
            <ProjectCard p={p} i={i} compact={false} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className={secCls}>
      <SecScrim />
      <div className="grid grid-cols-[1.15fr_0.85fr] items-start gap-[clamp(32px,5vw,80px)] max-lg:grid-cols-1 max-lg:gap-14">
        <div className={shadowText}>
          <p className="flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
            אודות
            <span className="h-px max-w-[70px] flex-1 bg-gold/20" />
          </p>
          <Reveal as="h2" className="mt-1.5 font-display text-[clamp(32px,4.8vw,64px)] font-bold leading-[1.08] tracking-[-0.02em]">
            סטודיו של איש אחד.
            <br />
            <span className="bg-[linear-gradient(96deg,hsl(var(--gold-dp))_4%,hsl(var(--gold-hi))_42%,hsl(var(--gold))_78%)] bg-clip-text text-transparent">
              וזו בדיוק הנקודה.
            </span>
          </Reveal>
          <Reveal as="p" className="mt-6 max-w-[48ch] text-[16.5px] leading-[1.95] text-ink-2">
            קוראים לי אבי, ואני מעצב ובונה אתרים כבר יותר מעשור — כולל עולמות תלת מימד ואנימציית תנועה. אין כאן מנהל
            פרויקטים שמעביר הודעות הלאה, ואין צוות שמתחלף באמצע. מי שמדבר איתכם בשיחה הראשונה הוא גם מי שכותב את
            השורה האחרונה של הקוד.
          </Reveal>
          <Reveal as="p" className="mt-6 max-w-[48ch] text-[16.5px] leading-[1.95] text-ink-2" delay={80}>
            אני לוקח מספר מצומצם של פרויקטים בכל רבעון, כי אתר שנראה אחרת מכולם לא נולד מתבנית — הוא נולד מזמן.{" "}
            <strong className="font-bold text-foreground">עיצוב, קוד, תלת מימד וביצועים</strong> יושבים אצלי באותו ראש, וזה מה שמאפשר
            לדברים להתחבר.
          </Reveal>
          <Reveal as="ul" className="mt-9 grid gap-[18px]" delay={160}>
            {["עשור בעיצוב, פיתוח ותלת מימד לאתרים", "אדם אחד מקצה לקצה — בלי תיווך", "קוד שנכתב ידנית, בלי בילדרים"].map((t) => (
              <li key={t} className="flex items-center gap-[15px] text-[15.5px] text-ink-2">
                <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold))]" />
                {t}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal as="ul" className="grid gap-px overflow-hidden rounded-[18px] border border-foreground/10 bg-foreground/10">
          {SKILLS.map((s) => (
            <SpotlightCard key={s.b} accent={s.accent ?? "gold"} className="grid gap-2.5 p-[clamp(22px,2.4vw,30px)]">
              <b className={cn("font-display text-lg font-bold", s.accent === "dim" ? "text-dim" : "text-gold")}>{s.b}</b>
              <span className="text-[14.5px] leading-[1.8] text-ink-2">{s.s}</span>
            </SpotlightCard>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className={secCls}>
      <SecScrim />
      <SecHead
        eyebrow="מה אני בונה"
        title={
          <>
            חמש דרכים לצאת
            <br />
            מהעולם הזה
          </>
        }
      />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-foreground/10 bg-foreground/10 max-md:grid-cols-1">
        {SERVICES.map((s, i) => (
          <SpotlightCard
            key={s.num}
            accent={s.accent ?? "gold"}
            className={cn("p-[clamp(30px,3.2vw,46px)]", i === SERVICES.length - 1 && SERVICES.length % 2 === 1 && "md:col-span-2")}
          >
            <span className={cn("font-display text-xs tracking-[0.28em]", s.accent === "dim" ? "text-dim" : "text-gold")} dir="ltr">
              {s.num}
            </span>
            <h3 className="mt-[22px] font-display text-[26px] font-bold tracking-[-0.01em]">{s.h}</h3>
            <p className="mt-4 max-w-[44ch] text-[15.5px] leading-[1.9] text-ink-2">{s.p}</p>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className={cn(secCls, "py-[clamp(60px,8vh,100px)]")}>
      <SecScrim wide />
      <div className="grid grid-cols-3 gap-px border-y border-foreground/10 bg-foreground/10">
        {STATS.map((s, i) => (
          <Reveal key={s.b} delay={i * 100} className="bg-[hsl(225_29%_3%/0.55)] px-5 py-[clamp(34px,4vw,52px)] text-center backdrop-blur">
            <b className="block bg-[linear-gradient(180deg,hsl(var(--gold-hi)),hsl(var(--gold-dp)))] bg-clip-text font-display text-[clamp(38px,5vw,64px)] font-bold leading-none text-transparent">
              {s.b}
            </b>
            <span className="mt-3.5 block text-[11.5px] tracking-[0.22em] text-ink-3">{s.s}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className={secCls}>
      <SecScrim />
      <SecHead
        eyebrow="איך זה עובד"
        title={
          <>
            מהשיחה הראשונה
            <br />
            ועד השיגור
          </>
        }
      />
      <ol className="relative grid grid-cols-4 gap-[clamp(18px,2.4vw,34px)] pt-[34px] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-foreground/10 max-md:grid-cols-1 max-md:gap-9">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 100} as="li" className="group/step relative transition-transform duration-500 ease-cinematic hover:-translate-y-1">
            <span className="absolute -top-[37px] end-0 h-[7px] w-[7px] rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold))] transition-[box-shadow,transform] duration-400 ease-cinematic group-hover/step:scale-[1.35] group-hover/step:shadow-[0_0_30px_hsl(var(--gold))] max-md:hidden" />
            <span className="font-display text-xs tracking-[0.28em] text-gold transition-colors group-hover/step:text-gold-hi" dir="ltr">
              {s.n}
            </span>
            <h3 className="mt-[18px] font-display text-[21px] font-bold">{s.h}</h3>
            <p className="mt-3.5 text-[15.5px] leading-[1.9] text-ink-2">{s.p}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className={secCls}>
      <SecScrim />
      <SecHead
        eyebrow="לפני שנדבר"
        title={
          <>
            שאלות שנשאלות
            <br />
            כמעט בכל שיחה
          </>
        }
      />
      <div className="grid max-w-[920px] gap-px overflow-hidden rounded-[18px] border border-foreground/10 bg-foreground/10">
        {FAQ.map((f, i) => (
          <Reveal key={f.q} delay={i * 100}>
            <details className="group/faq bg-[hsl(222_27%_4%/0.7)] backdrop-blur-lg transition-colors duration-500 open:bg-gold/5 hover:bg-gold/[0.045]">
              <summary
                className={cn(
                  "flex cursor-pointer list-none items-center gap-[18px] px-[clamp(20px,2.4vw,30px)] py-[clamp(20px,2.2vw,26px)]",
                  "font-display text-[clamp(17px,1.7vw,21px)] font-bold tracking-[-0.01em] transition-[color,padding] duration-400 ease-cinematic",
                  "hover:ps-2 hover:text-gold [&::-webkit-details-marker]:hidden",
                  shadowText
                )}
              >
                {f.q}
                <Plus
                  aria-hidden
                  className="ms-auto h-3.5 w-3.5 shrink-0 text-gold transition-[transform,filter] duration-400 ease-cinematic group-open/faq:rotate-45 group-hover/faq:[filter:drop-shadow(0_0_6px_hsl(var(--gold)/0.65))]"
                />
              </summary>
              <div className="px-[clamp(20px,2.4vw,30px)] pb-[clamp(22px,2.4vw,28px)]">
                <p className="max-w-[64ch] text-[15.5px] leading-[1.9] text-ink-2">{f.a}</p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = Object.fromEntries(fd.entries()) as Record<string, string>;
    const err: Record<string, string> = {};
    if ((d.name ?? "").trim().length < 2) err.name = "איך קוראים לכם?";
    if (!/^[0-9+\-\s()]{9,15}$/.test((d.phone ?? "").trim())) err.phone = "מספר טלפון לא תקין";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((d.email ?? "").trim())) err.email = "כתובת אימייל לא תקינה";
    if (!d.type) err.type = "בחרו סוג פרויקט";
    setErrors(err);
    if (Object.keys(err).length) return;

    // TODO: להחליף בקריאה לשירות טפסים אמיתי (Formspree / Supabase edge function)
    const body = `שם: ${d.name}\nטלפון: ${d.phone}\nאימייל: ${d.email}\nסוג פרויקט: ${d.type}\nתקציב: ${d.budget || "לא צוין"}\n\n${d.message || ""}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("פנייה חדשה מהאתר · " + d.name)}&body=${encodeURIComponent(body)}`;
    setName((d.name ?? "").trim().split(" ")[0]);
    setSent(true);
  };

  const field = "w-full rounded-xl border border-foreground/15 bg-foreground/[0.04] px-4 py-[15px] text-[15.5px] outline-none transition-[border-color,background,box-shadow] focus:border-gold focus:bg-gold/[0.08] focus:shadow-[0_0_0_4px_hsl(var(--gold)/0.12)]";
  const label = "mb-2.5 block text-xs tracking-[0.14em] text-ink-3";

  return (
    <section id="contact" className={cn(secCls, "max-w-[1340px] py-[clamp(120px,18vh,210px)]")}>
      <SecScrim />
      <div className="grid grid-cols-[1fr_1.02fr] items-center gap-[clamp(32px,5vw,86px)] max-lg:grid-cols-1 max-lg:gap-14">
        <div className={cn("relative", shadowText)}>
          <p className="flex items-center gap-3.5 text-[12.5px] tracking-[0.32em] text-gold-hi">
            הצעד האחרון
            <span className="h-px max-w-[70px] flex-1 bg-gold/20" />
          </p>
          <Reveal as="h2" className="mt-1.5 font-display text-[clamp(32px,4.8vw,64px)] font-bold leading-[1.08] tracking-[-0.02em]">
            אפשר להמשיך לגלול.
            <br />
            <span className="bg-[linear-gradient(96deg,hsl(var(--gold-dp))_4%,hsl(var(--gold-hi))_42%,hsl(var(--gold))_78%)] bg-clip-text text-transparent">
              או פשוט לקפוץ.
            </span>
          </Reveal>
          <Reveal as="p" className="mt-6 max-w-[44ch] text-[16.5px] leading-[1.95] text-ink-2">
            כל פרויקט מתחיל בשיחה אחת קצרה — בלי התחייבות ובלי מצגות מכירה. נשמע אתכם, נגיד אם זה מתאים, ותצאו עם
            כיוון ברור גם אם לא נעבוד יחד.
          </Reveal>
          <Reveal as="ul" className="mt-9 grid gap-[18px]" delay={100}>
            {["חזרה תוך 24 שעות, מבן אדם אמיתי", "הצעת מחיר מפורטת ללא עלות", "מספר פרויקטים מוגבל בכל רבעון"].map((t) => (
              <li key={t} className="flex items-center gap-[15px] text-[15.5px] text-ink-2">
                <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold))]" />
                {t}
              </li>
            ))}
          </Reveal>
          <Reveal className="mt-11 flex flex-wrap gap-4" delay={180}>
            <a href={WHATSAPP} target="_blank" rel="noopener" className="contents">
              <CineButton variant="ghost">וואטסאפ</CineButton>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="contents">
              <CineButton variant="ghost">מייל ישיר</CineButton>
            </a>
          </Reveal>
        </div>

        <Reveal className="relative">
          <div
            className={cn(
              "relative rounded-3xl border border-gold/25 p-[clamp(30px,3.6vw,48px)] backdrop-blur-3xl transition-[opacity,transform] duration-600",
              "bg-[linear-gradient(180deg,hsl(225_25%_6%/0.9),hsl(225_29%_3%/0.94))]",
              "shadow-[0_60px_140px_-50px_hsl(0_0%_0%/1),0_0_100px_-50px_hsl(var(--dim)/0.4)]",
              sent && "pointer-events-none scale-[0.97] opacity-0"
            )}
          >
            <h3 className="font-display text-[clamp(26px,2.8vw,34px)] font-bold tracking-[-0.02em]">השאירו פרטים</h3>
            <p className="mt-3 text-[15px] text-ink-3">ואחזור אליכם עם רעיון ראשון לפרויקט</p>

            <form onSubmit={submit} noValidate>
              <div className="mt-[22px]">
                <label className={label} htmlFor="f-name">
                  שם מלא <b className="font-normal text-gold">*</b>
                </label>
                <input id="f-name" name="name" type="text" autoComplete="name" placeholder="ישראל ישראלי" className={cn(field, errors.name && "border-destructive bg-destructive/10")} />
                {errors.name && <em className="mt-2 block text-[12.5px] not-italic text-destructive-foreground">{errors.name}</em>}
              </div>

              <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1 max-md:gap-0">
                <div className="mt-[22px]">
                  <label className={label} htmlFor="f-phone">
                    טלפון <b className="font-normal text-gold">*</b>
                  </label>
                  <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="050-0000000" className={cn(field, errors.phone && "border-destructive bg-destructive/10")} />
                  {errors.phone && <em className="mt-2 block text-[12.5px] not-italic text-destructive-foreground">{errors.phone}</em>}
                </div>
                <div className="mt-[22px]">
                  <label className={label} htmlFor="f-email">
                    אימייל <b className="font-normal text-gold">*</b>
                  </label>
                  <input id="f-email" name="email" type="email" autoComplete="email" placeholder="name@mail.com" dir="ltr" className={cn(field, errors.email && "border-destructive bg-destructive/10")} />
                  {errors.email && <em className="mt-2 block text-[12.5px] not-italic text-destructive-foreground">{errors.email}</em>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1 max-md:gap-0">
                <div className="mt-[22px]">
                  <label className={label} htmlFor="f-type">
                    סוג הפרויקט <b className="font-normal text-gold">*</b>
                  </label>
                  <select id="f-type" name="type" className={cn(field, "cursor-pointer appearance-none ps-11", errors.type && "border-destructive bg-destructive/10")}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23E8C48A' stroke-width='1.6'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left 17px center",
                    }}
                  >
                    <option value="">בחרו אפשרות</option>
                    {["אתר תדמית קולנועי", "אתר / חוויית תלת מימד", "דף נחיתה", "חנות אונליין", "מערכת / אפליקציית ווב", "מיתוג דיגיטלי מלא", "עדיין לא בטוח"].map((o) => (
                      <option key={o} className="bg-card text-foreground">
                        {o}
                      </option>
                    ))}
                  </select>
                  {errors.type && <em className="mt-2 block text-[12.5px] not-italic text-destructive-foreground">{errors.type}</em>}
                </div>
                <div className="mt-[22px]">
                  <label className={label} htmlFor="f-budget">
                    תקציב משוער
                  </label>
                  <select id="f-budget" name="budget" className={cn(field, "cursor-pointer appearance-none ps-11")}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23E8C48A' stroke-width='1.6'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left 17px center",
                    }}
                  >
                    <option value="">לא משנה כרגע</option>
                    {["עד 8,000 ₪", "8,000–20,000 ₪", "20,000–50,000 ₪", "50,000 ₪ ומעלה"].map((o) => (
                      <option key={o} className="bg-card text-foreground">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-[22px]">
                <label className={label} htmlFor="f-msg">
                  כמה מילים על הפרויקט
                </label>
                <textarea id="f-msg" name="message" rows={3} placeholder="מה המותג, מי הקהל, ומה הייתם רוצים שיקרה באתר" className={cn(field, "resize-none leading-[1.75]")} />
              </div>

              <div className="mt-[30px]">
                <CineButton type="submit" full loadingText="שולח···">
                  שלחו — ונדבר
                </CineButton>
              </div>
              <p className="mt-[18px] text-center text-[12.5px] text-muted-ink">הפרטים נשמרים אצלי בלבד. בלי ספאם, בלי רשימות תפוצה.</p>
            </form>
          </div>

          {sent && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-gold/35 p-11 text-center backdrop-blur-3xl bg-[linear-gradient(180deg,hsl(225_25%_8%/0.94),hsl(225_29%_3%/0.96))]">
              <div className="relative h-[66px] w-[66px] rounded-full border border-gold shadow-[0_0_46px_hsl(var(--gold)/0.42)]">
                <span className="absolute left-[21px] top-[22px] h-3 w-6 -rotate-45 border-b-2 border-l-2 border-gold" />
              </div>
              <h3 className="font-display text-3xl font-bold">תודה, {name || "שלכם"}!</h3>
              <p className="max-w-[34ch] text-[15.5px] leading-[1.85] text-ink-2">
                הפרטים התקבלו. אחזור אליכם תוך 24 שעות עם כיוון ראשון לפרויקט.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function SiteFooter({ onRestart }: { onRestart: () => void }) {
  return (
    <footer className="relative border-t border-foreground/10 bg-[hsl(225_29%_3%/0.72)] backdrop-blur-lg">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1.4fr_1fr_1fr] gap-10 px-[var(--gut)] pb-[46px] pt-[clamp(48px,6vw,72px)] max-md:grid-cols-1 max-md:gap-8">
        <p className={cn("font-display text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.4]", shadowText)}>
          אתרים שלא
          <br />
          <span className="text-gold">מהעולם הזה.</span>
        </p>
        <div>
          <h4 className="mb-5 text-[11.5px] tracking-[0.24em] text-ink-3">עמודי האתר</h4>
          <ul className="grid gap-3">
            {MENU.slice(3).map((m) => (
              <li key={m.p}>
                <a href={`#${SECTION_IDS[m.p]}`} className="text-[14.5px] text-ink-2 no-underline transition-colors hover:text-gold">
                  {m.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-5 text-[11.5px] tracking-[0.24em] text-ink-3">ליצירת קשר</h4>
          <ul className="grid gap-3">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="text-[14.5px] text-ink-2 no-underline transition-colors hover:text-gold">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a href={WHATSAPP} target="_blank" rel="noopener" className="text-[14.5px] text-ink-2 no-underline transition-colors hover:text-gold">
                וואטסאפ
              </a>
            </li>
            <li>
              <a href="#contact" className="text-[14.5px] text-ink-2 no-underline transition-colors hover:text-gold">
                השארת פרטים
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-foreground/10 px-[var(--gut)] pb-[clamp(96px,12vh,124px)] pt-5 text-[12.5px] text-muted-ink">
        <span>© {new Date().getFullYear()} סטודיו אבי · כל הזכויות שמורות</span>
        <button onClick={onRestart} className="inline-flex items-center gap-2 text-[12.5px] tracking-[0.04em] text-gold transition-opacity hover:opacity-75">
          להתחיל את המסע מחדש
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </footer>
  );
}
