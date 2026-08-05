import {
  auth,
} from "@clerk/nextjs/server";

export type AcademicWeightingManager = {
  userId: string;
  role: "admin";
};

export async function requireAcademicWeightingAdmin(): Promise<AcademicWeightingManager> {
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
  )?.role;

  if (role !== "admin") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return {
    userId,
    role,
  };
}