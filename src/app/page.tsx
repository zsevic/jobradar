import Link from "next/link";
import { mockJobs } from "@/lib/mock-data";
import { formatPostedAgo } from "@/lib/utils";

export default function Home() {
  const latestJobs = [...mockJobs]
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
    .slice(0, 5);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <section className="card p-8">
        <p className="text-sm font-medium text-cyan-300">jobradar.tech</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Get personalized tech jobs within minutes of posting.
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          We track real company job boards, filter by your profile, and send
          only high-match roles - so you can apply early and stay ahead.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Find jobs before everyone else
          </Link>
        </div>
      </section>

      <section className="mt-8 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Jobs</h2>
          <span className="text-sm text-slate-400">Public preview</span>
        </div>
        <div className="space-y-3">
          {latestJobs.map((job) => (
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
              </div>
              <p className="mt-1 text-slate-300">
                {job.company} • {job.location} {job.isRemote ? "• Remote" : ""}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatPostedAgo(job.postedAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
