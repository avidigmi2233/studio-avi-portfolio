/* ==========================================================================
   סטודיו אבי — תבניות מייל
   שני מיילים: התרעה תפעולית לאבי, ואישור מיתוגי לליד.

   כללי מייל שמכתיבים את הקוד כאן:
   · טבלאות בלבד — Outlook לא תומך ב-flex/grid.
   · כל CSS inline — Gmail מסיר <style> בהעברות ובאפליקציה.
   · כל צבע מוצהר במפורש, כולל על התאים, כדי שלקוח שכופה מצב בהיר
     לא ישאיר טקסט זהב על לבן.
   · רוחב 600px, dir="rtl".
   ========================================================================== */

import { SITE } from "@/config/site";

/* פלטת האתר, מומרת מ-HSL ל-HEX (לקוחות מייל לא תומכים ב-hsl()) */
const C = {
  bg: "#05070A",
  panel: "#0B0F16",
  panelSoft: "#111722",
  line: "#1E2530",
  gold: "#E8C58C",
  goldHi: "#FFEAC7",
  goldDp: "#B9894B",
  fg: "#F7F1E9",
  ink2: "#DBD1C2",
  ink3: "#A99E8E",
  ink4: "#7C7365",
} as const;

const FONT =
  "'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans Hebrew', sans-serif";

export type LeadPayload = {
  name: string;
  phone: string;
  email: string;
  type: string;
  budget: string;
  message: string;
  /** מקור התנועה — נאסף מה-URL, לא מהטופס */
  source?: {
    utmSource?: string;
    utmCampaign?: string;
    utmMedium?: string;
    referrer?: string;
    landingUrl?: string;
  };
  crmLeadId?: string | null;
};

const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 050-1234567 → 972501234567 */
export function intlPhone(raw: string): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("972")) return d;
  if (d.startsWith("0")) return "972" + d.slice(1);
  return d;
}

/** תקציב מוצהר → ציון ליד גס, כדי שהמייל יגיד מיד כמה זה דחוף */
export function scoreLead(budget: string, type: string): number {
  let s = 40;
  if (budget.includes("50,000")) s += 35;
  else if (budget.includes("20,000")) s += 25;
  else if (budget.includes("8,000–")) s += 12;
  else if (budget.includes("עד 8,000")) s -= 5;
  if (/תלת מימד|חנות|מערכת|מיתוג/.test(type)) s += 12;
  if (/עדיין לא בטוח/.test(type)) s -= 8;
  return Math.max(0, Math.min(100, s));
}

function tempBadge(score: number) {
  if (score >= 70) return { label: "ליד חם", bg: "#2A1116", fg: "#FF8A9B", bd: "#5C2230" };
  if (score >= 50) return { label: "ליד פושר", bg: "#2A2011", fg: C.gold, bd: "#5C4622" };
  return { label: "ליד קר", bg: "#111722", fg: C.ink3, bd: C.line };
}

/* ── רכיבים משותפים ────────────────────────────────────────────── */

function button(href: string, label: string, opts: { solid?: boolean } = {}) {
  const solid = opts.solid;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 0 8px 8px;">
  <tr><td align="center" bgcolor="${solid ? C.gold : C.panelSoft}" style="border-radius:10px;border:1px solid ${solid ? C.gold : C.line};">
    <a href="${esc(href)}" style="display:block;padding:13px 22px;font-family:${FONT};font-size:14px;font-weight:700;color:${solid ? "#1A1206" : C.gold};text-decoration:none;letter-spacing:.02em;">${esc(label)}</a>
  </td></tr>
</table>`;
}

function row(label: string, value: string, opts: { ltr?: boolean; href?: string } = {}) {
  const inner = opts.href
    ? `<a href="${esc(opts.href)}" style="color:${C.gold};text-decoration:none;">${esc(value)}</a>`
    : esc(value);
  return `<tr>
  <td style="padding:13px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:12px;color:${C.ink4};letter-spacing:.1em;white-space:nowrap;vertical-align:top;width:104px;">${esc(label)}</td>
  <td style="padding:13px 0;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:15px;color:${C.fg};font-weight:600;${opts.ltr ? "direction:ltr;text-align:right;" : ""}">${inner}</td>
</tr>`;
}

function shell(title: string, body: string, preheader: string) {
  return `<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.bg}" style="background:${C.bg};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;">
      ${body}
      <tr><td style="padding:26px 4px 0;font-family:${FONT};font-size:11.5px;color:${C.ink4};text-align:center;line-height:1.8;">
        ${SITE.brandName} · אתרי תדמית קולנועיים<br>
        <a href="${SITE.whatsapp}" style="color:${C.ink3};text-decoration:none;">${SITE.phone}</a>
        &nbsp;·&nbsp;
        <a href="mailto:${SITE.contactEmail}" style="color:${C.ink3};text-decoration:none;">${SITE.contactEmail}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ── מייל 1: התרעה לאבי ────────────────────────────────────────── */

