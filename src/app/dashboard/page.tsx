"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FilterEditor,
  normalizePreset,
  presetsEqual,
} from "@/components/filter-editor";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchDashboardJobs } from "@/lib/api";
import {
  discardLegacyAuthStorage,
  readBrowseFilters,
  writeBrowseFilters,
} from "@/lib/browse-filters-storage";
import { defaultBrowsePreset } from "@/lib/default-browse-preset";
import {
  formatJobSeniorities,
  noStackRoles,
  roleLabels,
  rolesWithoutSeniorityFilter,
} from "@/lib/filter-options";
import { isFullyRemoteOnly } from "@/lib/location-preset";
import type { DashboardJob, FilterPreset, UserRole } from "@/lib/types";
import { FULLY_REMOTE_LOCATION, REMOTE_LOCATION } from "@/lib/types";
import { formatPostedAgo } from "@/lib/utils";

function formatLocationLabel(location: string): string {
  if (location === FULLY_REMOTE_LOCATION) {
    return "Fully remote";
  }
  return location === REMOTE_LOCATION ? "Remote" : location;
}

function isPlainRemoteLocation(location: string): boolean {
  return location.trim().toLowerCase() === REMOTE_LOCATION;
}

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const feedBottomRef = useRef<HTMLDivElement>(null);
  const [feedBottomVisible, setFeedBottomVisible] = useState(false);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<FilterPreset | null>(null);
  const [appliedOverride, setAppliedOverride] = useState<FilterPreset | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const limit = 20;

  const defaultPreset = useMemo(
    () => normalizePreset(defaultBrowsePreset),
    [],
  );

  useEffect(() => {
    discardLegacyAuthStorage();
    const stored = readBrowseFilters();
    if (stored) {
      setDraft(stored);
      setAppliedOverride(stored);
      return;
    }
    setDraft(defaultPreset);
    setAppliedOverride(null);
  }, [defaultPreset]);

  const jobFilters = appliedOverride ?? defaultPreset;
  const jobFiltersKey = JSON.stringify(jobFilters);

  useEffect(() => {
    writeBrowseFilters(jobFilters);
  }, [jobFiltersKey, jobFilters]);

  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs", page, limit, jobFiltersKey],
    queryFn: () => fetchDashboardJobs(page, limit, jobFilters),
  });

  useEffect(() => {
    const onScroll = () => setHasScrolledDown(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const node = feedBottomRef.current;
    if (!node || !jobsQuery.data?.items.length) {
      setFeedBottomVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setFeedBottomVisible(entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: "0px 0px 64px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [jobsQuery.data?.items.length, jobsQuery.data?.totalPages, page]);

  const showBackToTop =
    Boolean(jobsQuery.data?.items.length) && feedBottomVisible && hasScrolledDown;

  const displayPreset = jobFilters;
  const fullyRemoteFilterActive = Boolean(
    displayPreset && isFullyRemoteOnly(displayPreset.locations),
  );
  const presetRole = displayPreset?.role;
  const presetHasNoStackFilter =
    presetRole != null && noStackRoles.includes(presetRole);
  const hideJobStackOnly =
    presetRole === "devops" ||
    presetRole === "qa" ||
    presetRole === "ai" ||
    presetRole === "data" ||
    presetRole === "solutions" ||
    presetRole === "recruiter" ||
    presetRole === "designer" ||
    presetRole === "security";

  function validateDraftForApply(value: FilterPreset): string | null {
    const stackRequired = !noStackRoles.includes(value.role);
    if (stackRequired && value.stack.length === 0) {
      return "Please select at least one stack option.";
    }
    if (value.locations.length === 0) {
      return "Please select at least one location.";
    }
    return null;
  }

  function onApplyFilters() {
    setFormError(null);
    if (!draft) {
      return;
    }
    const err = validateDraftForApply(draft);
    if (err) {
      setFormError(err);
      return;
    }
    const normalized = normalizePreset(draft);
    writeBrowseFilters(normalized);
    setAppliedOverride(normalized);
    setPage(1);
  }

  function onResetFilters() {
    setFormError(null);
    setDraft(defaultPreset);
    setAppliedOverride(null);
    writeBrowseFilters(defaultPreset);
    setPage(1);
  }

  const normalizedDraft = draft ? normalizePreset(draft) : null;
  const applyDisabled =
    normalizedDraft == null ||
    (jobFilters != null && presetsEqual(normalizedDraft, jobFilters));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <header id="job-feed-top" className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Job feed</h1>
          <p className="mt-1 text-slate-400">
            Fresh jobs matched to your filters.
          </p>
          {displayPreset && (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              <span className="font-medium text-slate-300">Active filters:</span>{" "}
              {roleLabels[displayPreset.role as UserRole] ?? displayPreset.role}
              {!noStackRoles.includes(displayPreset.role) &&
                displayPreset.stack.length > 0 && (
                  <> · {displayPreset.stack.join(", ")}</>
                )}
              {!rolesWithoutSeniorityFilter.includes(displayPreset.role) && (
                <>
                  {" · "}
                  {displayPreset.seniority}
                </>
              )}
              {" · "}
              {displayPreset.locations.map(formatLocationLabel).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          {draft && (
            <button
              type="button"
              onClick={() => setEditorOpen((open) => !open)}
              className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
            >
              <span>{editorOpen ? "Hide filters" : "Edit filters"}</span>
            </button>
          )}
        </div>
      </header>

      {draft && editorOpen && (
        <section className="mb-6 card p-4">
          <div className="space-y-4">
            <FilterEditor
              value={draft}
              onChange={(next) => {
                setDraft(next);
              }}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onApplyFilters}
                disabled={applyDisabled}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={onResetFilters}
                disabled={
                  presetsEqual(draft, defaultPreset) && appliedOverride == null
                }
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
            {formError && <p className="text-sm text-red-300">{formError}</p>}
          </div>
        </section>
      )}

      {jobsQuery.isLoading && (
        <div className="card p-5 text-slate-300">Loading jobs...</div>
      )}

      {jobsQuery.error && (
        <div className="card p-5 text-red-300">
          Failed to load jobs: {(jobsQuery.error as Error).message}
        </div>
      )}

      {jobsQuery.data && jobsQuery.data.items.length === 0 && (
        <div className="card p-5 text-slate-400">
          No jobs match your filters right now. Try widening your{" "}
          {presetHasNoStackFilter ? "locations" : "locations or stack"}
          {draft && (
            <>
              {" "}
              or{" "}
              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                className="text-cyan-300 underline"
              >
                edit filters here
              </button>
            </>
          )}
          .
        </div>
      )}

      {jobsQuery.data && jobsQuery.data.items.length > 0 && (
        <section className="space-y-3">
          {jobsQuery.data.items.map((job: DashboardJob) => (
            <article key={job.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                {job.isNew && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    new
                  </span>
                )}
                {job.isRemote && !fullyRemoteFilterActive && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
                    remote
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-300">
                {job.company}
                {!fullyRemoteFilterActive &&
                  !isPlainRemoteLocation(job.location) && (
                    <> • {job.location}</>
                  )}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatPostedAgo(job.postedAt)}
              </p>
              {presetRole !== "management" && (
                <p className="mt-2 text-sm text-slate-400">
                  {!hideJobStackOnly && (
                    <>
                      Stack:{" "}
                      {job.stack.length > 0 ? job.stack.join(", ") : "—"}
                      {" · "}
                    </>
                  )}
                  Seniority: {formatJobSeniorities(job.seniorities)}
                </p>
              )}
              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
                >
                  View job
                </a>
              )}
            </article>
          ))}

          <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-sm text-slate-300">
              Page {jobsQuery.data.page} of {jobsQuery.data.totalPages}{" "}
              <span className="text-slate-500">
                ({jobsQuery.data.total} total)
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, jobsQuery.data.totalPages),
                  )
                }
                disabled={page >= jobsQuery.data.totalPages}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          <div ref={feedBottomRef} className="h-px w-full shrink-0" aria-hidden />
        </section>
      )}

      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top of job feed"
          onClick={() => {
            document.getElementById("job-feed-top")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
          className="fixed bottom-6 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-cyan-500/50 bg-slate-900/95 text-cyan-200 shadow-lg backdrop-blur hover:bg-slate-800 hover:text-cyan-100 md:bottom-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </main>
  );
}
