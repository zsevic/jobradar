"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/api";

type Props = {
  className?: string;
};

export function LogoutButton({
  className = "rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800",
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  function handleLogout() {
    clearAuthSession();
    queryClient.clear();
    router.push("/login");
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Log out
    </button>
  );
}
