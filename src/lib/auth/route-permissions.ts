import "server-only";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

import type {
  AppRole,
} from "@/lib/navigation/roles";

import {
  getRoleDashboardPath,
  isAppRole,
} from "@/lib/navigation/roles";

export async function requireRouteRole(
  allowedRoles:
    readonly AppRole[],
) {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    redirect(
      "/sign-in",
    );
  }

  const roleValue = (
    sessionClaims
      ?.metadata as {
      role?: unknown;
    }
  )?.role;

  if (
    !isAppRole(
      roleValue,
    )
  ) {
    redirect(
      "/sign-in",
    );
  }

  if (
    !allowedRoles.includes(
      roleValue,
    )
  ) {
    redirect(
      getRoleDashboardPath(
        roleValue,
      ),
    );
  }

  return {
    userId,
    role:
      roleValue,
  };
}