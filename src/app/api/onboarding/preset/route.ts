import { NextRequest, NextResponse } from "next/server";
import { noStackRoles } from "@/lib/onboarding-options";
import { FilterPreset, UserRole } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FilterPreset>;

  if (!body.role || !body.seniority) {
    return NextResponse.json(
      { message: "Role and seniority are required" },
      { status: 400 },
    );
  }
  const stackOptional = noStackRoles.includes(body.role as UserRole);
  if (!body.locations?.length) {
    return NextResponse.json(
      { message: "At least one location is required" },
      { status: 400 },
    );
  }
  if (!stackOptional && !body.stack?.length) {
    return NextResponse.json(
      { message: "At least one stack option is required for this role" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    role: body.role,
    stack: stackOptional ? [] : body.stack!,
    seniority: body.seniority,
    locations: body.locations,
    alertsEnabled: body.alertsEnabled ?? true,
  });
}
