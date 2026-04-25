import { NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-data";

export async function GET() {
  const latest = [...mockJobs]
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
    .slice(0, 5);
  return NextResponse.json(latest);
}
