import {
  DashboardJobsPage,
  FilterPreset,
  Job,
  LoginPayload,
  LoginResponse,
} from "@/lib/types";

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

function getAuthHeaders() {
  if (typeof window === "undefined") {
    return defaultHeaders;
  }
  const token = localStorage.getItem("jobradar_token");
  if (!token) {
    return defaultHeaders;
  }
  return {
    ...defaultHeaders,
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchLatestJobs(): Promise<Job[]> {
  const response = await fetch(`${backendBaseUrl}/jobs/latest`, {
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
  const response = await fetch(`${backendBaseUrl}/onboarding/preset`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<FilterPreset>(response);
}

export async function fetchPreset(): Promise<FilterPreset | null> {
  const response = await fetch(`${backendBaseUrl}/onboarding/preset`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  return parseJson<FilterPreset | null>(response);
}

export async function fetchDashboardJobs(
  page = 1,
  limit = 20,
): Promise<DashboardJobsPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const response = await fetch(`${backendBaseUrl}/jobs?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return parseJson<DashboardJobsPage>(response);
}
