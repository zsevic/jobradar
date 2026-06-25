import type { Metadata } from "next";
import Link from "next/link";
import { HomeBrowseRedirect } from "@/components/home-browse-redirect";
import { LatestJobsSection } from "@/components/latest-jobs-section";
export const metadata: Metadata = {
  title: {
    absolute: "Home · JobRadar",
  },
};

export default function Home() {
  return (
    <HomeBrowseRedirect>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        <section className="card p-8">
          <p className="text-sm font-medium text-cyan-300">jobradar.tech</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Increase your chances of getting hired by applying earlier.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            We scan verified job boards and surface new, relevant roles
            matched to your filters — apply early and stay ahead.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Find jobs before everyone else
            </Link>
          </div>
        </section>

        <LatestJobsSection />
      </main>
    </HomeBrowseRedirect>
  );
}
