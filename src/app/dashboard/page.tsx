"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { fetchDashboardJobs } from "@/lib/api";
import type { DashboardJob } from "@/lib/types";
import { formatPostedAgo } from "@/lib/utils";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs", page, limit],
    queryFn: () => fetchDashboardJobs(page, limit),
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Your job feed</h1>
          <p className="mt-1 text-slate-400">
            Fresh jobs matched to your filters.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="rounded-lg border border-cyan-500/60 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/10"
          >
            Settings
          </Link>
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

      {jobsQuery.data && (
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
              <p className="mt-2 text-sm text-slate-400">
                Stack:{" "}
                {job.stack.length > 0 ? job.stack.join(", ") : "—"}
                {" · "}
                Seniority: {job.seniority ?? "—"}
              </p>
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
              Page {jobsQuery.data.page} of {jobsQuery.data.totalPages}
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
        </section>
      )}
    </main>
  );
}
