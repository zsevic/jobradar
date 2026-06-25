import type { FilterPreset } from "@/lib/types";
import { REMOTE_LOCATION } from "@/lib/types";

/** Default filters for anonymous job browsing. */
export const defaultBrowsePreset: FilterPreset = {
  role: "backend",
  stack: ["node.js"],
  seniority: "senior",
  locations: [REMOTE_LOCATION],
};
