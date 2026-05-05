"use client";

import { useEffect, useState } from "react";
import { fetchLatestJobs, getVisitorCountry } from "@/lib/api";
import type { LatestJobsPreviewResponse } from "@/lib/types";
import { mockJobs } from "@/lib/mock-data";
import { formatPostedAgo } from "@/lib/utils";

function formatCountryLabel(token: string): string {
  return token
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mockPreview(): LatestJobsPreviewResponse {
  return {
    items: [...mockJobs]
      .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
      .slice(0, 5),
    total: mockJobs.length,
    country: null,
  };
}

export function LatestJobsSection() {
  const [data, setData] = useState<LatestJobsPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const country = await getVisitorCountry();
        const latest = await fetchLatestJobs(country);
        if (!cancelled) {
          setData(latest);
        }
      } catch {
        if (!cancelled) {
          setData(mockPreview());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) {
    return (
      <section className="mt-8 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Jobs</h2>
          <span className="text-sm text-slate-400">Loading…</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 card p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Latest Jobs</h2>
        <span className="text-sm text-slate-400">
          Public preview — {data.total.toLocaleString()} total jobs
        </span>
      </div>
      {data.country ? (
        <p className="mb-4 text-sm text-slate-400">
          Showing roles in{" "}
          <span className="font-medium text-slate-200">
            {formatCountryLabel(data.country)}
          </span>
          {data.items.some((job) => job.isRemote)
            ? " and remote openings."
            : "."}
        </p>
      ) : null}
      <div className="space-y-3">
        {data.items.map((job) => (
          <article
            key={job.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{job.title}</h3>
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
          </article>
        ))}
      </div>
    </section>
  );
}
