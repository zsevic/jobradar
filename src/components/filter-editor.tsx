"use client";

import { LocationSelector } from "@/components/location-selector";
import {
  managementDefaultSeniority,
  noStackRoles,
  roleLabels,
  roleOptions,
  rolesWithoutSeniorityFilter,
  seniorityOptions,
  stackByRole,
} from "@/lib/onboarding-options";
import type {
  FilterPreset,
  LocationOption,
  Seniority,
  StackOption,
  UserRole,
} from "@/lib/types";

export function normalizePreset(preset: FilterPreset): FilterPreset {
  const withStack = noStackRoles.includes(preset.role)
    ? { ...preset, stack: [] as StackOption[] }
    : (() => {
        const allowedStack = stackByRole[preset.role];
        const filteredStack = preset.stack.filter((entry) =>
          allowedStack.includes(entry),
        );
        return {
          ...preset,
          stack:
            filteredStack.length > 0 ? filteredStack : [allowedStack[0]],
        };
      })();

  if (rolesWithoutSeniorityFilter.includes(withStack.role)) {
    return { ...withStack, seniority: managementDefaultSeniority };
  }
  return withStack;
}

export function presetsEqual(
  a: FilterPreset | null,
  b: FilterPreset | null,
): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const sort = (xs: string[]) => [...xs].sort();
  return (
    a.role === b.role &&
    a.seniority === b.seniority &&
    a.alertsEnabled === b.alertsEnabled &&
    JSON.stringify(sort(a.stack)) === JSON.stringify(sort(b.stack)) &&
    JSON.stringify(sort(a.locations)) === JSON.stringify(sort(b.locations))
  );
}

export interface FilterEditorProps {
  value: FilterPreset;
  onChange: (next: FilterPreset) => void;
}

export function FilterEditor({ value, onChange }: FilterEditorProps) {
  const role = value.role;
  const stack = value.stack;
  const seniority = value.seniority;
  const locations = value.locations;
  const isSeniorityConfigurable = !rolesWithoutSeniorityFilter.includes(role);
  const isStackRequired = !noStackRoles.includes(role);
  const availableStackOptions = stackByRole[role];

  function toggleStack(option: StackOption) {
    const nextStack = stack.includes(option)
      ? stack.filter((entry) => entry !== option)
      : [...stack, option];
    onChange({ ...value, stack: nextStack });
  }

  function toggleLocation(loc: LocationOption) {
    const nextLocations = locations.includes(loc)
      ? locations.filter((entry) => entry !== loc)
      : [...locations, loc];
    onChange({ ...value, locations: nextLocations });
  }

  function onRoleChange(nextRole: UserRole) {
    const nextOptions = stackByRole[nextRole];
    if (noStackRoles.includes(nextRole)) {
      if (rolesWithoutSeniorityFilter.includes(nextRole)) {
        onChange({
          ...value,
          role: nextRole,
          stack: [],
          seniority: managementDefaultSeniority,
        });
        return;
      }
      onChange({ ...value, role: nextRole, stack: [] });
      return;
    }
    const filtered = stack.filter((entry) => nextOptions.includes(entry));
    onChange({
      ...value,
      role: nextRole,
      stack:
        filtered.length > 0
          ? filtered
          : nextOptions.length > 0
            ? [nextOptions[0]]
            : [],
    });
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">Role</span>
        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value as UserRole)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
        >
          {roleOptions.map((option) => (
            <option key={option} value={option}>
              {roleLabels[option]}
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

      {isSeniorityConfigurable && (
        <label className="block">
          <span className="mb-1 block text-sm text-slate-300">Seniority</span>
          <select
            value={seniority}
            onChange={(event) =>
              onChange({
                ...value,
                seniority: event.target.value as Seniority,
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
      )}

      <LocationSelector locations={locations} onToggle={toggleLocation} />
    </div>
  );
}
