import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ACCESSIBILITY_WIDGET } from "@/config/site";
import { ConsentProvider } from "@/lib/consent/ConsentProvider";
import { ConsentBridge } from "@/components/consent/ConsentBridge";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { PreferencesModal } from "@/components/consent/PreferencesModal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "סטודיו אבי · אתרי תדמית קולנועיים בתלת מימד" },
      {
        name: "description",
        content:
          "סטודיו אבי — אתרי תדמית קולנועיים עם עולמות תלת מימד ואנימציה בהתאמה אישית.",
      },
      { name: "author", content: "סטודיו אבי" },
      { property: "og:title", content: "סטודיו אבי · אתרי תדמית קולנועיים בתלת מימד" },
      {
        property: "og:description",
        content:
          "סטודיו אבי — אתרי תדמית קולנועיים עם עולמות תלת מימד ואנימציה בהתאמה אישית.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
    /* וידג'ט הנגישות מסווג necessary ולכן נטען ללא תנאי: הוא מממש חובה
       שבדין ואינו כלי מדידה או פרסום. כל שאר סקריפטי צד ג' נטענים אך ורק
       דרך src/lib/tracking.ts, אחרי הסכמה. */
    scripts: ACCESSIBILITY_WIDGET.enabled
      ? [{ src: ACCESSIBILITY_WIDGET.src, defer: true }]
      : [],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* ראשון ב-DOM, מוסתר עד שהוא מקבל פוקוס */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[300] focus:rounded-full focus:border focus:border-gold focus:bg-stage focus:px-5 focus:py-3 focus:text-[14px] focus:font-bold focus:text-gold"
        >
          דילוג לתוכן הראשי
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ConsentProvider>
        <ConsentBridge />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CookieBanner />
        <CookieSettingsButton />
        <PreferencesModal />
      </ConsentProvider>
    </QueryClientProvider>
  );
}
