"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { savePreset } from "@/lib/api";
import { LocationOption, Seniority, StackOption, UserRole } from "@/lib/types";

const roleOptions: UserRole[] = ["backend", "frontend", "devops", "qa"];
const stackOptions: StackOption[] = ["node.js", "python", "golang"];
const seniorityOptions: Seniority[] = ["junior", "mid", "senior", "staff"];
const locationOptions: LocationOption[] = ["remote", "EU", "US"];

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("backend");
  const [stack, setStack] = useState<StackOption[]>(["node.js"]);
  const [seniority, setSeniority] = useState<Seniority>("mid");
  const [locations, setLocations] = useState<LocationOption[]>(["remote"]);

  const saveMutation = useMutation({
    mutationFn: savePreset,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  function toggleStack(value: StackOption) {
    setStack((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  }

  function toggleLocation(value: LocationOption) {
    setLocations((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stack.length === 0 || locations.length === 0) {
      return;
    }
    saveMutation.mutate({
      role,
      stack,
      seniority,
      locations,
      alertsEnabled: true,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Set your job filters</h1>
        <p className="mt-2 text-sm text-slate-400">
          JobRadar will notify only for high-match jobs.
        </p>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="mb-1 text-sm text-slate-300">Stack</legend>
            <div className="flex flex-wrap gap-2">
              {stackOptions.map((option) => (
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

          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Seniority</span>
            <select
              value={seniority}
              onChange={(event) =>
                setSeniority(event.target.value as Seniority)
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

          {saveMutation.error && (
            <p className="text-sm text-red-300">
              {(saveMutation.error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={saveMutation.isPending || stack.length === 0}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
