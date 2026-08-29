/* ==========================================================================
   מקור אמת יחיד לפרטי העסק ולאינטגרציות.
   אסור לפזר שם, כתובת, טלפון או מייל בגוף הקוד — הכל נשאב מכאן.
   ========================================================================== */

export const SITE = {
  legalName: "אבי דיגמי – סטודיו Smart Click",
  brandName: "סטודיו אבי",
  businessId: "209228527",
  address: "לכיש 73, קרית ים",
  /** כתובת לפניות פרטיות, נגישות ומימוש זכויות */
  privacyEmail: "socialmediavers@gmail.com",
  /** כתובת יצירת הקשר הכללית שמוצגת באתר */
  contactEmail: "avidigmi14@gmail.com",
  phone: "055-6696675",
  /** מספר בפורמט בינלאומי, לקישורי tel: ו-wa.me */
  phoneIntl: "+972556696675",
  whatsapp: "https://wa.me/972556696675",
  domain: "avidigmi.com",
  origin: "https://avidigmi.com",
} as const;

/**
 * אינטגרציות צד שלישי.
 * מחרוזת ריקה = האינטגרציה לא קיימת ולא נטענת בשום מצב.
 * התשתית קיימת וממתינה — הערכים נכנסים כשייפתחו החשבונות.
 */
export const INTEGRATIONS = {
  metaPixelId: "", // marketing
  gaMeasurementId: "", // analytics
  googleAdsId: "", // marketing
  googleAdsLabel: "",
  newsletterProvider: "" as "" | string,
} as const;

/**
 * וידג'ט הנגישות (Enable).
 * מסווג necessary: הוא הכלי שמממש את חובת הנגישות לפי תקנות שוויון זכויות,
 * הוא אינו כלי מדידה או פרסום, והוא שומר רק את העדפות התצוגה של הגולש.
 * חסימתו מאחורי הסכמה הייתה שוללת נגישות ממי שסירב לקוקיז.
 */
export const ACCESSIBILITY_WIDGET = {
  enabled: true,
  src: "https://cdn.enable.co.il/licenses/enable-L250910gwmq3j4lk-0324-83630/init.js",
  vendor: "Enable",
} as const;

/**
 * היכן יושב המידע בפועל.
 * crmRegion — האזור של פרויקט ה-Supabase של ה-CRM. כל עוד ריק, המדיניות
 * אומרת "מחוץ לישראל" בלי לנקוב באזור, וזו אמירה נכונה אך חלקית.
 * מלא אותו אחרי בדיקה בדשבורד Supabase.
 */
export const DATA_LOCATIONS = {
  crmRegion: "",
  emailRegion: "",
} as const;

/** תאריך העדכון האחרון של המסמכים המשפטיים. ריק = build של פרודקשן נכשל. */
export const LAST_UPDATED = "2026-08-30";
