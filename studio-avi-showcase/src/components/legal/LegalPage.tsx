/* ==========================================================================
   מעטפת אחידה לכל העמודים המשפטיים.
   h1 אחד, תאריך עדכון, תוכן עניינים עם עוגנים, שורה קריאה (~70 תווים),
   והיררכיית כותרות רציפה. כל הצבעים מטוקני המערכת הקיימים.
   ========================================================================== */

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SITE } from "@/config/site";
import { LAST_UPDATED, formatLegalDate } from "@/content/legal/versions";
import { LegalNav } from "./LegalNav";

/* ── מודל התוכן ────────────────────────────────────────────────── */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  lede: string;
  sections: LegalSection[];
  /** תוכן חופשי שנוסף מתחת לסעיף האחרון (למשל כפתור פעולה) */
  footer?: ReactNode;
};

/* ── טקסט עם קישורים בסגנון [טקסט](יעד) ───────────────────────── */

const INLINE_RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

const linkCls =
  "text-gold underline underline-offset-4 transition-colors hover:text-gold-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function RichText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;

  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, bold, label, href] = m;

    if (bold) {
      out.push(
        <strong key={m.index} className="font-bold text-foreground">
          {bold}
        </strong>,
      );
    } else {
      out.push(
        <a
          key={m.index}
          href={href}
          className={linkCls}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        >
          {label}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/* ── בלוקים ────────────────────────────────────────────────────── */

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-4 text-[16px] leading-[1.95] text-ink-2">
          <RichText text={block.text} />
        </p>
      );
    case "h3":
      return (
        <h3 className="mt-8 font-display text-[18px] font-bold text-foreground">{block.text}</h3>
      );
    case "ul":
      return (
        <ul className="mt-4 grid gap-3">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-[1.95] text-ink-2">
              <i aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-4 grid gap-3">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-[1.95] text-ink-2">
              <span
                aria-hidden
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 text-[12px] font-bold text-gold"
              >
                {i + 1}
              </span>
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <p className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.05] p-4 text-[15px] leading-[1.9] text-ink-2">
          <RichText text={block.text} />
        </p>
      );
    case "table":
      return (
        <div className="mt-5 overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full min-w-[560px] border-collapse text-right text-[14px]">
            <thead>
              <tr className="bg-foreground/[0.04] text-ink-3">
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-ink-2">
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-foreground/[0.08] align-top">
                  {row.map((c, j) => (
                    <td key={j} className="px-4 py-3 leading-[1.8]">
                      <RichText text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

/* ── העמוד ─────────────────────────────────────────────────────── */

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <main
      id="main"
      dir="rtl"
      className="relative min-h-screen bg-background text-foreground"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] bg-[radial-gradient(58%_52%_at_50%_0%,hsl(var(--gold)/0.12),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-[860px] px-6 py-[clamp(56px,9vh,104px)]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[14px] text-ink-3 transition-colors hover:text-gold"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
          חזרה לאתר
        </Link>

        <header className="mt-8 border-b border-foreground/10 pb-9">
          <h1 className="font-display text-[clamp(30px,4.6vw,48px)] font-bold leading-[1.15] tracking-[-0.02em]">
            {doc.title}
          </h1>
          <p className="mt-5 max-w-[62ch] text-[16.5px] leading-[1.95] text-ink-2">{doc.lede}</p>
          <p className="mt-6 text-[13px] text-muted-ink">
            עדכון אחרון: {formatLegalDate(LAST_UPDATED)} · {SITE.legalName} · ח.פ/ע.מ{" "}
            <span dir="ltr">{SITE.businessId}</span>
          </p>
        </header>

        <nav aria-labelledby="toc-title" className="mt-9 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6">
          <h2 id="toc-title" className="text-[12px] tracking-[0.24em] text-ink-3">
            תוכן העמוד
          </h2>
          <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {doc.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[14.5px] text-ink-2 transition-colors hover:text-gold"
                >
                  <span className="text-muted-ink">{i + 1}.</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 border-b border-foreground/[0.07] py-9 last:border-b-0">
              <h2 className="font-display text-[clamp(20px,2.6vw,26px)] font-bold tracking-[-0.015em]">
                <span className="text-gold">{i + 1}.</span> {s.title}
              </h2>
              {s.blocks.map((b, j) => (
                <Block key={j} block={b} />
              ))}
            </section>
          ))}
        </div>

        {doc.footer && <div className="mt-10">{doc.footer}</div>}

        <footer className={cn("mt-14 border-t border-foreground/10 pt-8 text-[13.5px] text-ink-3")}>
          <LegalNav />
          <p className="mt-6 text-[12.5px] text-muted-ink">
            © {new Date().getFullYear()} {SITE.legalName} · כל הזכויות שמורות
          </p>
        </footer>
      </div>
    </main>
  );
}

/** head() אחיד לכל עמוד משפטי */
export function legalHead(path: string, title: string, description: string) {
  return {
    meta: [
      { title: `${title} · ${SITE.brandName}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} · ${SITE.brandName}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `${SITE.origin}${path}` }],
  };
}
