"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { fetchPreset } from "@/lib/api";

function readTokenFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return new URLSearchParams(window.location.search).get("token")?.trim() ?? null;
}

function AuthCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;

    const token = readTokenFromUrl();
    if (!token) {
      setError("Missing sign-in token. Please try again.");
      return;
    }

    localStorage.setItem("jobradar_token", token);
    window.history.replaceState({}, "", "/auth/callback");

    let cancelled = false;
    fetchPreset()
      .then((preset) => {
        if (cancelled) return;
        router.replace(preset ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        if (cancelled) return;
        router.replace("/onboarding");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <div className="card p-6">
          <p className="text-sm text-red-300">{error}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-cyan-300 underline"
          >
            Back to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="card p-6 text-sm text-slate-300">Signing you in…</div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
          <div className="card p-6 text-sm text-slate-300">Loading…</div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
