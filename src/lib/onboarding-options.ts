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
  engineer: "Engineer",
  ai: "AI / ML",
};

export const seniorityOptions: Seniority[] = ["junior", "mid", "senior", "staff"];

/** Roles where seniority is not user-configurable (fixed for job matching). */
export const rolesWithoutSeniorityFilter: UserRole[] = ["management"];

/** Seniority stored for management presets (backend + UI default). */
export const managementDefaultSeniority: Seniority = "staff";

export const noStackRoles: UserRole[] = ["devops", "qa", "management", "ai"];

export const stackByRole: Record<UserRole, StackOption[]> = {
  backend: ["node.js", "python", "golang", "java", ".net", "php"],
  frontend: ["react", "angular", "vue", "next.js", "nuxt", "svelte"],
  fullstack: [
    "node.js",
    "python",
    "golang",
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
};
