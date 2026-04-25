export type UserRole = "backend" | "frontend" | "devops" | "qa";

export type StackOption = "node.js" | "python" | "golang";

export type Seniority = "junior" | "mid" | "senior" | "staff";

export type LocationOption = "remote" | "EU" | "US";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  postedAt: string;
  isNew: boolean;
  url: string;
  stack: string[];
  seniority: Seniority;
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
  token: string;
  user: {
    id: string;
    email: string;
  };
}
