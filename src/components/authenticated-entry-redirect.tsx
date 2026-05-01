"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPreset } from "@/lib/api";

/**
 * For public-only routes (e.g. `/`, `/login`). If a session token exists, sends the
 * user to onboarding or dashboard — same rules as after login.
 */
export function AuthenticatedEntryRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showPublic, setShowPublic] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jobradar_token");
    if (!token) {
      setShowPublic(true);
      return;
    }

    let cancelled = false;
    fetchPreset()
      .then((preset) => {
        if (cancelled) return;
        router.replace(preset ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem("jobradar_token");
        localStorage.removeItem("jobradar_email");
        setShowPublic(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!showPublic) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-slate-400">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
