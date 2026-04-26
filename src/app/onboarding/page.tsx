"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchPreset, savePreset } from "@/lib/api";
import { getAllCountryOptions, getCountryNameFromLocale } from "@/lib/countries";
import {
  noStackRoles,
  roleOptions,
  seniorityOptions,
  stackByRole,
} from "@/lib/onboarding-options";
import {
  LocationOption,
  REMOTE_LOCATION,
  Seniority,
  StackOption,
  UserRole,
} from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const initialDetectedCountry = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return (
      getCountryNameFromLocale(navigator.languages?.[0], getAllCountryOptions()) ??
      getCountryNameFromLocale(navigator.language, getAllCountryOptions())
    );
  }, []);
  const [role, setRole] = useState<UserRole>("backend");
  const [stack, setStack] = useState<StackOption[]>(["node.js"]);
  const [seniority, setSeniority] = useState<Seniority>("mid");
  const [locations, setLocations] = useState<LocationOption[]>(
    initialDetectedCountry
      ? [REMOTE_LOCATION, initialDetectedCountry]
      : [REMOTE_LOCATION],
  );
  const [countryQuery, setCountryQuery] = useState("");
  const isStackRequired = !noStackRoles.includes(role);
  const availableStackOptions = useMemo(() => stackByRole[role], [role]);
  const countryOptions = useMemo(() => getAllCountryOptions(), []);
  const filteredCountryOptions = useMemo(
    () =>
      countryOptions.filter((country) =>
        country.name.toLowerCase().includes(countryQuery.toLowerCase()),
      ),
    [countryOptions, countryQuery],
  );
  const presetQuery = useQuery({
    queryKey: ["preset", "onboarding"],
    queryFn: fetchPreset,
    retry: false,
  });

  useEffect(() => {
    if (presetQuery.data) {
      router.replace("/dashboard");
    }
  }, [presetQuery.data, router]);

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

  function onRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    const nextOptions = stackByRole[nextRole];
    if (noStackRoles.includes(nextRole)) {
      setStack([]);
      return;
    }

    setStack((current) => {
      const filtered = current.filter((entry) => nextOptions.includes(entry));
      if (filtered.length > 0) {
        return filtered;
      }
      return nextOptions.length > 0 ? [nextOptions[0]] : [];
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if ((isStackRequired && stack.length === 0) || locations.length === 0) {
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

  if (presetQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div className="card p-6 text-sm text-slate-300">Loading...</div>
      </main>
    );
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
            <div className="space-y-3 rounded-lg border border-slate-800 p-3">
              <button
                type="button"
                onClick={() => toggleLocation(REMOTE_LOCATION)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  locations.includes(REMOTE_LOCATION)
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                    : "border-slate-700 text-slate-300"
                }`}
              >
                Remote
              </button>
              <input
                type="text"
                value={countryQuery}
                onChange={(event) => setCountryQuery(event.target.value)}
                placeholder="Search countries..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-slate-800 p-2">
                {filteredCountryOptions.map((country) => (
                  <label
                    key={country.code}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={locations.includes(country.name)}
                      onChange={() => toggleLocation(country.name)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span>{country.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {saveMutation.error && (
            <p className="text-sm text-red-300">
              {(saveMutation.error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={saveMutation.isPending || (isStackRequired && stack.length === 0)}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
