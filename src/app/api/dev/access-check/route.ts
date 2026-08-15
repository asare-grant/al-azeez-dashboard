import {
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  getCurrentAccessContext,
} from "@/lib/access-control";

export const dynamic =
  "force-dynamic";

export async function GET() {
  /*
   * Development-only endpoint.
   */
  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return NextResponse.json(
      {
        success:
          false,
      },

      {
        status:
          404,
      },
    );
  }

  const {
    sessionClaims,
  } =
    await auth();

  const legacyRole =
    (
      sessionClaims?.metadata as {
        role?:
          string;
      }
    )?.role ??
    null;

  const access =
    await getCurrentAccessContext();

  return NextResponse.json({
    success:
      true,

    legacy: {
      role:
        legacyRole,
    },

    rbac: {
      provisioned:
        access.provisioned,

      status:
        access.accountStatus,

      active:
        access.active,

      roles:
        access.roles.map(
          (
            role,
          ) => ({
            key:
              role.key,

            name:
              role.name,
          }),
        ),

      permissionCount:
        access.permissionCount,

      permissions:
        Array.from(
          access.permissions,
        ).sort(),
    },
  });
}