import { Seniority, StackOption, UserRole } from "@/lib/types";

export const roleOptions: UserRole[] = [
  "backend",
  "frontend",
  "fullstack",
  "mobile",
  "devops",
  "qa",
  "management",
  "engineer",
  "ai",
  "data",
  "solutions",
  "recruiter",
  "security",
];

/** Human-readable labels for selects and dashboard. */
export const roleLabels: Record<UserRole, string> = {
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Full-stack",
  mobile: "Mobile",
  devops: "DevOps",
  qa: "QA",
  management: "Management",
  engineer: "Software Engineer / Developer",
  ai: "AI / ML",
  data: "Data / Analytics Engineering",
  solutions: "Solutions / Pre-sales",
  recruiter: "Recruiter / Talent",
  security: "Security",
};

export const seniorityOptions: Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
];

export const seniorityLabels: Record<Seniority, string> = {
  intern: "Intern",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
};

/** Display for job rows: one label, or "Min – Max" for banded titles. */
export function formatJobSeniorities(levels: Seniority[]): string {
  if (levels.length === 0) {
    return "—";
  }
  if (levels.length === 1) {
    return seniorityLabels[levels[0]];
  }
  return `${seniorityLabels[levels[0]]} – ${
    seniorityLabels[levels[levels.length - 1]]
  }`;
}

/** Roles where seniority is not user-configurable (fixed for job matching). */
export const rolesWithoutSeniorityFilter: UserRole[] = ["management"];

/** Seniority stored for management presets (backend + UI default). */
export const managementDefaultSeniority: Seniority = "staff";

export const noStackRoles: UserRole[] = [
  "devops",
  "qa",
  "management",
  "ai",
  "data",
  "solutions",
  "recruiter",
  "security",
];

export const stackByRole: Record<UserRole, StackOption[]> = {
  backend: ["node.js", "python", "golang", "rust", "java", ".net", "php"],
  frontend: ["react", "angular", "vue", "next.js", "nuxt", "svelte"],
  fullstack: [
    "node.js",
    "python",
    "golang",
    "rust",
    "java",
    ".net",
    "php",
    "react",
    "angular",
    "vue",
    "next.js",
    "nuxt",
    "svelte",
  ],
  mobile: ["react native", "swift", "kotlin", "flutter", "dart"],
  devops: [],
  qa: [],
  management: [],
  engineer: [
    "node.js",
    "python",
    "golang",
    "rust",
    "java",
    ".net",
    "php",
    "react",
    "angular",
    "vue",
    "next.js",
    "nuxt",
    "svelte",
  ],
  ai: [],
  data: [],
  solutions: [],
  recruiter: [],
  security: [],
};
