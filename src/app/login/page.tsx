"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthenticatedEntryRedirect } from "@/components/authenticated-entry-redirect";

const SPONSOR_REQUIRED_MESSAGE =
  "Access requires an active GitHub Sponsors subscription to @zsevic. If your sponsorship expired, renew at github.com/sponsors/zsevic and sign in again.";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage: string | null = null;
  if (error === "not_sponsor") {
    errorMessage = SPONSOR_REQUIRED_MESSAGE;
  } else if (error === "auth_failed") {
    errorMessage = "GitHub sign-in failed. Please try again.";
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Login to JobRadar</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          JobRadar is available to active GitHub Sponsors of{" "}
          <a
            href="https://github.com/sponsors/zsevic"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-300 underline decoration-cyan-500/50 underline-offset-2 hover:text-cyan-200"
          >
            @zsevic
          </a>
          . Sign in with GitHub to continue.
        </p>

        {errorMessage && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {errorMessage}
          </p>
        )}

        <a
          href="/api/auth/github"
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 fill-current"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
          </svg>
          Sign in with GitHub
        </a>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <AuthenticatedEntryRedirect>
      <Suspense
        fallback={
          <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
            <div className="card p-6 text-sm text-slate-300">Loading…</div>
          </main>
        }
      >
        <LoginContent />
      </Suspense>
    </AuthenticatedEntryRedirect>
  );
}
