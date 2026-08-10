// // src/lib/report-cards/auths
// import {
//   auth,
// } from "@clerk/nextjs/server";

// export type ReportCardRole =
//   | "admin"
//   | "teacher"
//   | "student"
//   | "parent";

// export async function requireReportCardUser() {
//   const {
//     userId,
//     sessionClaims,
//   } = await auth();

//   if (!userId) {
//     throw new Error(
//       "UNAUTHENTICATED",
//     );
//   }

//   const role = (
//     sessionClaims?.metadata as {
//       role?: string;
//     }
//   )?.role as
//     | ReportCardRole
//     | undefined;

//   if (!role) {
//     throw new Error(
//       "ROLE_NOT_FOUND",
//     );
//   }

//   return {
//     userId,
//     role,
//   };
// }

// export async function requireReportCardManager() {
//   const user =
//     await requireReportCardUser();

//   if (
//     user.role !== "admin" &&
//     user.role !== "teacher"
//   ) {
//     throw new Error(
//       "UNAUTHORISED",
//     );
//   }

//   return user;
// }

// export async function requireReportCardAdmin() {
//   const user =
//     await requireReportCardUser();

//   if (user.role !== "admin") {
//     throw new Error(
//       "UNAUTHORISED",
//     );
//   }

//   return user;
// }




import {
  auth,
} from "@clerk/nextjs/server";

export const REPORT_CARD_ROLES = [
  "admin",
  "teacher",
  "student",
  "parent",
] as const;

export type ReportCardRole =
  (typeof REPORT_CARD_ROLES)[number];

function isReportCardRole(
  value: unknown,
): value is ReportCardRole {
  return (
    typeof value === "string" &&
    REPORT_CARD_ROLES.includes(
      value as ReportCardRole,
    )
  );
}

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

  const rawRole = (
    sessionClaims
      ?.metadata as {
      role?: unknown;
    } | undefined
  )?.role;

  if (
    !isReportCardRole(
      rawRole,
    )
  ) {
    throw new Error(
      "ROLE_NOT_FOUND",
    );
  }

  return {
    userId,
    role:
      rawRole,
  } as const;
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

  return {
    userId:
      user.userId,

    role:
      user.role,
  } as const;
}

export async function requireReportCardAdmin() {
  const user =
    await requireReportCardUser();

  if (
    user.role !==
    "admin"
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return {
    userId:
      user.userId,

    role:
      user.role,
  } as const;
}