export function buildOwnerEmail(lead: LeadPayload, crmUrl = "https://flow-crm-il.lovable.app/leads") {
  const score = scoreLead(lead.budget, lead.type);
  const badge = tempBadge(score);
  const wa = intlPhone(lead.phone);
  const waText = encodeURIComponent(
    `היי ${lead.name.split(" ")[0]}, כאן אבי מסטודיו אבי — קיבלתי את הפנייה שלך מהאתר לגבי ${lead.type}. מתי נוח לך לדבר?`,
  );

  const src = lead.source ?? {};
  const srcLine =
    [src.utmSource && `מקור: ${src.utmSource}`, src.utmCampaign && `קמפיין: ${src.utmCampaign}`, src.referrer && `הפניה: ${src.referrer}`]
      .filter(Boolean)
      .join(" · ") || "כניסה ישירה לאתר";

  const body = `
<tr><td style="padding:0 0 18px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="font-family:${FONT};font-size:11.5px;letter-spacing:.24em;color:${C.goldDp};">ליד חדש מהאתר</td>
      <td align="left" style="font-family:${FONT};font-size:11.5px;color:${C.ink4};">${esc(new Date().toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" }))}</td>
    </tr>
  </table>
  <div style="height:2px;background:linear-gradient(90deg,${C.gold},${C.goldDp} 45%,${C.line});margin-top:10px;"></div>
</td></tr>

<tr><td bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.line};border-radius:16px;padding:30px;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="font-family:${FONT};font-size:29px;font-weight:800;color:${C.fg};line-height:1.2;">${esc(lead.name)}</td>
      <td align="left" style="width:100px;">
        <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${badge.bg};border:1px solid ${badge.bd};font-family:${FONT};font-size:11.5px;font-weight:700;color:${badge.fg};white-space:nowrap;">${badge.label} · ${score}</span>
      </td>
    </tr>
  </table>

  <p style="margin:10px 0 0;font-family:${FONT};font-size:15px;color:${C.ink2};line-height:1.7;">
    מעוניין ב<strong style="color:${C.gold};font-weight:700;">${esc(lead.type)}</strong>${lead.budget ? ` · תקציב ${esc(lead.budget)}` : ""}
  </p>

  <div style="height:1px;background:${C.line};margin:22px 0;"></div>

  <p style="margin:0 0 12px;font-family:${FONT};font-size:11.5px;letter-spacing:.16em;color:${C.ink4};">חזרה מיידית</p>
  ${button(`https://wa.me/${wa}?text=${waText}`, "וואטסאפ", { solid: true })}
  ${button(`tel:+${wa}`, "חיוג")}
  ${button(`mailto:${esc(lead.email)}?subject=${encodeURIComponent("סטודיו אבי · בנוגע לפנייה שלך")}`, "מייל")}

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:22px;">
    ${row("טלפון", lead.phone, { ltr: true, href: `tel:+${wa}` })}
    ${row("אימייל", lead.email, { ltr: true, href: `mailto:${lead.email}` })}
    ${row("סוג פרויקט", lead.type)}
    ${row("תקציב", lead.budget || "לא צוין")}
  </table>

  ${
    lead.message?.trim()
      ? `<div style="margin-top:22px;padding:18px 20px;background:${C.panelSoft};border-right:3px solid ${C.gold};border-radius:0 10px 10px 0;">
      <p style="margin:0 0 7px;font-family:${FONT};font-size:11.5px;letter-spacing:.16em;color:${C.ink4};">בלשונו</p>
      <p style="margin:0;font-family:${FONT};font-size:15px;color:${C.ink2};line-height:1.85;white-space:pre-wrap;">${esc(lead.message)}</p>
    </div>`
      : ""
  }

  <div style="height:1px;background:${C.line};margin:22px 0 16px;"></div>
  <p style="margin:0;font-family:${FONT};font-size:12.5px;color:${C.ink4};line-height:1.7;">${esc(srcLine)}</p>

  ${lead.crmLeadId ? `<div style="margin-top:18px;">${button(crmUrl, "פתיחה ב-CRM")}</div>` : `<p style="margin:16px 0 0;font-family:${FONT};font-size:12px;color:#FF8A9B;">שים לב: הליד לא נשמר ב-CRM. הפרטים כאן הם העותק היחיד.</p>`}

</td></tr>`;

  const text = `ליד חדש מהאתר — ${lead.name}
${lead.type}${lead.budget ? ` · ${lead.budget}` : ""}
טלפון: ${lead.phone}
אימייל: ${lead.email}
${lead.message ? `\n${lead.message}\n` : ""}
${srcLine}
וואטסאפ: https://wa.me/${wa}`;

  return {
    subject: `ליד חדש · ${lead.name} · ${lead.type}${lead.budget ? ` · ${lead.budget}` : ""}`,
    html: shell(`ליד חדש · ${lead.name}`, body, `${lead.type}${lead.budget ? ` · ${lead.budget}` : ""} · ${lead.phone}`),
    text,
  };
}

