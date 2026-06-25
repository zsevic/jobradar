"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  discardLegacyAuthStorage,
  hasBrowseFiltersSet,
} from "@/lib/browse-filters-storage";

/** Home page: skip landing when the user already has saved browse filters. */
export function HomeBrowseRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showHome, setShowHome] = useState(false);

  useEffect(() => {
    discardLegacyAuthStorage();
    if (hasBrowseFiltersSet()) {
      router.replace("/dashboard");
      return;
    }
    setShowHome(true);
  }, [router]);

  if (!showHome) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-slate-400">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
