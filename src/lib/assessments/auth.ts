import { auth } from "@clerk/nextjs/server";

export type AssessmentUserRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent";

export type AssessmentAuthContext = {
  userId: string;
  role: AssessmentUserRole;
};

export async function requireAssessmentUser(): Promise<AssessmentAuthContext> {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: AssessmentUserRole;
    }
  )?.role;

  if (!userId || !role) {
    throw new Error("UNAUTHENTICATED");
  }

  return {
    userId,
    role,
  };
}

export async function requireAssessmentManager(): Promise<AssessmentAuthContext> {
  const user = await requireAssessmentUser();

  if (user.role !== "admin" && user.role !== "teacher") {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAssessmentStudent(): Promise<AssessmentAuthContext> {
  const user = await requireAssessmentUser();

  if (user.role !== "student") {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}