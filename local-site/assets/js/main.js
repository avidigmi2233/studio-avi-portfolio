/* ==========================================================================
   סטודיו אבי — לוגיקת האתר
   ==========================================================================
   מנוע הווידאו נכתב מחדש. הבאגים שתוקנו לעומת הגרסה הקודמת:
   1. חשיפה (reveal) הייתה מופעלת גם מהנגן הישן (onCanPlayThrough/onTimeUpdate
      על שכבה לא־פעילה) — זה החזיר לרגע את הקטע הקודם ואז ניקה בטעות את
      השכבה של הקטע החדש, מה שהשאיר מסך שחור. עכשיו לכל בקשת ניגון יש טוקן,
      ורק הנגן הנכנס של אותו טוקן יכול להיחשף.
   2. שני הנגנים ניגנו במקביל — הישן המשיך לרוץ מוסתר, בזבז רוחב פס ושיגר
      אירועים. עכשיו הישן נעצר ומשוחרר מיד אחרי הקרוספייד.
   3. ה-preload היה אלמנט וידאו שלישי שהוריד את הקובץ פעם נוספת. עכשיו הנגן
      שהתפנה הוא זה שטוען מראש את הקטע הבא — אפס הורדות כפולות.
   4. onEnded לא היה מוגן מפני קפיצה בסרגל — callback ישן רץ אחרי ניווט.
      עכשיו הטוקן פוסל כל סיום שלא שייך לניגון הנוכחי.
   5. כשל טעינה נבלע בשקט והאתר התקדם למסך שחור. עכשיו מוצגת הודעה מפורשת.
   ========================================================================== */

/* ═══════════════════ תצורת מדיה ═══════════════════
   USE_SUPABASE=false → הקבצים המקומיים (H.264, faststart) — עובד היום.
   USE_SUPABASE=true  → האיחסון החיצוני. שים לב: נכון לעכשיו 3/5/6 שם
   מקודדים ב-HEVC 10-bit ולא ינוגנו בכרום/פיירפוקס/אדג'. להעלות קודם את
   הקבצים המתוקנים ואז להפוך את הדגל. */
const USE_SUPABASE = false;
const SUPABASE_BASE = "https://pgjhlctemibeidvpvudq.supabase.co/storage/v1/object/public/videos";
const LOCAL_BASE = "assets/video";
const LOCAL_POSTER = "assets/img/1.png";

const mediaUrl = (file) => (USE_SUPABASE ? `${SUPABASE_BASE}/${file}` : `${LOCAL_BASE}/${file}`);
const POSTER_SRC = USE_SUPABASE ? `${SUPABASE_BASE}/1.png` : LOCAL_POSTER;

const CLIP_ORDER = ["s2", "s3", "s4", "s5", "s6"];
const CLIPS = { s2: "2.mp4", s3: "3.mp4", s4: "4.mp4", s5: "5.mp4", s6: "6.mp4" };
const clipUrl = (name) => mediaUrl(CLIPS[name]);

/* ═══════════════════ תוכן ═══════════════════ */
const TOTAL_PAGES = 9;
const CONTACT_EMAIL = "avidigmi14@gmail.com";
const WHATSAPP =
  "https://wa.me/972556696675?text=" +
  encodeURIComponent("היי אבי הגעתי מהאתר :) אשמח לפרטים בנוגע ל..");

const ACTS = [
  {
    n: 1,
    lines: ["אני בונה אתרים", "שלא מהעולם הזה"],
    lede: 'בזמן שהמתחרים שלכם תקועים בתבנית <strong>אתם נכנסים דרך שער</strong>. חוויות גלילה קולנועיות, עולמות תלת מימד ואנימציה שמספרות סיפור. אתרים שאנשים זוכרים, לא רק גוללים.',
    cta: "פתחו את השער",
    hint: "לחץ כאן ונצא לדרך",
    clip: "s2",
  },
  {
    n: 2,
    eyebrow: "הבידול",
    lines: ["אתר רגיל מציג מידע.", "אתר שלי מייצר תחושה."],
    lede: 'לקוח שוכח מה כתוב באתר תוך שנייה — הוא לא שוכח איך האתר גרם לו להרגיש. כל פרויקט נבנה מאפס, כולל עולם תלת מימד ותנועה משלו: <strong>בלי ערכות עיצוב, בלי תבניות</strong>, בלי עוד אתר כמו כולם.',
    cta: "התקדמו אל הארמון",
    clip: "s3",
  },
  {
    n: 3,
    eyebrow: "הכניסה",
    lines: ["מאחורי הדלת הזו", "נמצא המותג שלכם"],
    lede: "עיצוב, קוד, תלת מימד וביצועים — הכול תחת גג אחד. התוצאה: אתר שנטען מהר, מדורג בגוגל, וממיר מבקרים ללקוחות בלי לוותר על שום רושם.",
    cta: "היכנסו פנימה",
    clip: "s4",
  },
];

