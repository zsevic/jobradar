"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function buildPagePath(pathname: string, searchParams: URLSearchParams): string {
  const q = searchParams.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/**
 * Sends SPA navigations to GA4. Initial page_view comes from the inline gtag("config") in the Script block.
 */
function GoogleAnalyticsRouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") {
      return;
    }
    const path = buildPagePath(pathname, searchParams);
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

function GoogleAnalyticsScripts() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <GoogleAnalyticsScripts />
      <Suspense fallback={null}>
        <GoogleAnalyticsRouteReporter />
      </Suspense>
    </>
  );
}
