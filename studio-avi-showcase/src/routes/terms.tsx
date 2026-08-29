import { createFileRoute } from "@tanstack/react-router";

import { LegalPage, legalHead } from "@/components/legal/LegalPage";
import { termsDoc } from "@/content/legal/terms";

export const Route = createFileRoute("/terms")({
  head: () =>
    legalHead(
      "/terms",
      "תנאי שימוש",
      "התנאים החלים על השימוש באתר: קניין רוחני, שימושים אסורים, הגבלת אחריות, דין וסמכות שיפוט.",
    ),
  component: () => <LegalPage doc={termsDoc} />,
});