const PROJECTS = [
  {
    no: "01",
    href: "https://tayargroup.com/",
    img: "assets/img/covers/tayar.jpg",
    alt: "קאבר פרויקט טאיאר — אתר תדמית לחברת פתרונות ניקיון",
    title: "טאיאר · פתרונות ניקיון",
    body: "אתר תדמית B2B בעברית מלאה, שנבנה כדי להפוך גולשים ללידים: כותרת ראשית על גבי צילומי נכסים, תפריט צף ומסלול פנייה כפול — ייעוץ מקצועי או צפייה בשירותים.",
    tag: "תדמית · B2B",
  },
  {
    no: "02",
    href: "https://projects.avidigmi.com/business-consultant/",
    img: "assets/img/covers/dominic.webp",
    alt: "קאבר פרויקט דומיניק — דף נחיתה למותג אישי",
    title: "דומיניק · מיתוג אישי",
    body: "דף נחיתה למותג אישי שממקם את האדם, לא את רשימת השירותים, במרכז: צילום סטודיו במסך מלא, ניגודיות גבוהה וטיפוגרפיה נקייה שמעבירות אמינות כבר בפגישה הראשונה עם הגולש.",
    tag: "מיתוג אישי · Landing Page",
  },
  {
    no: "03",
    href: "https://timingwatches.co.il/home/",
    img: "assets/img/covers/timing.jpg",
    alt: "קאבר פרויקט טיימינג — קטלוג שעוני יוקרה",
    title: "טיימינג · שעוני יוקרה",
    body: "קטלוג בוטיק לשעונים מכניים שגורם למסך להרגיש כמו ויטרינה: צילומי מאקרו בפריים רחב, גלילה איטית ופרטים שנחשפים בהדרגה — תחושת חנות יוקרה, לא טבלת מוצרים.",
    tag: "מסחר · קטלוג יוקרה",
  },
];

const SKILLS = [
  { b: "עיצוב", s: "שפה חזותית, טיפוגרפיה עברית, מערכת מסכים" },
  { b: "פיתוח", s: "HTML · CSS · JavaScript, בלי תלות בתבניות" },
  { b: "תלת מימד", s: "מידול, תאורה ורינדור — עולמות תלת ממדיים שרצים חלק בדפדפן", accent: "dim" },
  { b: "אנימציה", s: "גלילה, רצפי תמונות, מעברים מבוססי תנועה" },
  { b: "ביצועים", s: "מהירות טעינה, נגישות, SEO טכני" },
];

const SERVICES = [
  { num: "01", h: "אתרי תדמית קולנועיים", p: "חוויית גלילה עם וידאו מפורק לפריימים, אנימציות מבוססות תנועה וסיפור שמתגלה שלב אחרי שלב — כמו סרט קצר על המותג שלכם.", ico: "film" },
  { num: "02", h: "עולמות תלת מימד", p: "סצנות ואובייקטים תלת ממדיים בזמן אמת בתוך הדפדפן — לוגו שמסתובב, מוצר שאפשר לסובב, סצנה שמגיבה לגלילה. לא סרטון, אתר שחי.", accent: "dim", ico: "boxes" },
  { num: "03", h: "דפי נחיתה שממירים", p: "עיצוב שמושך את העין ומבנה שמוביל ללחיצה. מהירות, בהירות ומסר אחד חד — בלי הסחות דעת, לקמפיינים שצריכים להמיר מהיום הראשון.", ico: "target" },
  { num: "04", h: "חנויות ומערכות", p: "מסחר אונליין, אזורים אישיים וממשקי ניהול. פונקציונליות מלאה בעטיפה שלא נראית כמו תבנית.", ico: "bag" },
  { num: "05", h: "מיתוג דיגיטלי מלא", p: "שפה חזותית, טיפוגרפיה עברית, מוטיבים, אנימציה ותלת מימד — מערכת שלמה שעובדת בכל מסך ובכל מדיה.", ico: "palette" },
];

const STEPS = [
  { n: "01", h: "שיחת גילוי", p: "מבינים את המותג, הקהל והמטרה. יוצאים עם כיוון יצירתי אחד ברור.", ico: "phone" },
  { n: "02", h: "קונספט ועיצוב", p: "מסך ראשון שמכריע. מכאן בונים שפה שלמה — כולל עולם תלת מימד כשרלוונטי — לכל שאר האתר.", ico: "pen" },
  { n: "03", h: "פיתוח ואנימציה", p: "קוד נקי, אנימציית תנועה ותלת מימד אינטראקטיבי, אופטימיזציה לנייד ולמנועי חיפוש.", ico: "sparkles" },
  { n: "04", h: "שיגור וליווי", p: "עולים לאוויר, מודדים, משפרים. אתם לא נשארים לבד אחרי המסירה.", ico: "rocket" },
];

