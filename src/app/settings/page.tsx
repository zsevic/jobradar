"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { normalizePreset } from "@/components/filter-editor";
import { LogoutButton } from "@/components/logout-button";
import { fetchPreset, updateAlertsEnabled } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const presetQuery = useQuery({
    queryKey: ["preset", "settings"],
    queryFn: fetchPreset,
    retry: false,
  });

  useEffect(() => {
    if (!presetQuery.isSuccess || presetQuery.data !== null) {
      return;
    }
    router.replace("/onboarding");
  }, [presetQuery.isSuccess, presetQuery.data, router]);

  const presetSyncKey = presetQuery.data ? JSON.stringify(presetQuery.data) : "";

  const [draftAlerts, setDraftAlerts] = useState<boolean | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraftAlerts(null);
  }, [presetSyncKey]);

  const normalizedPreset = presetQuery.data ? normalizePreset(presetQuery.data) : null;
  const savedAlerts = normalizedPreset?.alertsEnabled ?? true;
  const alertsEnabled = draftAlerts ?? savedAlerts;

  const saveMutation = useMutation({
    mutationFn: updateAlertsEnabled,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["preset"] });
      setSaveNotice(
        alertsEnabled
          ? "Email alerts are now activated."
          : "Email alerts are now deactivated.",
      );
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalizedPreset == null) {
      return;
    }
    setSaveNotice(null);
    saveMutation.mutate(alertsEnabled);
  }

  const saveDisabled =
    normalizedPreset == null || alertsEnabled === normalizedPreset.alertsEnabled;

  if (presetQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6 text-sm text-slate-300">Loading...</div>
      </main>
    );
  }

  if (presetQuery.isError) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6">
          <h1 className="text-xl font-semibold">Could not load settings</h1>
          <p className="mt-2 text-sm text-slate-400">
            {(presetQuery.error as Error).message}
          </p>
        </div>
      </main>
    );
  }

  if (presetQuery.isSuccess && presetQuery.data === null) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6 text-sm text-slate-300">
          Redirecting to onboarding…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your email notifications and GitHub Sponsors subscription.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Job filters can be edited from your{" "}
              <Link href="/dashboard" className="text-cyan-300 underline">
                dashboard
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
            >
              Back to dashboard
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="text-base font-semibold text-slate-100">Email notifications</h2>
            <p className="mt-1 text-sm text-slate-400">
              Control whether JobRadar sends you new job digest emails.
            </p>

            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3">
                <span className="text-sm text-slate-200">Email alerts for new jobs</span>
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(event) => {
                    setDraftAlerts(event.target.checked);
                    setSaveNotice(null);
                  }}
                  className="h-4 w-4 accent-cyan-400"
                />
              </label>

              {saveMutation.error && (
                <p className="text-sm text-red-300">{(saveMutation.error as Error).message}</p>
              )}

              {saveNotice && (
                <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {saveNotice}
                </p>
              )}

              <button
                type="submit"
                disabled={saveDisabled || saveMutation.isPending}
                className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
              >
                {saveMutation.isPending ? "Saving..." : "Save email settings"}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="text-base font-semibold text-slate-100">GitHub Sponsors</h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage or renew your sponsorship on GitHub. If your sponsorship
              expires, app access and email digests stop until you sponsor again.
            </p>
            <a
              href="https://github.com/sponsors/zsevic"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Manage sponsorship on GitHub
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
