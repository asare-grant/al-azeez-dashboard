import { auth } from "@clerk/nextjs/server";

import {
  AccessAuditAction,
  Prisma,
} from "@prisma/client";

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type UpdateBody = {
  displayName?: unknown;
  username?: unknown;
  email?: unknown;
  phone?: unknown;
};

type NormalizedUpdate = {
  displayName: string;
  username: string | null;
  email: string | null;
  phone: string | null;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHENTICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const { userId: actorId } = await auth();

    if (!actorId) {
      return NextResponse.json(
        {
          error: "You must be signed in to edit a user.",
        },
        {
          status: 401,
        },
      );
    }

    const { userId: targetUserId } = await params;

    /* ---------------------------------------------------------------------- */
    /* ACTOR + PERMISSIONS                                                    */
    /* ---------------------------------------------------------------------- */

    const actorAccount = await prisma.userAccount.findUnique({
      where: {
        id: actorId,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!actorAccount) {
      return NextResponse.json(
        {
          error:
            "Your authenticated identity does not have a local UserAccount.",
        },
        {
          status: 403,
        },
      );
    }

    const actorPermissions = new Set(
      actorAccount.roles
        .filter((assignment) => assignment.role.isActive)
        .flatMap((assignment) =>
          assignment.role.permissions
            .filter(
              (rolePermission) =>
                rolePermission.permission.isActive,
            )
            .map(
              (rolePermission) =>
                rolePermission.permission.key,
            ),
        ),
    );

    const canEditUsers =
      actorAccount.legacyRole?.toLowerCase() === "admin" ||
      actorPermissions.has("users.update");

    if (!canEditUsers) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to edit user identities.",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TARGET                                                                 */
    /* ---------------------------------------------------------------------- */

    const targetUser = await prisma.userAccount.findUnique({
      where: {
        id: targetUserId,
      },

      select: {
        id: true,

        displayName: true,

        username: true,

        email: true,

        phone: true,

        imageUrl: true,

        status: true,

        legacyRole: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "The user account could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                   */
    /* ---------------------------------------------------------------------- */

    const body = (await request.json()) as UpdateBody;

    const normalized = normalizeBody(body);

    const validationError = validateUpdate(
      normalized,
      targetUser.legacyRole,
    );

    if (validationError) {
      return NextResponse.json(
        {
          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* CHANGES                                                                */
    /* ---------------------------------------------------------------------- */

    const before = {
      displayName: targetUser.displayName,

      username: targetUser.username,

      email: targetUser.email,

      phone: targetUser.phone,
    };

    const after = normalized;

    const changedFields = Object.keys(after).filter((key) => {
      const field = key as keyof NormalizedUpdate;

      return before[field] !== after[field];
    });

    if (changedFields.length === 0) {
      return NextResponse.json({
        success: true,

        message: "No account information changed.",

        domainSync: {
          attempted: false,
          synchronized: false,
          type: null,
        },
      });
    }

    /* ---------------------------------------------------------------------- */
    /* DOMAIN TYPE                                                            */
    /* ---------------------------------------------------------------------- */

    const legacyRole =
      targetUser.legacyRole?.trim().toLowerCase() ?? null;

    const domainBacked =
      legacyRole === "student" ||
      legacyRole === "teacher" ||
      legacyRole === "parent" ||
      legacyRole === "admin";

    /* ---------------------------------------------------------------------- */
    /* TRANSACTION                                                            */
    /* ---------------------------------------------------------------------- */

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.userAccount.update({
        where: {
          id: targetUser.id,
        },

        data: {
          displayName: normalized.displayName,

          username: normalized.username,

          email: normalized.email,

          phone: normalized.phone,
        },
      });

      let domainSynchronized = false;

      /*
       * ------------------------------------------------------------
       * Student
       * ------------------------------------------------------------
       */

      if (legacyRole === "student") {
        const domainUpdate = await tx.student.updateMany({
          where: {
            id: targetUser.id,
          },

          data: {
            username: normalized.username!,

            email: normalized.email,

            phone: normalized.phone,
          },
        });

        domainSynchronized = domainUpdate.count > 0;
      }

      /*
       * ------------------------------------------------------------
       * Teacher
       * ------------------------------------------------------------
       */

      if (legacyRole === "teacher") {
        const domainUpdate = await tx.teacher.updateMany({
          where: {
            id: targetUser.id,
          },

          data: {
            username: normalized.username!,

            email: normalized.email,

            phone: normalized.phone,
          },
        });

        domainSynchronized = domainUpdate.count > 0;
      }

      /*
       * ------------------------------------------------------------
       * Parent
       * ------------------------------------------------------------
       */

      if (legacyRole === "parent") {
        const domainUpdate = await tx.parent.updateMany({
          where: {
            id: targetUser.id,
          },

          data: {
            username: normalized.username!,

            email: normalized.email,

            /*
             * Parent.phone is required by the schema.
             */
            phone: normalized.phone!,
          },
        });

        domainSynchronized = domainUpdate.count > 0;
      }

      /*
       * ------------------------------------------------------------
       * Admin
       * ------------------------------------------------------------
       */

      if (legacyRole === "admin") {
        const domainUpdate = await tx.admin.updateMany({
          where: {
            id: targetUser.id,
          },

          data: {
            username: normalized.username!,
          },
        });

        domainSynchronized = domainUpdate.count > 0;
      }

      /* -------------------------------------------------------------------- */
      /* AUDIT                                                                */
      /* -------------------------------------------------------------------- */

      await tx.accessAuditLog.create({
        data: {
          action: AccessAuditAction.USER_UPDATED,

          actorId: actorAccount.id,

          actorName:
            actorAccount.displayName ??
            actorAccount.username ??
            actorAccount.email ??
            "Administrator",

          actorRole: actorAccount.legacyRole,

          targetUserId: targetUser.id,

          reason: "User identity information updated.",

          metadata: {
            source: "USER_DETAIL_EDIT_DRAWER",

            changedFields,

            before,

            after,

            domainSynchronization: {
              expected: domainBacked,

              type: legacyRole,

              synchronized: domainSynchronized,
            },
          },
        },
      });

      return {
        updatedUser,

        domainSynchronized,
      };
    });

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      message: `${
        result.updatedUser.displayName ?? "User"
      } was updated successfully.`,

      user: {
        id: result.updatedUser.id,

        displayName: result.updatedUser.displayName,

        username: result.updatedUser.username,

        email: result.updatedUser.email,

        phone: result.updatedUser.phone,
      },

      domainSync: {
        attempted: domainBacked,

        synchronized: result.domainSynchronized,

        type: legacyRole,
      },
    });
  } catch (error) {
    /* ---------------------------------------------------------------------- */
    /* UNIQUE CONSTRAINT                                                      */
    /* ---------------------------------------------------------------------- */

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : "one of the supplied values";

      return NextResponse.json(
        {
          error: `Another record already uses ${fields}.`,
        },
        {
          status: 409,
        },
      );
    }

    console.error("[USER_PROFILE_PATCH]", error);

    return NextResponse.json(
      {
        error:
          "The user identity could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ========================================================================== */
/* NORMALIZATION                                                              */
/* ========================================================================== */

function normalizeBody(body: UpdateBody): NormalizedUpdate {
  return {
    displayName:
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : "",

    username:
      typeof body.username === "string" &&
      body.username.trim()
        ? body.username.trim()
        : null,

    email:
      typeof body.email === "string" &&
      body.email.trim()
        ? body.email.trim().toLowerCase()
        : null,

    phone:
      typeof body.phone === "string" &&
      body.phone.trim()
        ? body.phone.trim()
        : null,
  };
}

/* ========================================================================== */
/* VALIDATION                                                                 */
/* ========================================================================== */

function validateUpdate(
  value: NormalizedUpdate,
  legacyRole: string | null,
) {
  if (!value.displayName) {
    return "Display name is required.";
  }

  if (
    value.displayName.length < 2 ||
    value.displayName.length > 100
  ) {
    return "Display name must contain between 2 and 100 characters.";
  }

  const normalizedRole =
    legacyRole?.trim().toLowerCase() ?? null;

  const domainBacked =
    normalizedRole === "student" ||
    normalizedRole === "teacher" ||
    normalizedRole === "parent" ||
    normalizedRole === "admin";

  if (domainBacked && !value.username) {
    return "Username is required for linked school-domain identities.";
  }

  if (value.username) {
    if (
      value.username.length < 3 ||
      value.username.length > 60
    ) {
      return "Username must contain between 3 and 60 characters.";
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(value.username)) {
      return "Username contains unsupported characters.";
    }
  }

  if (
    value.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)
  ) {
    return "Enter a valid email address.";
  }

  /*
   * Parent.phone is required:
   *
   * model Parent {
   *   phone String @unique
   * }
   */

  if (normalizedRole === "parent" && !value.phone) {
    return "Phone number is required for Parent identities.";
  }

  if (value.phone && value.phone.length > 40) {
    return "Phone number cannot exceed 40 characters.";
  }

  return null;
}