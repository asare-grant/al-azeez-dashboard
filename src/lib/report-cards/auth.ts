import {
  auth,
} from "@clerk/nextjs/server";

export type ReportCardRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent";

export async function requireReportCardUser() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role as
    | ReportCardRole
    | undefined;

  if (!role) {
    throw new Error(
      "ROLE_NOT_FOUND",
    );
  }

  return {
    userId,
    role,
  };
}

export async function requireReportCardManager() {
  const user =
    await requireReportCardUser();

  if (
    user.role !== "admin" &&
    user.role !== "teacher"
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return user;
}

export async function requireReportCardAdmin() {
  const user =
    await requireReportCardUser();

  if (user.role !== "admin") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return user;
}