import { SITE } from "@/config/site";
import { COOKIE_CATEGORIES } from "@/content/legal/cookieRegistry";
import { CONSENT_MAX_AGE_DAYS } from "@/lib/consent/types";
import type { LegalBlock, LegalDoc } from "@/components/legal/LegalPage";

const KIND_LABEL: Record<string, string> = {
  cookie: "Cookie",
  localStorage: "אחסון מקומי",
  sessionStorage: "אחסון לשונית",
};

/** בונה את הפירוט מהמרשם עצמו, כדי שהעמוד לא יסטה ממה שנטען בפועל */
const categoryBlocks: LegalBlock[] = COOKIE_CATEGORIES.flatMap((cat) => {
  const head: LegalBlock[] = [
    { type: "h3", text: cat.title },
    { type: "p", text: cat.description },
  ];

  if (!cat.cookies.length) {
    return [...head, { type: "note", text: cat.emptyNote ?? "" } as LegalBlock];
  }

  return [
    ...head,
    {
      type: "table",
      head: ["שם", "ספק", "מטרה", "סוג", "משך חיים"],
      rows: cat.cookies.map((c) => [c.name, c.vendor, c.purpose, KIND_LABEL[c.kind], c.ttl]),
    } as LegalBlock,
  ];
});

export const cookiesDoc: LegalDoc = {
  title: "מדיניות Cookie",
  lede: `העמוד הזה מפרט בדיוק אילו קובצי Cookie ואילו פריטי אחסון מקומי פועלים באתר ${SITE.domain}, למה הם משמשים, כמה זמן הם נשמרים, ואיך משנים את ההסכמה בכל רגע.`,
  sections: [
    {
      id: "what",
      title: "מה זה Cookie",
      blocks: [
        {
          type: "p",
          text: "קובץ Cookie הוא קובץ טקסט קטן שאתר שומר בדפדפן שלך. אתרים משתמשים בו כדי לזכור דברים בין עמודים ובין ביקורים — למשל שכבר בחרת הגדרות מסוימות. לצד קובצי Cookie קיימים גם אחסון מקומי (localStorage) ואחסון לשונית (sessionStorage), שפועלים על אותו עיקרון: מידע שנשמר בדפדפן שלך ולא אצלנו.",
        },
        {
          type: "p",
          text: "האתר הזה משתמש בעיקר באחסון מקומי ובאחסון לשונית, ובהיקף מצומצם. שום פריט מהם אינו מכיל את פרטי הפנייה שלך, את כתובת ה-IP שלך או מזהה אישי אחר.",
        },
      ],
    },
    {
      id: "categories",
      title: "ארבע הקטגוריות והפירוט המלא",
      blocks: [
        {
          type: "p",
          text: "אנחנו מחלקים את הקוקיז לארבע קטגוריות. את הקטגוריה ההכרחית אי אפשר לכבות; שלוש האחרות תלויות אך ורק בבחירה שלך, וברירת המחדל שלהן היא כבוי.",
        },
        ...categoryBlocks,
      ],
    },
    {
      id: "consent",
      title: "איך אנחנו מבקשים הסכמה",
      blocks: [
        {
          type: "ul",
          items: [
            "בכניסה הראשונה לאתר מוצג באנר שמאפשר לאשר הכול, להסתפק בהכרחיים בלבד, או לבחור קטגוריה-קטגוריה.",
            "עד שתבחר — שום סקריפט של צד שלישי לא נטען. לא נטען ומושתק, אלא לא נטען כלל.",
            "אין דרך לסגור את הבאנר בלי לבחור, ואין הסכמה משתמעת מהמשך גלילה.",
            `הבחירה נשמרת ל-${CONSENT_MAX_AGE_DAYS} יום, ולאחר מכן נשאל אותך שוב.`,
            "אם נוסיף כלי חדש או נשנה את המדיניות באופן מהותי, נעלה את גרסת ההסכמה והבאנר יופיע מחדש.",
          ],
        },
      ],
    },
    {
      id: "change",
      title: "איך משנים את ההסכמה",
      blocks: [
        {
          type: "p",
          text: "ההסכמה הפיכה באותה קלות שבה ניתנה. אפשר לשנות אותה כאן ועכשיו, בכפתור שבתחתית הסעיף, וכן דרך הקישור \"הגדרות Cookie\" שמופיע בתחתית כל עמוד באתר, או בכפתור העגול הקבוע בפינת המסך.",
        },
        {
          type: "p",
          text: "במרכז ההעדפות יש גם כפתור **מחיקת ההסכמה שלי**, שמוחק לחלוטין את הרשומה מהדפדפן ומחזיר את האתר למצב ההתחלתי שבו דבר אינו נטען.",
        },
      ],
    },
    {
      id: "browser",
      title: "חסימה ברמת הדפדפן",
      blocks: [
        {
          type: "p",
          text: "אפשר גם לחסום או למחוק קובצי Cookie ואחסון מקומי ישירות בדפדפן, ללא קשר להגדרות באתר הזה. ההגדרות נמצאות בדרך כלל תחת פרטיות ואבטחה:",
        },
        {
          type: "ul",
          items: [
            "Chrome — הגדרות ← פרטיות ואבטחה ← קובצי Cookie ונתוני אתרים.",
            "Safari — העדפות ← פרטיות ← ניהול נתוני אתרים.",
            "Firefox — הגדרות ← פרטיות ואבטחה ← קובצי Cookie ונתוני אתרים.",
            "Edge — הגדרות ← קובצי Cookie והרשאות אתר.",
          ],
        },
        {
          type: "note",
          text: "שים לב: חסימה גורפת בדפדפן תמחק גם את רשומת ההסכמה שלנו, ולכן הבאנר יופיע שוב בכל כניסה, וייתכן שגם העדפות סרגל הנגישות לא יישמרו.",
        },
      ],
    },
    {
      id: "more",
      title: "מידע נוסף",
      blocks: [
        {
          type: "p",
          text: `הסבר מלא על המידע האישי שאנחנו אוספים, למי הוא מועבר וכמה זמן הוא נשמר נמצא ב[מדיניות הפרטיות](/privacy). למימוש זכות עיון, תיקון או מחיקה — [עמוד הפניות בנושא מידע אישי](/data-request) או [${SITE.privacyEmail}](mailto:${SITE.privacyEmail}).`,
        },
      ],
    },
  ],
};
