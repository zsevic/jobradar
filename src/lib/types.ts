export type UserRole =
  | "backend"
  | "frontend"
  | "fullstack"
  | "engineer"
  | "mobile"
  | "devops"
  | "qa"
  | "management"
  | "ai"
  | "data"
  | "solutions"
  | "recruiter"
  | "designer"
  | "security";

export type StackOption =
  | "node.js"
  | "python"
  | "golang"
  | "rust"
  | "java"
  | ".net"
  | "php"
  | "react"
  | "angular"
  | "vue"
  | "next.js"
  | "nuxt"
  | "svelte"
  | "typescript"
  | "javascript"
  | "react native"
  | "swift"
  | "kotlin"
  | "flutter"
  | "dart";

export type Seniority = "intern" | "junior" | "mid" | "senior" | "staff";

export type LocationOption = string;
export const REMOTE_LOCATION = "remote";
export const FULLY_REMOTE_LOCATION = "fully-remote";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  postedAt: string;
  isNew: boolean;
  url?: string;
  stack?: string[];
  /** Ingested title band(s); user preset still uses a single `seniority` on {@link FilterPreset}. */
  seniorities?: Seniority[];
}

/** Full job row returned by `GET /api/jobs` (dashboard). */
export interface DashboardJob extends Omit<Job, "stack" | "seniorities" | "url"> {
  url: string;
  stack: string[];
  seniorities: Seniority[];
}

export interface DashboardJobsPage {
  items: DashboardJob[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * User job-matching preferences. The user picks exactly one `seniority` string;
 * ingested jobs may list a `seniorities` band (array) on each row.
 */
export interface FilterPreset {
  role: UserRole;
  stack: StackOption[];
  seniority: Seniority;
  locations: LocationOption[];
  alertsEnabled: boolean;
}

export interface LoginPayload {
  email: string;
  licenseKey: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface LatestJobsPreviewResponse {
  items: Job[];
  total: number;
  /** Normalized country token used for filtering, or null when not filtered. */
  country: string | null;
}