const FAQ = [
  { q: "כמה עולה אתר כזה?", a: "אין מחירון אחיד, כי אין שני פרויקטים זהים. אתר תדמית מתחיל בדרך כלל באזור 8,000 ₪, וחוויה קולנועית מלאה עם עולם תלת מימד, רצפי תמונות ואנימציה נעה בטווח גבוה יותר. אחרי שיחה אחת קצרה תקבלו הצעת מחיר מפורטת, ללא עלות וללא התחייבות." },
  { q: "כמה זמן לוקח לבנות?", a: "דף נחיתה — שבועיים עד שלושה. אתר תדמית מלא — ארבעה עד שמונה שבועות, תלוי בכמות התוכן ובהיקף האנימציה. אני עובד על מספר פרויקטים מצומצם במקביל, כך שלוח הזמנים שנקבע בהתחלה הוא זה שנשמר." },
  { q: "האם האתר יהיה מהיר גם עם כל האנימציות?", a: "כן — זה בדיוק העניין. הכול נכתב ידנית בלי ספריות מיותרות ובלי בילדרים, אלמנטים תלת ממדיים נטענים ומותאמים במשקל הנכון למסך, התמונות נשלחות בפורמט WebP במידה המדויקת, והחוויות הכבדות נטענות ברקע בזמן שאתם כבר קוראים. האתר הזה עצמו נטען בכ-1.2 שניות." },
  { q: "אני יכול לערוך את התוכן בעצמי אחר כך?", a: "בהחלט. אם זה חשוב לכם, אני מחבר את האתר למערכת ניהול תוכן פשוטה שמאפשרת לעדכן טקסטים, תמונות ופרויקטים בלי לגעת בקוד. אם אתם מעדיפים שאני אטפל בעדכונים — יש גם מסלול ליווי חודשי." },
  { q: "למי שייך האתר בסוף?", a: "לכם. הקוד, העיצוב, הדומיין והחשבונות רשומים על שמכם ומועברים אליכם במסירה. אין נעילה לפלטפורמה שלי ואין דמי שימוש חודשיים כדי שהאתר פשוט ימשיך לעבוד." },
];

const MENU = [
  { p: 1, name: "פתיחה", note: "מסך הכניסה" },
  { p: 2, name: "הבידול", note: "למה זה שונה" },
  { p: 3, name: "הכניסה", note: "אל מאחורי הדלת" },
  { p: 4, name: "פרויקטים", note: "הפורטפוליו" },
  { p: 5, name: "אודות", note: "מי עומד מאחורי זה" },
  { p: 6, name: "שירותים", note: "מה אני בונה" },
  { p: 7, name: "תהליך", note: "איך זה עובד" },
  { p: 8, name: "שאלות נפוצות", note: "מחיר, זמנים, בעלות" },
  { p: 9, name: "יצירת קשר", note: "הצעד האחרון" },
];

const SECTION_IDS = { 4: "projects", 5: "about", 6: "services", 7: "process", 8: "faq", 9: "contact" };

