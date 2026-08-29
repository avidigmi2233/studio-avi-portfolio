/* מחבר את מערכת ההסכמה לשכבת המעקב ולוכד את מקור התנועה.
   רץ פעם אחת בשורש. אין לו פלט ויזואלי. */

import { useEffect } from "react";

import { attachTrackingToConsent, captureAttribution } from "@/lib/tracking";

export function ConsentBridge() {
  useEffect(() => {
    captureAttribution();
    return attachTrackingToConsent();
  }, []);
  return null;
}
