import {
  DashboardJobsPage,
  FilterPreset,
  LatestJobsPreviewResponse,
} from "@/lib/types";

const defaultHeaders = {
  "Content-Type": "application/json",
};
const backendBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002/api";
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const RETRY_DELAYS_MS = [300, 700, 1500] as const;

type ApiErrorBody = {
  error?: string;
  message?: string | { error?: string; message?: string };
};

function extractApiErrorMessage(
  status: number,
  errorBody: ApiErrorBody,
): string {
  const nested =
    typeof errorBody.message === "object" && errorBody.message !== null
      ? errorBody.message
      : null;
  const text =
    nested?.message ??
    (typeof errorBody.message === "string" ? errorBody.message : undefined);

  if (status === 429) {
    return text ?? "Too many requests. Please wait a moment and try again.";
  }
  return text ?? "Request failed";
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    let message = "Request failed";
    if (text.trim()) {
      try {
        const errorBody = JSON.parse(text) as ApiErrorBody;
        message = extractApiErrorMessage(response.status, errorBody);
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withJitter(ms: number): number {
  return ms + Math.floor(Math.random() * 200);
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(input, init);
      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        return response;
      }
      if (attempt === RETRY_DELAYS_MS.length - 1) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_DELAYS_MS.length - 1) {
        throw error;
      }
    }

    await sleep(withJitter(RETRY_DELAYS_MS[attempt]));
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error("Request failed after retries");
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
  const response = await fetchWithRetry(`${backendBaseUrl}/jobs/latest${qs}`, {
    cache: "no-store",
  });
  return parseJson<LatestJobsPreviewResponse>(response);
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
  }
  const response = await fetchWithRetry(
    `${backendBaseUrl}/jobs?${params.toString()}`,
    {
      headers: defaultHeaders,
      cache: "no-store",
    },
  );
  return parseJson<DashboardJobsPage>(response);
}
