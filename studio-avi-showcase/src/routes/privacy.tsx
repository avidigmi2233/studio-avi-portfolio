import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { privacyDoc } from "@/content/legal/privacy";

export const Route = createFileRoute("/privacy")({
  head: () =>
    legalHead(
      "/privacy",
      "מדיניות פרטיות",
      "איזה מידע נאסף באתר, למה, למי הוא מועבר, כמה זמן הוא נשמר ואיך מממשים זכות עיון, תיקון ומחיקה.",
    ),
  component: () => <LegalPage doc={privacyDoc} />,
});
