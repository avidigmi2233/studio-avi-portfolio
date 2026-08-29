import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { SITE } from "@/config/site";
import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { dataRequestDoc } from "@/content/legal/dataRequest";

const mailto = `mailto:${SITE.privacyEmail}?subject=${encodeURIComponent(
  "בקשה בנושא מידע אישי · אתר " + SITE.domain,
)}&body=${encodeURIComponent(
  [
    "סוג הבקשה (עיון / תיקון / מחיקה):",
    "",
    "השם שמסרתי בפנייה:",
    "הטלפון שמסרתי:",
    "האימייל שמסרתי:",
    "מועד משוער של הפנייה:",
    "",
    "פרטים נוספים:",
    "",
  ].join("\n"),
)}`;

function RequestCta() {
  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6 text-center">
      <p className="text-[15.5px] leading-[1.9] text-ink-2">
        הכפתור פותח מייל מוכן עם כל השדות שאנחנו צריכים. אפשר גם לכתוב אלינו בחופשי.
      </p>
      <a
        href={mailto}
        className="mt-5 inline-flex items-center justify-center gap-2.5 rounded-full border border-gold/45 bg-gold/[0.08] px-7 py-3 text-[14px] font-bold text-gold transition-colors hover:border-gold/75 hover:bg-gold/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Mail className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
        פתיחת בקשה במייל
      </a>
    </div>
  );
}

export const Route = createFileRoute("/data-request")({
  head: () =>
    legalHead(
      "/data-request",
      "פניות בנושא מידע אישי",
      "עיון, תיקון ומחיקה של מידע אישי: איך מגישים בקשה, איך מאמתים זהות ותוך כמה זמן נענה.",
    ),
  component: () => <LegalPage doc={{ ...dataRequestDoc, footer: <RequestCta /> }} />,
});
