import { NextRequest, NextResponse } from "next/server";
import { FilterPreset } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<FilterPreset>;

  if (!body.role || !body.seniority) {
    return NextResponse.json(
      { message: "Role and seniority are required" },
      { status: 400 },
    );
  }
  if (!body.stack?.length || !body.locations?.length) {
    return NextResponse.json(
      { message: "At least one stack and location are required" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    role: body.role,
    stack: body.stack,
    seniority: body.seniority,
    locations: body.locations,
    alertsEnabled: body.alertsEnabled ?? true,
  });
}
