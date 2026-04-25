"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchDashboardJobs } from "@/lib/api";
import { formatPostedAgo } from "@/lib/utils";

export default function DashboardPage() {
  const jobsQuery = useQuery({
    queryKey: ["dashboard-jobs"],
    queryFn: fetchDashboardJobs,
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
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
          Back to landing
        </Link>
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
          {jobsQuery.data.map((job) => (
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
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
              >
                View job
              </a>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
