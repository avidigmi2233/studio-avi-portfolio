import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { cookiesDoc } from "@/content/legal/cookies";
import { useConsent } from "@/lib/consent/ConsentProvider";

function OpenPreferences() {
  const { reopen } = useConsent();
  return (
    <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-6 text-center">
      <p className="text-[15.5px] leading-[1.9] text-ink-2">
        אפשר לשנות את ההסכמה כאן ועכשיו, בלי לצאת מהעמוד.
      </p>
      <button
        type="button"
        onClick={reopen}
        className="mt-5 inline-flex items-center justify-center rounded-full border border-gold/45 bg-gold/[0.08] px-7 py-3 text-[14px] font-bold text-gold transition-colors hover:border-gold/75 hover:bg-gold/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        פתיחת הגדרות Cookie
      </button>
    </div>
  );
}

export const Route = createFileRoute("/cookies")({
  head: () =>
    legalHead(
      "/cookies",
      "מדיניות Cookie",
      "אילו קובצי Cookie ואחסון מקומי פועלים באתר, למה הם משמשים, כמה זמן הם נשמרים ואיך משנים הסכמה.",
    ),
  component: () => <LegalPage doc={{ ...cookiesDoc, footer: <OpenPreferences /> }} />,
});
