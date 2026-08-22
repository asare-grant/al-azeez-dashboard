// src/app/api/access-control/users/[userId]/audit/export/route.ts

import { NextRequest, NextResponse } from "next/server";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import {
  buildAuditFilters,
  buildUserAuditWhere,
} from "@/lib/access-control/audit-query";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const MAX_EXPORT_RECORDS = 10_000;

/* ========================================================================== */
/* CSV ESCAPING                                                               */
/* ========================================================================== */

function csvCell(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  let text = typeof value === "string" ? value : String(value);

  /*
   * Protect spreadsheet applications from
   * interpreting exported values as formulas.
   */
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  /*
   * Standard CSV escaping.
   */
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/* ========================================================================== */
/* JSON METADATA                                                              */
/* ========================================================================== */

function serializeMetadata(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/* ========================================================================== */
/* SAFE FILE NAME                                                             */
/* ========================================================================== */

function safeFilePart(value: string) {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "user";
}

/* ========================================================================== */
/* GET EXPORT                                                                 */
/* ========================================================================== */

export async function GET(
  request: NextRequest,

  context: {
    params: Promise<{
      userId: string;
    }>;
  },
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHENTICATION                                                         */
    /* ---------------------------------------------------------------------- */

    const access = await getCurrentAccessContext();

    if (!access.authenticated) {
      return NextResponse.json(
        {
          message: "Unauthenticated.",
        },
        {
          status: 401,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    /*
     * This export exposes security and administrative
     * audit history.
     *
     * It therefore uses the same permission as the
     * Audit Trail workspace itself.
     */
    if (!contextHasPermission(access, "audit.view")) {
      return NextResponse.json(
        {
          message: "You do not have permission to export audit history.",
        },
        {
          status: 403,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* TARGET USER                                                            */
    /* ---------------------------------------------------------------------- */

    const { userId } = await context.params;

    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
      return NextResponse.json(
        {
          message: "A valid user account is required.",
        },
        {
          status: 400,
        },
      );
    }

    const targetUser = await prisma.userAccount.findUnique({
      where: {
        id: normalizedUserId,
      },

      select: {
        id: true,

        displayName: true,

        username: true,

        email: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          message: "User account not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* FILTERS                                                                */
    /* ---------------------------------------------------------------------- */

    const searchParams = request.nextUrl.searchParams;

    const auditAction = searchParams.get("auditAction") ?? "";

    const auditActor = searchParams.get("auditActor") ?? "";

    const auditFrom = searchParams.get("auditFrom") ?? "";

    const auditTo = searchParams.get("auditTo") ?? "";

    const filters = buildAuditFilters({
      action: auditAction,

      actor: auditActor,

      from: auditFrom,

      to: auditTo,
    });

    const userAuditWhere = buildUserAuditWhere({
      userId: targetUser.id,

      filters,
    });

    /* ---------------------------------------------------------------------- */
    /* EXPORT LIMIT                                                           */
    /* ---------------------------------------------------------------------- */

    const totalRecords = await prisma.accessAuditLog.count({
      where: userAuditWhere,
    });

    if (totalRecords > MAX_EXPORT_RECORDS) {
      return NextResponse.json(
        {
          message: `This export contains ${totalRecords.toLocaleString()} records. Narrow the audit filters before exporting. The maximum export size is ${MAX_EXPORT_RECORDS.toLocaleString()} records.`,
        },
        {
          status: 413,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* FETCH COMPLETE FILTERED RESULT                                         */
    /* ---------------------------------------------------------------------- */

    const records = await prisma.accessAuditLog.findMany({
      where: userAuditWhere,

      orderBy: [
        {
          createdAt: "desc",
        },

        {
          id: "desc",
        },
      ],

      select: {
        id: true,

        createdAt: true,

        action: true,

        actorId: true,

        actorName: true,

        actorRole: true,

        targetUserId: true,

        roleId: true,

        metadata: true,
      },
    });

    /* ------------------------------------------------------------------------ */
    /* RESOLVE REFERENCED ROLES                                                 */
    /* ------------------------------------------------------------------------ */

    /*
     * AccessAuditLog intentionally stores roleId as
     * historical audit context but does not expose a
     * Prisma relation to AccessRole.
     *
     * Resolve the referenced roles separately so the
     * CSV can still include the role's human-readable
     * identity without changing the database schema.
     */
    const roleIds = Array.from(
      new Set(
        records
          .map((record) => record.roleId)
          .filter((roleId): roleId is number => roleId !== null),
      ),
    );

    const roles =
      roleIds.length > 0
        ? await prisma.accessRole.findMany({
            where: {
              id: {
                in: roleIds,
              },
            },

            select: {
              id: true,

              key: true,

              name: true,

              type: true,
            },
          })
        : [];

    const roleById = new Map(roles.map((role) => [role.id, role]));

    /* ---------------------------------------------------------------------- */
    /* CSV                                                                    */
    /* ---------------------------------------------------------------------- */

    const headers = [
      "Audit ID",
      "Timestamp",
      "Action",
      "Actor Name",
      "Actor ID",
      "Actor Role",
      "Target User",
      "Role Name",
      "Role Key",
      "Role Type",
      "Metadata",
    ];

    const rows = records.map((record) => {
      const referencedRole =
        record.roleId !== null ? roleById.get(record.roleId) : undefined;

      return [
        record.id,

        record.createdAt.toISOString(),

        record.action,

        record.actorName ?? "",

        record.actorId ?? "",

        record.actorRole ?? "",

        record.targetUserId ?? "",

        referencedRole?.name ?? "",

        referencedRole?.key ?? "",

        referencedRole?.type ?? "",

        serializeMetadata(record.metadata),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    /*
     * UTF-8 BOM improves compatibility
     * with Microsoft Excel for names and
     * text containing non-ASCII characters.
     */
    const body = `\uFEFF${csv}`;

    /* ---------------------------------------------------------------------- */
    /* FILE NAME                                                              */
    /* ---------------------------------------------------------------------- */

    const identity =
      targetUser.displayName ||
      targetUser.username ||
      targetUser.email ||
      targetUser.id;

    const date = new Date().toISOString().slice(0, 10);

    const fileName = `audit-${safeFilePart(identity)}-${date}.csv`;

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return new NextResponse(body, {
      status: 200,

      headers: {
        "Content-Type": "text/csv; charset=utf-8",

        "Content-Disposition": `attachment; filename="${fileName}"`,

        "Cache-Control": "private, no-store, max-age=0",

        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("ACCESS AUDIT EXPORT ERROR:", error);

    return NextResponse.json(
      {
        message: "The audit history could not be exported.",
      },
      {
        status: 500,
      },
    );
  }
}
