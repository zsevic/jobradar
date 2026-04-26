"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { fetchPreset, savePreset } from "@/lib/api";
import {
  locationOptions,
  noStackRoles,
  roleOptions,
  seniorityOptions,
  stackByRole,
} from "@/lib/onboarding-options";
import { FilterPreset, LocationOption, Seniority, StackOption, UserRole } from "@/lib/types";

function normalizePreset(preset: FilterPreset): FilterPreset {
  if (noStackRoles.includes(preset.role)) {
    return { ...preset, stack: [] };
  }
  const allowedStack = stackByRole[preset.role];
  const filteredStack = preset.stack.filter((entry) => allowedStack.includes(entry));
  return {
    ...preset,
    stack: filteredStack.length > 0 ? filteredStack : [allowedStack[0]],
  };
}

export default function SettingsPage() {
  const presetQuery = useQuery({
    queryKey: ["preset", "settings"],
    queryFn: fetchPreset,
    retry: false,
  });

  const [draftPreset, setDraftPreset] = useState<FilterPreset | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const normalizedPreset = presetQuery.data ? normalizePreset(presetQuery.data) : null;
  const preset = draftPreset ?? normalizedPreset;
  const role = preset?.role ?? "backend";
  const stack = preset?.stack ?? ["node.js"];
  const seniority = preset?.seniority ?? "mid";
  const locations = preset?.locations ?? ["remote"];
  const alertsEnabled = preset?.alertsEnabled ?? true;
  const isStackRequired = !noStackRoles.includes(role);
  const availableStackOptions = stackByRole[role];

  const saveMutation = useMutation({
    mutationFn: savePreset,
    onSuccess: () => {
      window.alert("Settings updated successfully.");
    },
  });

  function toggleStack(value: StackOption) {
    setDraftPreset((current) => {
      const base = current ?? normalizedPreset;
      if (!base) {
        return current;
      }
      const nextStack = base.stack.includes(value)
        ? base.stack.filter((entry) => entry !== value)
        : [...base.stack, value];
      return { ...base, stack: nextStack };
    });
  }

  function toggleLocation(value: LocationOption) {
    setDraftPreset((current) => {
      const base = current ?? normalizedPreset;
      if (!base) {
        return current;
      }
      const nextLocations = base.locations.includes(value)
        ? base.locations.filter((entry) => entry !== value)
        : [...base.locations, value];
      return { ...base, locations: nextLocations };
    });
  }

  function onRoleChange(nextRole: UserRole) {
    setDraftPreset((current) => {
      const base = current ?? normalizedPreset;
      if (!base) {
        return current;
      }
      const nextOptions = stackByRole[nextRole];
      if (noStackRoles.includes(nextRole)) {
        return { ...base, role: nextRole, stack: [] };
      }
      const filtered = base.stack.filter((entry) => nextOptions.includes(entry));
      return {
        ...base,
        role: nextRole,
        stack: filtered.length > 0 ? filtered : nextOptions.length > 0 ? [nextOptions[0]] : [],
      };
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (isStackRequired && stack.length === 0) {
      setFormError("Please select at least one stack option.");
      return;
    }
    if (locations.length === 0) {
      setFormError("Please select at least one location.");
      return;
    }
    if (!preset) {
      setFormError("Unable to save settings. Please reload the page.");
      return;
    }
    saveMutation.mutate(preset);
  }

  if (presetQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6 text-sm text-slate-300">Loading...</div>
      </main>
    );
  }

  if (!presetQuery.data) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6">
          <h1 className="text-xl font-semibold">Settings unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">
            Complete onboarding first to create your filter preset.
          </p>
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
              Update your job filters and notification preferences.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
          >
            Back to dashboard
          </Link>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Role</span>
            <select
              value={role}
              onChange={(event) => onRoleChange(event.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {isStackRequired && (
            <fieldset>
              <legend className="mb-1 text-sm text-slate-300">Stack</legend>
              <div className="flex flex-wrap gap-2">
                {availableStackOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleStack(option)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      stack.includes(option)
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                        : "border-slate-700 text-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Seniority</span>
            <select
              value={seniority}
              onChange={(event) =>
                setDraftPreset((current) => {
                  const base = current ?? normalizedPreset;
                  if (!base) {
                    return current;
                  }
                  return { ...base, seniority: event.target.value as Seniority };
                })
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {seniorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="mb-1 text-sm text-slate-300">Locations</legend>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleLocation(option)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    locations.includes(option)
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                      : "border-slate-700 text-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/70 px-4 py-3">
            <span className="text-sm text-slate-200">Email alerts enabled</span>
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(event) =>
                setDraftPreset((current) => {
                  const base = current ?? normalizedPreset;
                  if (!base) {
                    return current;
                  }
                  return { ...base, alertsEnabled: event.target.checked };
                })
              }
              className="h-4 w-4 accent-cyan-400"
            />
          </label>

          {saveMutation.error && (
            <p className="text-sm text-red-300">{(saveMutation.error as Error).message}</p>
          )}
          {formError && <p className="text-sm text-red-300">{formError}</p>}
          {saveMutation.isSuccess && (
            <p className="text-sm text-emerald-300">Settings saved.</p>
          )}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>
    </main>
  );
}
