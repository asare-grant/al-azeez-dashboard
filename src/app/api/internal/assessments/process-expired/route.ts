import {
  NextResponse,
} from "next/server";

import {
  processExpiredAssessmentAttempts,
} from "@/lib/assessments/process-expired-attempts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(
  request: Request
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  const expected =
    process.env.ASSESSMENT_CRON_SECRET;

  if (!expected) {
    return false;
  }

  return (
    authorization ===
    `Bearer ${expected}`
  );
}

export async function POST(
  request: Request
) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        message: "Unauthorized.",
      },
      {
        status: 401,
      }
    );
  }

  const result =
    await processExpiredAssessmentAttempts({
      batchSize: 100,
    });

  return NextResponse.json({
    success: true,
    ...result,
  });
}