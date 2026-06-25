import { normalizePreset } from "@/components/filter-editor";
import type { FilterPreset } from "@/lib/types";

const BROWSE_FILTERS_KEY = "jobradar_browse_filters";

function isFilterPreset(value: unknown): value is FilterPreset {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as FilterPreset;
  return (
    typeof candidate.role === "string" &&
    Array.isArray(candidate.stack) &&
    typeof candidate.seniority === "string" &&
    Array.isArray(candidate.locations)
  );
}

export function readBrowseFilters(): FilterPreset | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(BROWSE_FILTERS_KEY);
  if (!raw && typeof window !== "undefined") {
    const legacy = sessionStorage.getItem(BROWSE_FILTERS_KEY);
    if (legacy) {
      localStorage.setItem(BROWSE_FILTERS_KEY, legacy);
      sessionStorage.removeItem(BROWSE_FILTERS_KEY);
      return readBrowseFilters();
    }
  }
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isFilterPreset(parsed)) {
      return null;
    }
    return normalizePreset(parsed);
  } catch {
    return null;
  }
}

export function writeBrowseFilters(preset: FilterPreset): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(
    BROWSE_FILTERS_KEY,
    JSON.stringify(normalizePreset(preset)),
  );
}

export function clearBrowseFilters(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(BROWSE_FILTERS_KEY);
}

export function hasBrowseFiltersSet(): boolean {
  return readBrowseFilters() !== null;
}

/** Removes login-era keys left in localStorage after auth was removed from the app. */
export function discardLegacyAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("jobradar_token");
  localStorage.removeItem("jobradar_email");
}
