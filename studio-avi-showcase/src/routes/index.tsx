import { createFileRoute } from "@tanstack/react-router";
import StudioAviSite from "@/components/StudioAviSite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "סטודיו אבי · אתרי תדמית קולנועיים בתלת מימד" },
      {
        name: "description",
        content:
          "סטודיו אבי בונה אתרי תדמית קולנועיים עם עולמות תלת מימד, גלילה מונפשת ותנועה שמספרת סיפור. אתרים שאנשים זוכרים.",
      },
      { property: "og:title", content: "סטודיו אבי · אתרי תדמית קולנועיים בתלת מימד" },
      {
        property: "og:description",
        content:
          "חוויות גלילה קולנועיות, עולמות תלת מימד ואנימציה בהתאמה אישית — בלי תבניות, בלי ערכות עיצוב.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/img/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/img/og.jpg" },
    ],
  }),
  component: StudioAviSite,
});