/* ═══════════════════ אייקונים ═══════════════════ */
const ICONS = {
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
  boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/>',
  pen: '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
};
const svg = (name, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

/* ═══════════════════ עזרים ═══════════════════ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, "0");
const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () => window.matchMedia("(hover:hover) and (pointer:fine)").matches;

/* ══════════════════════════════════════════════════════════════════════════
   מנוע הווידאו
   ══════════════════════════════════════════════════════════════════════════ */
const stageEl = $("#stage");
const posterEl = $("#stagePoster");
const videos = [$("#videoA"), $("#videoB")];

const VideoStage = {
  activeIdx: -1,      // איזה נגן מוצג כרגע (-1 = אף אחד, רק הפוסטר)
  token: 0,           // מזהה ניגון — כל בקשה חדשה פוסלת את הקודמת
  ac: null,           // מבטל את המאזינים של הבקשה הקודמת
  current: null,      // שם הקטע המוצג
  failTimer: 0,

  /** עוצר הכול וחוזר לפוסטר */
  clear() {
    this.token++;
    if (this.ac) this.ac.abort();
    clearTimeout(this.failTimer);
    videos.forEach((v) => {
      v.classList.remove("is-active");
      v.pause();
      v.removeAttribute("src");
      v.load();
      v.loop = false;
    });
    this.activeIdx = -1;
    this.current = null;
    stageEl.classList.remove("is-playing");
  },

  /**
   * מנגן קטע פעם אחת. בסיום הווידאו נעצר ונשאר קפוא על הפריים האחרון —
   * אין שום לופ בשום שלב, האתר ממתין ללחיצה.
   * @param {string} name  שם הקטע (s2..s6)
   * @param {{onEnd?:()=>void, still?:boolean}} opts
   *   still=true → לא מנגן בכלל, רק מציג את הפריים האחרון (לקפיצה בסרגל)
   */
  play(name, opts = {}) {
    const { onEnd = null, still = false } = opts;
    const url = clipUrl(name);
    const myToken = ++this.token;

    if (this.ac) this.ac.abort();
    this.ac = new AbortController();
    const { signal } = this.ac;
    clearTimeout(this.failTimer);

    const inIdx = this.activeIdx === 0 ? 1 : 0;
    const outIdx = this.activeIdx;
    const inEl = videos[inIdx];
    const outEl = outIdx >= 0 ? videos[outIdx] : null;

    /* אם אותו קטע כבר מוצג — לא טורפים את המסך */
    if (this.current === name && outEl) {
      if (still) return;                       // כבר מוצג, אין מה לעשות
      if (onEnd) this.bindEnd(outEl, myToken, onEnd, signal);
      try { outEl.currentTime = 0; } catch (_) {}
      outEl.play().catch(() => {});
      return;
    }

    inEl.loop = false;
    inEl.muted = true;
    inEl.playsInline = true;
    /* הנגן שהתפנה כבר טען מראש את הקטע הבא — אם זה הקטע הנכון, אין load מחדש */
    const already = inEl.getAttribute("src") === url;
    if (!already) {
      inEl.setAttribute("src", url);
      inEl.load();
    }
    try { if (inEl.currentTime > 0.05) inEl.currentTime = 0; } catch (_) {}

    let revealed = false;
    const reveal = () => {
      if (revealed || myToken !== this.token) return;
      revealed = true;
      clearTimeout(this.failTimer);

      inEl.classList.add("is-active");
      this.activeIdx = inIdx;
      this.current = name;
      stageEl.classList.add("is-playing");

      if (outEl && outEl !== inEl) {
        const delay = calm() ? 0 : 460;
        setTimeout(() => {
          /* רק אם בינתיים לא חזר להיות הפעיל */
          if (this.activeIdx === inIdx) {
            outEl.classList.remove("is-active");
            outEl.pause();
            outEl.loop = false;
            /* הנגן שהתפנה הופך לטוען-מראש של הקטע הבא — בלי הורדה כפולה */
            const nx = CLIP_ORDER[CLIP_ORDER.indexOf(name) + 1];
            if (nx) {
              outEl.setAttribute("src", clipUrl(nx));
              outEl.load();
            } else {
              outEl.removeAttribute("src");
              outEl.load();
            }
          }
        }, delay);
      } else {
        /* אין שכבה קודמת (הקטע הראשון) — טוענים מראש את הבא על הנגן הפנוי */
        const nx = CLIP_ORDER[CLIP_ORDER.indexOf(name) + 1];
        if (nx) this.preload(nx);
      }
    };

    /* חושפים רק כשיש פריים אמיתי על המסך — לא על loadeddata */
    const tryReveal = () => {
      if (myToken !== this.token) return;
      if (inEl.readyState >= 2 && inEl.currentTime > 0) reveal();
    };
    inEl.addEventListener("timeupdate", tryReveal, { signal });
    inEl.addEventListener("playing", tryReveal, { signal });
    inEl.addEventListener("seeked", tryReveal, { signal });

    if (still) {
      /* מצב "פריים אחרון": מדלגים לסוף בלי לנגן, כך שהרקע נראה בדיוק כמו
         אחרי שהקטע הסתיים — ובלי שום לופ. */
      const seekEnd = () => {
        if (myToken !== this.token) return;
        const d = inEl.duration;
        if (isFinite(d) && d > 0) {
          try { inEl.currentTime = Math.max(0, d - 0.05); } catch (_) {}
        }
      };
      if (inEl.readyState >= 1) seekEnd();
      else inEl.addEventListener("loadedmetadata", seekEnd, { signal, once: true });
    } else {
      inEl.addEventListener("loadeddata", () => {
        if (myToken !== this.token) return;
        inEl.play().catch(() => {});
      }, { signal });
      if (onEnd) this.bindEnd(inEl, myToken, onEnd, signal);
    }

    inEl.addEventListener("error", () => {
      if (myToken !== this.token) return;
      const code = inEl.error ? inEl.error.code : 0;
      showMediaError(`${CLIPS[name]} — קוד ${code}. אם הקובץ מקודד ב-HEVC/H.265 הדפדפן לא ינגן אותו.`);
      /* לא משאירים את האתר תקוע: ממשיכים הלאה, אבל בלי לנקות את הפריים הקיים */
      if (onEnd) { const f = onEnd; setTimeout(() => { if (myToken === this.token) f(); }, 400); }
    }, { signal });

    if (!still) inEl.play().catch(() => {});

    /* רשת ביטחון: אם תוך 8 שניות עדיין אין פריים — חושפים בכל מקרה כדי לא
       להיתקע. זו לא שגיאה (יכול להיות פשוט חיבור איטי), לכן רק אזהרה בקונסול
       ובלי הודעה למשתמש — ההודעה שמורה לכשל טעינה אמיתי. */
    this.failTimer = setTimeout(() => {
      if (myToken !== this.token || revealed) return;
      console.warn(`[media] ${CLIPS[name]} לא הגיע למצב ניגון תוך 8 שניות — נחשף בכל זאת.`);
      reveal();
    }, 8000);
  },

  /** טוען מראש קטע אל הנגן שישמש לניגון הבא — בלי להוריד פעמיים */
  preload(name) {
    const idx = this.activeIdx === 0 ? 1 : 0;
    const v = videos[idx];
    const url = clipUrl(name);
    if (v.getAttribute("src") !== url && !v.classList.contains("is-active")) {
      v.setAttribute("src", url);
      v.load();
    }
  },

  bindEnd(el, myToken, fn, signal) {
    el.addEventListener("ended", () => {
      if (myToken !== this.token) return;   // סיום של ניגון שכבר בוטל
      this.token++;                          // נועל סיומים נוספים של אותו ניגון
      fn();
    }, { signal, once: true });
  },
};

/* הודעת שגיאת מדיה */
const errBox = $("#mediaErr");
const errMsg = $("#mediaErrMsg");
$("#mediaErrClose").addEventListener("click", () => (errBox.hidden = true));
function showMediaError(msg) {
  errMsg.textContent = msg;
  errBox.hidden = false;
  console.error("[media]", msg);
}

/* ══════════════════════════════════════════════════════════════════════════
   מצב האתר
   ══════════════════════════════════════════════════════════════════════════ */
const state = { phase: "acts", act: 1, page: 1, playing: false, menuOpen: false, dim: 0, cue: false };

const el = {
  acts: $("#acts"), actBox: $("#actBox"), actEyebrow: $("#actEyebrow"),
  actLine1: $("#actLine1"), actLine2: $("#actLine2"), actLede: $("#actLede"),
  actCta: $("#actCta"), actCtaLabel: $("#actCtaLabel"), actHint: $("#actHint"),
  gate: $("#gate"), gateFoot: $("#gateFoot"), gateCta: $("#gateCta"), gateGrid: $("#gateGrid"),
  story: $("#story"), rail: $("#pageRail"), railNum: $("#railNum"), railBars: $("#railBars"),
  framePage: $("#framePage"), progress: $("#progressBar"), dim: $("#stageDim"),
  toprail: $("#toprail"), toprailFade: $("#toprailFade"), skip: $("#btnSkip"), restart: $("#btnRestart"),
  menuBtn: $("#btnMenu"), menuLabel: $("#menuLabel"), menu: $("#site-menu"), menuList: $("#menuList"),
  wa: $("#waBtn"), cue: $("#scrollCue"), blink: $("#blink"),
};

posterEl.src = POSTER_SRC;

/* ═══════════════════ רינדור תוכן ═══════════════════ */
function projectCard(p, i, compact) {
  return `<article class="proj" data-i="${i}">
    <a class="proj__a" href="${p.href}" target="_blank" rel="noopener noreferrer"
       aria-label="צפייה באתר ${p.title} — נפתח בלשונית חדשה" style="animation-delay:${i * -2.6}s">
      <span class="proj__no" dir="ltr">${p.no}</span>
      <img class="proj__img" src="${p.img}" alt="${p.alt}" loading="lazy">
      <span class="proj__spot" aria-hidden="true"></span>
      <span class="proj__shine" aria-hidden="true"></span>
      <span class="proj__veil" aria-hidden="true"></span>
      <span class="proj__cta">צפייה באתר ${svg("arrowUpRight")}</span>
    </a>
    ${compact ? "" : `<div class="proj__meta">
      <h3 class="proj__title">${p.title}</h3>
      <span class="proj__ul" aria-hidden="true"></span>
      <p class="proj__body">${p.body}</p>
      <span class="proj__tag">${p.tag}</span>
    </div>`}
  </article>`;
}

function glow(inner, { accent, cls = "", bloom = true } = {}) {
  return `<div class="glow ${accent === "dim" ? "glow--dim" : ""} ${cls}">
    <div class="glow__in">
      <span class="glow__spot" aria-hidden="true"></span>
      ${bloom ? '<span class="glow__bloom" aria-hidden="true"></span>' : ""}
      <span class="glow__edge" aria-hidden="true"></span>
      <div class="glow__body">${inner}</div>
    </div>
  </div>`;
}

function renderAll() {
  el.gateGrid.innerHTML = PROJECTS.map((p, i) => projectCard(p, i, true)).join("");
  $("#projGrid").innerHTML = PROJECTS.map((p, i) => `<div data-rv="${i * 140}">${projectCard(p, i, false)}</div>`).join("");

  $("#skillsList").innerHTML = SKILLS.map((s, i) =>
    `<li data-rv="${i * 90}">${glow(`<b>${s.b}</b><span>${s.s}</span>`, { accent: s.accent, bloom: false })}</li>`
  ).join("");

  $("#svcGrid").innerHTML = SERVICES.map((s, i) =>
    `<div class="svc" data-i="${i}" data-rv="${i * 110}">${glow(
      `<span class="svc-ico">${svg(s.ico)}</span>
       <span class="svc-num" dir="ltr">${s.num}</span>
       <h3 class="svc-h">${s.h}</h3>
       <p class="svc-p">${s.p}</p>`,
      { accent: s.accent, cls: "glow--h" }
    )}</div>`
  ).join("");

  $("#stepsList").innerHTML = STEPS.map((s, i) =>
    `<li class="step" data-rv="${i * 120}">
      <span class="step__node" aria-hidden="true"></span>
      <div class="step__float" style="animation-delay:${i * -1.9}s">${glow(
        `<div class="step__row"><span class="step__ico">${svg(s.ico)}</span><span class="step__n" dir="ltr">${s.n}</span></div>
         <h3 class="step__h">${s.h}</h3><p class="step__p">${s.p}</p>`
      )}</div>
    </li>`
  ).join("");

  $("#faqList").innerHTML = FAQ.map((f, i) =>
    `<div data-rv="${i * 90}">${glow(
      `<details><summary>${f.q}<span class="faq__plus">${svg("plus")}</span></summary>
       <div class="faq__a"><p>${f.a}</p></div></details>`,
      { bloom: false }
    )}</div>`
  ).join("");

  el.menuList.innerHTML = MENU.map((m) =>
    `<li><button class="menu__it" type="button" data-goto="${m.p}">
      <span class="menu__n" dir="ltr">${pad(m.p)}</span>
      <span class="menu__name">${m.name}</span>
      <span class="menu__note">${m.note}</span>
    </button></li>`
  ).join("");

  el.railBars.innerHTML = MENU.map((m) =>
    `<button class="rail__b" type="button" data-goto="${m.p}" aria-label="עמוד ${m.p} · ${m.name}"><span></span></button>`
  ).join("");

  $("#footPages").innerHTML = MENU.slice(3).map((m) =>
    `<li><a href="#${SECTION_IDS[m.p]}">${m.name}</a></li>`
  ).join("");

  el.wa.href = WHATSAPP;
  $("#menuWa").href = WHATSAPP;
  $("#footWa").href = WHATSAPP;
  $("#cWa").href = WHATSAPP;
  $("#menuMail").href = `mailto:${CONTACT_EMAIL}`;
  $("#footMail").href = `mailto:${CONTACT_EMAIL}`;
  $("#cMail").href = `mailto:${CONTACT_EMAIL}`;
  $("#year").textContent = new Date().getFullYear();
}

/* ═══════════════════ ציור מצב ═══════════════════ */
function renderAct() {
  const a = ACTS[state.act - 1];
  el.acts.dataset.act = String(state.act);
  el.actEyebrow.hidden = !a.eyebrow;
  el.actEyebrow.textContent = a.eyebrow || "";
  el.actLine1.textContent = a.lines[0];
  el.actLine2.textContent = a.lines[1];
  el.actLede.innerHTML = a.lede;
  el.actCtaLabel.textContent = a.cta;
  el.actHint.textContent = a.hint || "";
  el.actHint.hidden = !a.hint;
  /* מפעיל מחדש את אנימציות הכניסה */
  $$(".act__line>span, .act__lede, .act__cta").forEach((n) => {
    n.style.animation = "none";
    void n.offsetWidth;
    n.style.animation = "";
  });
}

function setBusy(on) {
  state.playing = on;
  el.actBox.classList.toggle("busy", on);
  el.gateFoot.classList.toggle("busy", on);
  el.actCta.classList.toggle("loading", on);
  el.actCta.disabled = on;
  el.gateCta.classList.toggle("loading", on);
  el.gateCta.disabled = on;
}

function setPage(n) {
  state.page = n;
  el.railNum.textContent = pad(n);
  el.framePage.textContent = pad(n);
  $$("#railBars .rail__b").forEach((b) => b.classList.toggle("on", +b.dataset.goto === n));
  $$("#menuList .menu__it").forEach((b) => b.classList.toggle("on", +b.dataset.goto === n));
  el.rail.classList.toggle("hide-mob", n === 4);
}

function setDim(v) {
  state.dim = v;
  el.dim.style.opacity = String(v);
}

function setPhase(p) {
  state.phase = p;
  el.acts.hidden = p !== "acts";
  el.gate.hidden = p !== "gate";
  el.story.hidden = p !== "open";
  el.skip.hidden = p === "open";
  el.restart.hidden = !(p === "open" && state.page >= 5);
  document.body.classList.toggle("is-locked", p !== "open" || state.menuOpen);
  if (p === "open") revealObserver.reconnect();
}

/* ═══════════════════ מעברים ═══════════════════ */
function advance() {
  if (state.playing) return;
  const a = ACTS[state.act - 1];
  setBusy(true);
  VideoStage.play(a.clip, {
    onEnd: () => {
      setBusy(false);
      /* הקטע נשאר קפוא על הפריים האחרון — בלי לופ, בלי הפעלה מחדש.
         הוא פשוט הופך לרקע הסטטי של המערכה הבאה עד הלחיצה הבאה. */
      if (state.act < 3) {
        state.act += 1;
        renderAct();
        setPage(state.act);
      } else {
        setPhase("gate");
        setPage(4);
        setDim(0.3);
      }
    },
  });
}

function leaveGate() {
  if (state.playing) return;
  setBusy(true);
  VideoStage.play("s5", {
    onEnd: () => {
      setBusy(false);
      setPhase("open");
      setPage(4);
      state.cue = true;
      el.cue.hidden = false;
      /* קטע הסיום מתנגן פעם אחת ונעצר על הפריים האחרון כרקע האתר */
      VideoStage.play("s6");
      window.scrollTo({ top: 0, behavior: "auto" });
    },
  });
}

function jumpTo(n) {
  n = Math.max(1, Math.min(TOTAL_PAGES, n));
  VideoStage.token++;           // מבטל כל מעבר שרץ
  setBusy(false);
  el.blink.classList.add("on");

  setTimeout(() => {
    closeMenu();
    if (n <= 3) {
      setPhase("acts");
      state.act = n;
      renderAct();
      setDim(0);
      state.cue = false;
      el.cue.hidden = true;
      if (n === 1) VideoStage.clear();
      else VideoStage.play(ACTS[n - 2].clip, { still: true });  // פריים אחרון קפוא
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      setPhase("open");
      VideoStage.play("s6", { still: true });
      requestAnimationFrame(() => {
        const t = document.getElementById(SECTION_IDS[n]);
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 96, behavior: "auto" });
      });
    }
    setPage(n);
    setTimeout(() => el.blink.classList.remove("on"), 16);
  }, 150);
}

