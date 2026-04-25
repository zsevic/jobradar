import { NextRequest, NextResponse } from "next/server";
import { LoginPayload } from "@/lib/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<LoginPayload>;
  const email = (body.email ?? "").trim().toLowerCase();
  const licenseKey = (body.licenseKey ?? "").trim();

  if (!isValidEmail(email) || licenseKey.length < 10) {
    return NextResponse.json(
      { message: "Invalid email or license key" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    token: `mock-jwt-${Buffer.from(email).toString("base64url")}`,
    user: {
      id: crypto.randomUUID(),
      email,
    },
  });
}
