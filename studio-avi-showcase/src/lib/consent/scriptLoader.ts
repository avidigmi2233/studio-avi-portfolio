/** טוען סקריפט חיצוני פעם אחת בלבד. בטוח לקריאה חוזרת. */
export function loadScriptOnce(
  id: string,
  src: string,
  attrs: Record<string, string> = {},
): HTMLScriptElement | null {
  if (typeof document === "undefined") return null;
  const existing = document.getElementById(id);
  if (existing) return existing as HTMLScriptElement;

  const el = document.createElement("script");
  el.id = id;
  el.src = src;
  el.async = true;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.head.appendChild(el);
  return el;
}
