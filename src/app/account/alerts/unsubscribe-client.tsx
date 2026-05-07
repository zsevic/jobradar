"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { unsubscribeFromEmailToken } from "@/lib/api";

type Status = "loading" | "success" | "error";

export function AlertsUnsubscribeClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Working on your unsubscribe request...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Missing unsubscribe token.");
        }
        return;
      }

      try {
        await unsubscribeFromEmailToken(token);
        if (!cancelled) {
          setStatus("success");
          setMessage("You have been unsubscribed from email alerts.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not process unsubscribe request.",
          );
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Email alerts</h1>
        <p className="mt-3 text-sm text-slate-300">{message}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/settings"
            className="rounded-lg border border-cyan-500/60 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/10"
          >
            Open settings
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Go to login
          </Link>
        </div>

        {status === "loading" && (
          <p className="mt-4 text-xs text-slate-500">Please wait...</p>
        )}
      </div>
    </main>
  );
}
