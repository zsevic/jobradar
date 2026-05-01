"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthenticatedEntryRedirect } from "@/components/authenticated-entry-redirect";
import { fetchPreset, login } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      localStorage.setItem("jobradar_token", data.accessToken);
      localStorage.setItem("jobradar_email", data.user.email);
      const preset = await fetchPreset().catch(() => null);
      router.push(preset ? "/dashboard" : "/onboarding");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate({ email, licenseKey });
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold">Login to JobRadar</h1>
        <p className="mt-2 text-sm text-slate-400">
          Use your email and Gumroad license key.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-300">
              License key
            </span>
            <input
              type="text"
              required
              value={licenseKey}
              onChange={(event) => setLicenseKey(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-cyan-400"
            />
          </label>

          {loginMutation.error && (
            <p className="text-sm text-red-300">
              {(loginMutation.error as Error).message}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <AuthenticatedEntryRedirect>
      <LoginForm />
    </AuthenticatedEntryRedirect>
  );
}
