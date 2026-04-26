import { Seniority, StackOption, UserRole } from "@/lib/types";

export const roleOptions: UserRole[] = [
  "backend",
  "frontend",
  "fullstack",
  "mobile",
  "devops",
  "qa",
];

export const seniorityOptions: Seniority[] = ["junior", "mid", "senior", "staff"];
export const noStackRoles: UserRole[] = ["devops", "qa"];

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
};