/* ═══════════════════ תפריט ═══════════════════ */
function openMenu() {
  state.menuOpen = true;
  el.menu.classList.add("open");
  el.menu.removeAttribute("inert");
  el.menuBtn.setAttribute("aria-expanded", "true");
  el.menuBtn.setAttribute("aria-label", "סגירת תפריט");
  el.menuLabel.textContent = "סגירה";
  document.body.classList.add("menu-open", "is-locked");
  el.rail.classList.add("hide");
  el.wa.classList.add("hide");
  el.cue.classList.add("hide");
  $$("#menuList li").forEach((li, i) => (li.style.transitionDelay = `${i * 60 + 100}ms`));
}
function closeMenu() {
  state.menuOpen = false;
  el.menu.classList.remove("open");
  el.menu.setAttribute("inert", "");
  el.menuBtn.setAttribute("aria-expanded", "false");
  el.menuBtn.setAttribute("aria-label", "פתיחת תפריט");
  el.menuLabel.textContent = "תפריט";
  document.body.classList.remove("menu-open");
  document.body.classList.toggle("is-locked", state.phase !== "open");
  el.rail.classList.remove("hide");
  el.wa.classList.remove("hide");
  el.cue.classList.remove("hide");
  $$("#menuList li").forEach((li) => (li.style.transitionDelay = "0ms"));
}

