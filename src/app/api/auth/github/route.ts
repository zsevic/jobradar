import { NextResponse } from "next/server";

function getOAuthStartUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (apiBaseUrl?.startsWith("http")) {
    return `${apiBaseUrl}/auth/github`;
  }

  const backendOrigin = (
    process.env.BACKEND_ORIGIN ?? "http://localhost:3002"
  ).replace(/\/$/, "");

  return `${backendOrigin}/api/auth/github`;
}

export function GET() {
  return NextResponse.redirect(getOAuthStartUrl());
}
