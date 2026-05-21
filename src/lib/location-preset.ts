import {
  FULLY_REMOTE_LOCATION,
  REMOTE_LOCATION,
  type LocationOption,
} from "@/lib/types";

export function isFullyRemoteOnly(locations: readonly LocationOption[]): boolean {
  return locations.includes(FULLY_REMOTE_LOCATION);
}

/** Collapse legacy presets that mixed fully-remote with countries or broad remote. */
export function normalizeLocationPreset(
  locations: LocationOption[],
): LocationOption[] {
  if (isFullyRemoteOnly(locations)) {
    return [FULLY_REMOTE_LOCATION];
  }
  return locations;
}

/**
 * Toggles a location preset entry. Enabling fully-remote clears countries and broad remote.
 */
export function applyLocationToggle(
  locations: LocationOption[],
  loc: LocationOption,
): LocationOption[] {
  if (loc === FULLY_REMOTE_LOCATION) {
    if (locations.includes(FULLY_REMOTE_LOCATION)) {
      return locations.filter((entry) => entry !== FULLY_REMOTE_LOCATION);
    }
    return [FULLY_REMOTE_LOCATION];
  }

  const withoutFullyRemote = locations.filter(
    (entry) => entry !== FULLY_REMOTE_LOCATION,
  );

  if (locations.includes(loc)) {
    return withoutFullyRemote.filter((entry) => entry !== loc);
  }

  return [...withoutFullyRemote, loc];
}

export function countryLocationCount(locations: readonly LocationOption[]): number {
  return locations.filter(
    (entry) => entry !== REMOTE_LOCATION && entry !== FULLY_REMOTE_LOCATION,
  ).length;
}
