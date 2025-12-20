import { NextRequest, NextResponse } from "next/server";
import { getStudentReport } from "@/lib/reports";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "10");

  const report = await getStudentReport(page, limit);
  return NextResponse.json(report);
}
