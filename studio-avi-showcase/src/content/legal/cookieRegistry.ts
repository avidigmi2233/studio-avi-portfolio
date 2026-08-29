/* ==========================================================================
   מרשם הקוקיז — מקור אמת יחיד למרכז ההעדפות ולעמוד /cookies.
   רושמים כאן אך ורק מה שנכתב בפועל. קטגוריה ריקה נשארת ריקה בגלוי;
   טבלה שמתארת איסוף שלא קורה היא ליקוי בדיוק כמו טבלה חסרה.
   ========================================================================== */

import { SITE } from "@/config/site";
import type { ConsentCategory } from "@/lib/consent/types";

export type CookieEntry = {
  name: string;
  vendor: string;
  purpose: string;
  kind: "cookie" | "localStorage" | "sessionStorage";
  ttl: string;
};

export type CategoryInfo = {
  key: ConsentCategory;
  title: string;
  description: string;
  locked?: boolean;
  cookies: CookieEntry[];
  /** מוצג כשאין רשומות — אומר במפורש שאין איסוף */
  emptyNote?: string;
};

export const COOKIE_CATEGORIES: CategoryInfo[] = [
  {
    key: "necessary",
    title: "הכרחיים",
    description:
      "נדרשים כדי שהאתר יעבוד: שמירת בחירת ההסכמה שלך, העדפות הנגישות שבחרת, והמידע התפעולי שנדרש כדי לטפל בפנייה שאתה בוחר לשלוח. אי אפשר לכבות אותם.",
    locked: true,
    cookies: [
      {
        name: "ad_consent",
        vendor: SITE.brandName,
        purpose: "שומר את בחירת ההסכמה שלך כדי שלא נשאל שוב בכל עמוד",
        kind: "localStorage",
        ttl: "180 יום",
      },
      {
        name: "sa_attribution",
        vendor: SITE.brandName,
        purpose:
          "שומר מאיזה קישור הגעת, כדי לצרף את המידע הזה לפנייה שאתה בוחר לשלוח. לא נשלח לשום צד שלישי.",
        kind: "sessionStorage",
        ttl: "עד סגירת הלשונית",
      },
      {
        name: "sa_pending_lead",
        vendor: SITE.brandName,
        purpose: "מחזיק אירוע שליחת טופס שממתין להחלטת הסכמה, ונמחק מיד לאחר מכן",
        kind: "sessionStorage",
        ttl: "עד סגירת הלשונית",
      },
      {
        name: "העדפות וידג'ט הנגישות",
        vendor: "Enable",
        purpose:
          "שומר את התאמות התצוגה שבחרת בסרגל הנגישות (ניגודיות, גודל טקסט וכדומה) כדי שיישמרו בביקור הבא",
        kind: "localStorage",
        ttl: "לפי הגדרת הספק",
      },
    ],
  },
  {
    key: "functional",
    title: "פונקציונליים",
    description:
      "תוכן שנטען משירותים חיצוניים — סרטונים מוטמעים, מפות או וידג'ט צ'אט. כשתאשר, תוכן כזה ייטען וייתכן שהספק שלו יציב קובצי Cookie משלו.",
    cookies: [],
    emptyNote:
      "כרגע אין באתר תוכן מוטמע מספק חיצוני. הסרטונים מנוגנים מקבצים של האתר עצמו, וקישור הוואטסאפ הוא קישור רגיל שאינו מציב Cookie.",
  },
  {
    key: "analytics",
    title: "מדידה וסטטיסטיקה",
    description:
      "עוזרים להבין אילו עמודים נצפים וכמה זמן, כדי לשפר את האתר. המידע מצטבר ואינו משמש לפרסום.",
    cookies: [],
    emptyNote:
      "כרגע לא מותקנת באתר מערכת מדידה, ולכן אין קוקיז בקטגוריה הזו. אם תותקן אחת, היא תופיע כאן והבאנר יחזור לשאול אותך מחדש.",
  },
  {
    key: "marketing",
    title: "שיווק ופרסום",
    description:
      "משמשים למדידת יעילות מודעות ולהצגת פרסום מותאם ברשתות חברתיות.",
    cookies: [],
    emptyNote:
      "כרגע לא מותקן באתר פיקסל פרסומי או כלי רימרקטינג כלשהו, ולכן אין קוקיז בקטגוריה הזו. אם יותקן, הוא יופיע כאן והבאנר יחזור לשאול אותך מחדש.",
  },
];