/* ── מייל 2: אישור אוטומטי לליד ────────────────────────────────── */

export function buildLeadEmail(lead: LeadPayload) {
  const first = lead.name.trim().split(" ")[0] || "שלום";
  const waText = encodeURIComponent(`היי אבי, השארתי פרטים באתר בנוגע ל${lead.type}`);

  const steps: [string, string][] = [
    ["אני קורא את הפנייה", "עובר על מה שכתבת ומסתכל על המותג שלך לפני שאני חוזר — כדי שהשיחה תתחיל מהמקום הנכון."],
    ["שיחה קצרה", "עד 24 שעות. בלי מצגת מכירה — נבין מה אתה צריך ואגיד לך בכנות אם זה מתאים."],
    ["כיוון ראשון", "תצא מהשיחה עם כיוון ברור לפרויקט והצעת מחיר מפורטת, גם אם נחליט לא לעבוד יחד."],
  ];

  const body = `
<tr><td style="padding:0 0 18px;">
  <div style="font-family:${FONT};font-size:11.5px;letter-spacing:.24em;color:${C.goldDp};">סטודיו אבי</div>
  <div style="height:2px;background:linear-gradient(90deg,${C.gold},${C.goldDp} 45%,${C.line});margin-top:10px;"></div>
</td></tr>

<tr><td bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.line};border-radius:16px;padding:34px 30px;">

  <h1 style="margin:0;font-family:${FONT};font-size:31px;font-weight:800;color:${C.fg};line-height:1.25;">
    תודה, ${esc(first)}.<br>
    <span style="color:${C.gold};">הפרטים אצלי.</span>
  </h1>

  <p style="margin:16px 0 0;font-family:${FONT};font-size:15.5px;color:${C.ink2};line-height:1.9;">
    קיבלתי את הפנייה שלך בנוגע ל<strong style="color:${C.fg};font-weight:600;">${esc(lead.type)}</strong>.
    אני עונה אישית לכל פנייה — לא בוט ולא מוקד — ולכן זה לוקח לפעמים כמה שעות. הנה מה שקורה מכאן.
  </p>

  <div style="height:1px;background:${C.line};margin:26px 0;"></div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${steps
      .map(
        ([t, d], i) => `<tr>
      <td width="34" valign="top" style="padding:0 0 22px;">
        <div style="width:26px;height:26px;border-radius:999px;border:1px solid ${C.goldDp};text-align:center;font-family:${FONT};font-size:12.5px;font-weight:700;color:${C.gold};line-height:26px;">${i + 1}</div>
      </td>
      <td valign="top" style="padding:0 0 22px;">
        <p style="margin:2px 0 5px;font-family:${FONT};font-size:15.5px;font-weight:700;color:${C.fg};">${esc(t)}</p>
        <p style="margin:0;font-family:${FONT};font-size:14px;color:${C.ink3};line-height:1.8;">${esc(d)}</p>
      </td>
    </tr>`,
      )
      .join("")}
  </table>

  <div style="height:1px;background:${C.line};margin:4px 0 24px;"></div>

  <p style="margin:0 0 14px;font-family:${FONT};font-size:14.5px;color:${C.ink2};line-height:1.8;">
    דחוף יותר? אפשר פשוט לכתוב לי בוואטסאפ ואענה מהר יותר.
  </p>
  ${button(`${SITE.whatsapp}?text=${waText}`, "וואטסאפ ישיר", { solid: true })}
  ${button("https://avi-studio-showcase.lovable.app", "לתיק העבודות")}

</td></tr>`;

  const text = `תודה, ${first}. הפרטים אצלי.

קיבלתי את הפנייה שלך בנוגע ל${lead.type}.

מה קורה מכאן:
1. אני קורא את הפנייה ומסתכל על המותג שלך.
2. שיחה קצרה תוך 24 שעות, בלי מצגת מכירה.
3. תצא עם כיוון ברור והצעת מחיר מפורטת.

דחוף? וואטסאפ: ${SITE.whatsapp}

${SITE.brandName} · ${SITE.phone}`;

  return {
    subject: `תודה ${first} — הפנייה שלך התקבלה · סטודיו אבי`,
    html: shell("הפנייה שלך התקבלה", body, "אחזור אליך תוך 24 שעות עם כיוון ראשון לפרויקט."),
    text,
  };
}
