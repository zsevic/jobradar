"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { useEffect, useRef, useState } from "react";
import { fetchDashboardJobs, fetchPreset } from "@/lib/api";
import {
  noStackRoles,
  roleLabels,
  rolesWithoutSeniorityFilter,
} from "@/lib/onboarding-options";
import type { DashboardJob, UserRole } from "@/lib/types";
import { REMOTE_LOCATION } from "@/lib/types";
import { formatPostedAgo } from "@/lib/utils";

function formatLocationLabel(location: string): string {
  return location === REMOTE_LOCATION ? "Remote" : location;
}

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const feedBottomRef = useRef<HTMLDivElement>(null);
  const [feedBottomVisible, setFeedBottomVisible] = useState(false);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const limit = 20;
  const presetQuery = useQuery({
    queryKey: ["preset"],
    queryFn: fetchPreset,
    retry: false,
  });
  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs", page, limit],
    queryFn: () => fetchDashboardJobs(page, limit),
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

  const presetRole = presetQuery.data?.role;
  const presetHasNoStackFilter =
    presetRole != null && noStackRoles.includes(presetRole);
  const hideJobStackOnly =
    presetRole === "devops" ||
    presetRole === "qa" ||
    presetRole === "ai" ||
    presetRole === "solutions" ||
    presetRole === "recruiter" ||
    presetRole === "security";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <header id="job-feed-top" className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Your job feed</h1>
          <p className="mt-1 text-slate-400">
            Fresh jobs matched to your filters.
          </p>
          {presetQuery.data && (
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              <span className="font-medium text-slate-300">Active filters:</span>{" "}
              {roleLabels[presetQuery.data.role as UserRole] ??
                presetQuery.data.role}
              {!noStackRoles.includes(presetQuery.data.role) &&
                presetQuery.data.stack.length > 0 && (
                  <> · {presetQuery.data.stack.join(", ")}</>
                )}
              {!rolesWithoutSeniorityFilter.includes(presetQuery.data.role) && (
                <>
                  {" · "}
                  {presetQuery.data.seniority}
                </>
              )}
              {" · "}
              {presetQuery.data.locations.map(formatLocationLabel).join(" · ")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <Link
            href="/settings"
            className="rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
          >
            Settings
          </Link>
          <LogoutButton />
        </div>
      </header>

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
          {presetHasNoStackFilter ? "locations" : "locations or stack"} in{" "}
          <Link href="/settings" className="text-cyan-300 underline">
            Settings
          </Link>
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
                {job.isRemote && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-200">
                    remote
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-300">
                {job.company} • {job.location}
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
                  Seniority: {job.seniority ?? "—"}
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
                  setPage((current) => Math.min(current + 1, jobsQuery.data.totalPages))
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
