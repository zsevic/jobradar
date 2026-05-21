"use client";

import { useMemo, useState } from "react";
import {
  type CountryOption,
  countryMatchesSearchQuery,
  formatCountryOptionLabel,
  getAllCountryOptions,
  sortCountriesSelectedFirst,
} from "@/lib/countries";
import {
  countryLocationCount,
  isFullyRemoteOnly,
} from "@/lib/location-preset";
import {
  type LocationOption,
  FULLY_REMOTE_LOCATION,
  REMOTE_LOCATION,
} from "@/lib/types";

function labelForLocation(value: LocationOption, countryOptions: CountryOption[]): string {
  if (value === REMOTE_LOCATION) {
    return "Remote";
  }
  if (value === FULLY_REMOTE_LOCATION) {
    return "Fully remote";
  }
  const country = countryOptions.find((c) => c.name === value);
  return country ? formatCountryOptionLabel(country) : value;
}

export interface LocationSelectorProps {
  locations: LocationOption[];
  onToggle: (value: LocationOption) => void;
}

export function LocationSelector({ locations, onToggle }: LocationSelectorProps) {
  const [countryQuery, setCountryQuery] = useState("");
  const countryOptions = useMemo(() => getAllCountryOptions(), []);

  const fullyRemoteOn = isFullyRemoteOnly(locations);
  const remoteOn = locations.includes(REMOTE_LOCATION);
  const countryCount = countryLocationCount(locations);

  const filteredCountryOptions = useMemo(() => {
    const filtered = countryOptions.filter((country) =>
      countryMatchesSearchQuery(country, countryQuery),
    );
    return sortCountriesSelectedFirst(filtered, locations);
  }, [countryOptions, countryQuery, locations]);

  const displayLocations = fullyRemoteOn
    ? locations.filter((loc) => loc === FULLY_REMOTE_LOCATION)
    : locations;

  return (
    <fieldset className="space-y-4">
      <legend className="float-none text-sm font-medium text-slate-200">
        <span className="block">Locations</span>
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {fullyRemoteOn
            ? "Only worldwide fully remote roles — no country or hybrid filters."
            : "Pick regions you’re open to. Remote is optional alongside countries."}
        </span>
      </legend>

      {displayLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayLocations.map((loc) => (
            <span
              key={loc}
              className="group inline-flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-gradient-to-r from-cyan-500/15 to-teal-500/10 px-3 py-1 text-sm text-cyan-100 shadow-sm shadow-cyan-950/40"
            >
              <span>{labelForLocation(loc, countryOptions)}</span>
              <button
                type="button"
                aria-label={`Remove ${labelForLocation(loc, countryOptions)}`}
                className="-mr-0.5 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                onClick={() => onToggle(loc)}
              >
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={fullyRemoteOn}
        onClick={() => onToggle(FULLY_REMOTE_LOCATION)}
        className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          fullyRemoteOn
            ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-400/30"
            : "border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/50"
        }`}
      >
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
            fullyRemoteOn ? "bg-cyan-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              fullyRemoteOn ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-slate-100">Fully remote only</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Worldwide roles with no fixed country — not hybrid or remote tied to a region.
          </span>
        </span>
      </button>

      {!fullyRemoteOn && (
        <>
          <button
            type="button"
            role="switch"
            aria-checked={remoteOn}
            onClick={() => onToggle(REMOTE_LOCATION)}
            className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              remoteOn
                ? "border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-400/30"
                : "border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/50"
            }`}
          >
            <span
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
                remoteOn ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  remoteOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-slate-100">Include remote jobs</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Adds listings marked remote, in addition to your countries below.
              </span>
            </span>
          </button>

          <div className="overflow-hidden rounded-xl border border-slate-800/90 bg-slate-950/60 shadow-inner shadow-black/20">
            <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
              <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Countries
              </span>
              {countryCount > 0 && (
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-400 tabular-nums">
                  {countryCount} selected
                </span>
              )}
            </div>

            <div className="relative border-b border-slate-800/80 px-3 py-2">
              <svg
                className="pointer-events-none absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
                placeholder="Search by country names"
                autoComplete="off"
                className="w-full rounded-lg border border-transparent bg-slate-900/80 py-2.5 pr-3 pl-10 text-sm text-slate-100 placeholder:text-slate-600 outline-none ring-cyan-400/40 transition focus:border-cyan-500/40 focus:ring-2"
              />
            </div>

            <div className="max-h-[min(280px,45vh)] overflow-y-auto overscroll-contain p-1.5">
              {filteredCountryOptions.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  {countryQuery.trim()
                    ? `No countries match “${countryQuery.trim()}”.`
                    : "No countries available."}
                </p>
              ) : (
                filteredCountryOptions.map((country) => {
                  const checked = locations.includes(country.name);
                  return (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => onToggle(country.name)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        checked
                          ? "bg-cyan-500/10 text-cyan-50"
                          : "text-slate-300 hover:bg-slate-800/70"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                          checked
                            ? "border-cyan-400 bg-cyan-400 text-slate-950"
                            : "border-slate-600 bg-transparent"
                        }`}
                        aria-hidden
                      >
                        {checked && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="truncate font-medium">
                        {formatCountryOptionLabel(country)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </fieldset>
  );
}
