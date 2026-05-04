export type UserRole =
  | "backend"
  | "frontend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "qa"
  | "management"
  | "engineer"
  | "ai"
  | "solutions"
  | "recruiter";

export type StackOption =
  | "node.js"
  | "python"
  | "golang"
  | "java"
  | ".net"
  | "php"
  | "react"
  | "angular"
  | "vue"
  | "next.js"
  | "nuxt"
  | "svelte"
  | "react native"
  | "swift"
  | "kotlin"
  | "flutter"
  | "dart";

export type Seniority = "intern" | "junior" | "mid" | "senior" | "staff";

export type LocationOption = string;
export const REMOTE_LOCATION = "remote";

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
  seniority?: Seniority;
}

/** Full job row returned by `GET /api/jobs` (dashboard). */
export interface DashboardJob extends Omit<Job, "stack" | "seniority" | "url"> {
  url: string;
  stack: string[];
  seniority: Seniority | null;
}

export interface DashboardJobsPage {
  items: DashboardJob[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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
