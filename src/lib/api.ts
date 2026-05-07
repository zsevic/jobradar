import {
  DashboardJobsPage,
  FilterPreset,
  Job,
  LatestJobsPreviewResponse,
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

/** Removes stored session tokens (client-only). */
export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("jobradar_token");
  localStorage.removeItem("jobradar_email");
}

const VISITOR_COUNTRY_SESSION_KEY = "jobradar_country";

/**
 * Two-letter ISO country from ipapi.co, cached in sessionStorage for the tab.
 * Returns null when unavailable (blocked, failed, or already cached miss).
 */
export async function getVisitorCountry(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }
  const cached = sessionStorage.getItem(VISITOR_COUNTRY_SESSION_KEY);
  if (cached !== null) {
    return cached === "" ? null : cached;
  }
  try {
    const response = await fetch("https://ipapi.co/country/", {
      cache: "no-store",
    });
    if (!response.ok) {
      sessionStorage.setItem(VISITOR_COUNTRY_SESSION_KEY, "");
      return null;
    }
    const text = (await response.text()).trim();
    if (!text || text.length !== 2) {
      sessionStorage.setItem(VISITOR_COUNTRY_SESSION_KEY, "");
      return null;
    }
    const code = text.toUpperCase();
    sessionStorage.setItem(VISITOR_COUNTRY_SESSION_KEY, code);
    return code;
  } catch {
    sessionStorage.setItem(VISITOR_COUNTRY_SESSION_KEY, "");
    return null;
  }
}

export async function fetchLatestJobs(
  country?: string | null,
): Promise<LatestJobsPreviewResponse> {
  const qs =
    country && country.trim()
      ? `?country=${encodeURIComponent(country.trim())}`
      : "";
  const response = await fetch(`${backendBaseUrl}/jobs/latest${qs}`, {
    cache: "no-store",
  });
  return parseJson<LatestJobsPreviewResponse>(response);
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

export async function updateAlertsEnabled(
  alertsEnabled: boolean,
): Promise<FilterPreset> {
  const response = await fetch(`${backendBaseUrl}/onboarding/alerts`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ alertsEnabled }),
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
  filters?: FilterPreset | null,
): Promise<DashboardJobsPage> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters) {
    params.set("role", filters.role);
    for (const stack of filters.stack) {
      params.append("stack", stack);
    }
    params.set("seniority", filters.seniority);
    for (const loc of filters.locations) {
      params.append("location", loc);
    }
    params.set("alertsEnabled", String(filters.alertsEnabled));
  }
  const response = await fetch(`${backendBaseUrl}/jobs?${params.toString()}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  return parseJson<DashboardJobsPage>(response);
}

export async function unsubscribeFromEmailToken(token: string): Promise<void> {
  const response = await fetch(
    `${backendBaseUrl}/notifications/unsubscribe?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const text = await response.text();
    let message = "Unsubscribe failed";
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
}
