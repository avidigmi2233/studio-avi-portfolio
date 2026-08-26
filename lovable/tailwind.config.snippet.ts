/* ==========================================================================
   סטודיו אבי — תוספות ל-tailwind.config.ts של Lovable
   למזג לתוך theme.extend הקיים; לא להחליף את הקובץ.
   ========================================================================== */

export const studioAviThemeExtend = {
  colors: {
    // ערכי המותג — נצרכים כ-text-gold / bg-dim / border-gold וכו'
    stage: "hsl(var(--stage))",
    "ink-2": "hsl(var(--ink-2))",
    "ink-3": "hsl(var(--ink-3))",
    "muted-ink": "hsl(var(--muted-ink))",
    "ink-inverse": "hsl(var(--ink-inverse))",
    gold: {
      DEFAULT: "hsl(var(--gold))",
      hi: "hsl(var(--gold-hi))",
      dp: "hsl(var(--gold-dp))",
    },
    dim: {
      DEFAULT: "hsl(var(--dim))",
      hi: "hsl(var(--dim-hi))",
      dp: "hsl(var(--dim-dp))",
    },
  },
  fontFamily: {
    display: ['"Polin"', '"Arial Hebrew"', "system-ui", "sans-serif"],
    sans: ['"Polin"', '"Arial Hebrew"', "system-ui", "sans-serif"],
  },
  transitionTimingFunction: {
    cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  keyframes: {
    float: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-18px)" },
    },
    grain: {
      "0%": { transform: "translate(0, 0)" },
      "33%": { transform: "translate(-3%, 2%)" },
      "66%": { transform: "translate(2%, -3%)" },
      "100%": { transform: "translate(0, 0)" },
    },
    pulseDot: {
      "0%, 100%": { opacity: "0.45", transform: "scale(0.72)" },
      "50%": { opacity: "1", transform: "scale(1.08)" },
    },
    riseIn: {
      from: { opacity: "0", transform: "translateY(28px)" },
      to: { opacity: "1", transform: "none" },
    },
    cueFloat: {
      "0%, 100%": { transform: "translate(-50%, 0)" },
      "50%": { transform: "translate(-50%, 7px)" },
    },
  },
  animation: {
    float: "float 8s ease-in-out infinite",
    grain: "grain 1.1s steps(3) infinite",
    "pulse-dot": "pulseDot 3.4s ease-in-out infinite",
    "rise-in": "riseIn 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
    "cue-float": "cueFloat 2.6s ease-in-out 1s infinite",
  },
};
