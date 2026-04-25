import { FilterPreset, Job, LoginPayload, LoginResponse } from "@/lib/types";

const defaultHeaders = {
  "Content-Type": "application/json",
};
const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorBody.message ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchLatestJobs(): Promise<Job[]> {
  const response = await fetch("/api/public/latest-jobs", {
    cache: "no-store",
  });
  return parseJson<Job[]>(response);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${backendBaseUrl}/auth/login`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  return parseJson<LoginResponse>(response);
}

export async function savePreset(payload: FilterPreset): Promise<FilterPreset> {
  const response = await fetch("/api/onboarding/preset", {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });
  return parseJson<FilterPreset>(response);
}

export async function fetchDashboardJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs", {
    cache: "no-store",
  });
  return parseJson<Job[]>(response);
}
