/* קישורי המעטפת המשפטית. טקסט מפורש בכל קישור — לא "כאן" ולא "מידע נוסף". */

import { Link } from "@tanstack/react-router";

import { useConsent } from "@/lib/consent/ConsentProvider";

const linkCls = "transition-colors hover:text-gold";

export function LegalNav({ className }: { className?: string }) {
  const { reopen } = useConsent();

  return (
    <nav aria-label="מידע משפטי" className={className}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <li>
          <Link to="/terms" className={linkCls}>
            תנאי שימוש
          </Link>
        </li>
        <li>
          <Link to="/privacy" className={linkCls}>
            מדיניות פרטיות
          </Link>
        </li>
        <li>
          <Link to="/accessibility" className={linkCls}>
            הצהרת נגישות
          </Link>
        </li>
        <li>
          <Link to="/cookies" className={linkCls}>
            מדיניות Cookie
          </Link>
        </li>
        <li>
          <Link to="/data-request" className={linkCls}>
            פניות בנושא מידע אישי
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={reopen}
            className="transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            הגדרות Cookie
          </button>
        </li>
      </ul>
    </nav>
  );
}
