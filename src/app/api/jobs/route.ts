import { NextResponse } from "next/server";
import { mockJobs } from "@/lib/mock-data";

export async function GET() {
  const sorted = [...mockJobs].sort(
    (a, b) => +new Date(b.postedAt) - +new Date(a.postedAt),
  );
  return NextResponse.json(sorted);
}
