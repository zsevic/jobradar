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

function toFilterPreset(value: FilterPreset): FilterPreset {
  return {
    role: value.role,
    stack: value.stack,
    seniority: value.seniority,
    locations: value.locations,
    alertsEnabled: value.alertsEnabled,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = "Request failed";
    if (text.trim()) {
      try {
        const errorBody = JSON.parse(text) as { message?: string };
        message = errorBody.message ?? message;
      } catch {
        message = text.slice(0, 200);
      }
    }
    throw new Error(message);
  }
  if (!text.trim()) {
    throw new Error("Empty response body");
  }
  return JSON.parse(text) as T;
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
  const safePayload = toFilterPreset(payload);
  const response = await fetch(`${backendBaseUrl}/onboarding/preset`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(safePayload),
  });
  const data = await parseJson<FilterPreset>(response);
  return toFilterPreset(data);
}

export async function fetchPreset(): Promise<FilterPreset | null> {
  const response = await fetch(`${backendBaseUrl}/onboarding/preset`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  const text = await response.text();
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    let message = "Request failed";
    if (text.trim()) {
      try {
        const errorBody = JSON.parse(text) as { message?: string };
        message = errorBody.message ?? message;
      } catch {
        message = text.slice(0, 200);
      }
    }
    throw new Error(message);
  }
  // Nest may omit the body when no preset existed; empty body means "no preset".
  if (!text.trim()) {
    return null;
  }
  const data = JSON.parse(text) as FilterPreset | null;
  if (data === null || data === undefined) {
    return null;
  }
  return toFilterPreset(data);
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
