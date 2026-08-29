import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { accessibilityDoc } from "@/content/legal/accessibility";

export const Route = createFileRoute("/accessibility")({
  head: () =>
    legalHead(
      "/accessibility",
      "הצהרת נגישות",
      'רמת הנגישות שהושגה לפי ת"י 5568, מה נבדק, מה עדיין לא מושלם, ופרטי רכז הנגישות לפניות.',
    ),
  component: () => <LegalPage doc={accessibilityDoc} />,
});