/* ═══════════════════ גלילה ═══════════════════ */
function onScroll() {
  if (state.phase !== "open") return;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  el.progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  el.toprailFade.classList.toggle("on", y > 40 && !state.menuOpen);
  if (y > 60 && state.cue) { state.cue = false; el.cue.hidden = true; }
  setDim(Math.max(calm() ? 0.58 : 0, Math.min(0.84, (y / (window.innerHeight * 0.75)) * 0.84)));

  const mid = window.innerHeight / 2;
  let best = 4, bestDist = Infinity;
  for (const [n, id] of Object.entries(SECTION_IDS)) {
    const t = document.getElementById(id);
    if (!t) continue;
    const r = t.getBoundingClientRect();
    if (r.top <= mid && r.bottom >= mid) { best = +n; break; }
    const d = r.top > mid ? r.top - mid : mid - r.bottom;
    if (d < bestDist) { bestDist = d; best = +n; }
  }
  if (best !== state.page) setPage(best);
  el.restart.hidden = !(state.phase === "open" && state.page >= 5);
  revealObserver.sweep();

  /* קו הזמן בתהליך — נמשך עם הגלילה */
  const track = $("#track"), line = $("#trackLine");
  if (track && line) {
    if (calm()) line.style.transform = "scaleX(1)";
    else {
      const r = track.getBoundingClientRect();
      const start = window.innerHeight * 0.8, end = window.innerHeight * 0.65;
      const p = (start - r.top) / Math.max(1, r.height - (window.innerHeight - end));
      line.style.transform = `scaleX(${Math.max(0, Math.min(1, p))})`;
    }
  }
}

/* חשיפה בגלילה */
const revealObserver = {
  io: null,
  /** רשת ביטחון: חושף כל אלמנט שכבר נמצא באזור הנראה. רץ גם מ-onScroll,
      כך שגם אם ה-IntersectionObserver נכשל תוכן לעולם לא נשאר בלתי-נראה. */
  sweep() {
    const h = window.innerHeight || 800;
    $$("[data-rv]:not(.rv-in)").forEach((n) => {
      if (n.getBoundingClientRect().top < h * 0.95) n.classList.add("rv-in");
    });
  },
  reconnect() {
    if (this.io) this.io.disconnect();
    if (calm() || !("IntersectionObserver" in window)) {
      $$("[data-rv]").forEach((n) => n.classList.add("rv-in"));
      return;
    }
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const d = Number(e.target.dataset.rv || 0);
        setTimeout(() => e.target.classList.add("rv-in"), d);
        this.io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    $$("[data-rv]").forEach((n) => this.io.observe(n));
    this.sweep();
  },
};

/* ═══════════════════ אפקטי סמן ═══════════════════ */
function bindPointerFx() {
  if (!finePointer()) return;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".glow");
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    }
    const proj = e.target.closest(".proj__a");
    if (proj && !calm()) {
      const r = proj.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      proj.style.setProperty("--mx", `${px * 100}%`);
      proj.style.setProperty("--my", `${py * 100}%`);
      proj.classList.add("tilt");
      proj.style.transform = `translateY(-16px) perspective(900px) rotateX(${(0.5 - py) * 14}deg) rotateY(${(px - 0.5) * 14}deg)`;
    }
    const btn = e.target.closest(".cine-btn:not(.cine-btn--ghost)");
    if (btn && !btn.disabled) {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px, ${(e.clientY - r.top - r.height / 2) * 0.28 - 3}px)`;
    }
  }, { passive: true });

  document.addEventListener("pointerout", (e) => {
    const proj = e.target.closest(".proj__a");
    if (proj && !proj.contains(e.relatedTarget)) {
      proj.classList.remove("tilt");
      proj.style.transform = "";
    }
    const btn = e.target.closest(".cine-btn");
    if (btn && !btn.contains(e.relatedTarget)) btn.style.transform = "";
  }, { passive: true });
}

/* ═══════════════════ טופס ═══════════════════ */
function bindForm() {
  const form = $("#contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const err = {};
    if ((d.name || "").trim().length < 2) err.name = "איך קוראים לכם?";
    if (!/^[0-9+\-\s()]{9,15}$/.test((d.phone || "").trim())) err.phone = "מספר טלפון לא תקין";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((d.email || "").trim())) err.email = "כתובת אימייל לא תקינה";
    if (!d.type) err.type = "בחרו סוג פרויקט";

    $$(".f__err", form).forEach((n) => { n.hidden = true; n.textContent = ""; });
    $$(".f__in", form).forEach((n) => n.classList.remove("bad"));
    Object.entries(err).forEach(([k, v]) => {
      const box = $(`[data-err="${k}"]`, form);
      if (box) { box.textContent = v; box.hidden = false; }
      const input = form.elements[k];
      if (input) input.classList.add("bad");
    });
    if (Object.keys(err).length) {
      form.elements[Object.keys(err)[0]]?.focus();
      return;
    }

    const body = `שם: ${d.name}\nטלפון: ${d.phone}\nאימייל: ${d.email}\nסוג פרויקט: ${d.type}\nתקציב: ${d.budget || "לא צוין"}\n\n${d.message || ""}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("פנייה חדשה מהאתר · " + d.name)}&body=${encodeURIComponent(body)}`;
    $("#thanksName").textContent = (d.name || "").trim().split(" ")[0] || "שלכם";
    $("#formCard").classList.add("gone");
    $("#thanks").hidden = false;
  });
}

/* ═══════════════════ אתחול ═══════════════════ */
function init() {
  renderAll();
  renderAct();
  setPage(1);
  setPhase("acts");
  bindPointerFx();
  bindForm();
  revealObserver.reconnect();

  el.actCta.addEventListener("click", advance);
  el.gateCta.addEventListener("click", leaveGate);
  el.skip.addEventListener("click", () => jumpTo(4));
  el.restart.addEventListener("click", () => jumpTo(1));
  $("#footRestart").addEventListener("click", () => jumpTo(1));
  $("#btnLogo").addEventListener("click", () => jumpTo(1));
  el.menuBtn.addEventListener("click", () => (state.menuOpen ? closeMenu() : openMenu()));
  el.cue.addEventListener("click", () =>
    window.scrollTo({ top: window.scrollY + window.innerHeight * 0.9, behavior: "smooth" })
  );
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto]");
    if (b) jumpTo(+b.dataset.goto);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.menuOpen) closeMenu();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* טעינה מוקדמת של הקטע הראשון בזמן שהמשתמש קורא את מסך הפתיחה */
  VideoStage.preload("s2");

  /* העדפת תנועה מופחתת — דילוג ישיר לאתר */
  if (calm()) {
    setPhase("open");
    setPage(4);
    setDim(0.58);
    VideoStage.play("s6", { still: true });
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
