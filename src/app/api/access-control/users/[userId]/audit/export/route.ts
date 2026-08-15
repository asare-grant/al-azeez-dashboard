// import {
//   auth,
// } from "@clerk/nextjs/server";

// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";

// import prisma from "@/lib/prisma";

// import {
//   buildAuditFilters,
//   buildUserAuditWhere,
// } from "@/lib/access-control/audit-query";

// /* -------------------------------------------------------------------------- */
// /*                               CONSTANTS                                    */
// /* -------------------------------------------------------------------------- */

// const MAX_EXPORT_RECORDS =
//   10_000;

// /* -------------------------------------------------------------------------- */
// /*                              CSV ESCAPING                                  */
// /* -------------------------------------------------------------------------- */

// function csvCell(
//   value:
//     unknown,
// ) {
//   if (
//     value ===
//       null ||
//     value ===
//       undefined
//   ) {
//     return "";
//   }

//   let text =
//     typeof value ===
//     "string"
//       ? value
//       : String(
//           value,
//         );

//   /*
//    * Spreadsheet formula injection protection.
//    *
//    * Excel/Sheets may interpret cells beginning
//    * with =, +, -, or @ as formulas.
//    */
//   if (
//     /^[=+\-@]/.test(
//       text,
//     )
//   ) {
//     text =
//       `'${text}`;
//   }

//   /*
//    * Standard RFC-style CSV escaping.
//    */
//   if (
//     /[",\r\n]/.test(
//       text,
//     )
//   ) {
//     return `"${text.replace(
//       /"/g,
//       '""',
//     )}"`;
//   }

//   return text;
// }

// /* -------------------------------------------------------------------------- */
// /*                           JSON METADATA                                    */
// /* -------------------------------------------------------------------------- */

// function serializeMetadata(
//   value:
//     unknown,
// ) {
//   if (
//     value ===
//       null ||
//     value ===
//       undefined
//   ) {
//     return "";
//   }

//   try {
//     return JSON.stringify(
//       value,
//     );
//   } catch {
//     return "";
//   }
// }

// /* -------------------------------------------------------------------------- */
// /*                            FILE NAME                                       */
// /* -------------------------------------------------------------------------- */

// function safeFilePart(
//   value:
//     string,
// ) {
//   const cleaned =
//     value
//       .trim()
//       .replace(
//         /[^a-zA-Z0-9_-]+/g,
//         "-",
//       )
//       .replace(
//         /-+/g,
//         "-",
//       )
//       .replace(
//         /^-+|-+$/g,
//         "",
//       );

//   return (
//     cleaned ||
//     "user"
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                             GET EXPORT                                     */
// /* -------------------------------------------------------------------------- */

// export async function GET(
//   request:
//     NextRequest,

//   context: {
//     params:
//       Promise<{
//         userId:
//           string;
//       }>;
//   },
// ) {
//   /* ------------------------------------------------------------------------ */
//   /* AUTHENTICATION + AUTHORIZATION                                           */
//   /* ------------------------------------------------------------------------ */

//   const {
//     userId:
//       actorId,

//     sessionClaims,
//   } =
//     await auth();

//   const actorRole = (
//     sessionClaims?.metadata as {
//       role?:
//         string;
//     } | undefined
//   )?.role;

//   /*
//    * During your current migration phase,
//    * Clerk's legacy admin role remains the
//    * administrative enforcement boundary.
//    */
//   if (
//     !actorId ||
//     actorRole !==
//       "admin"
//   ) {
//     return NextResponse.json(
//       {
//         message:
//           "Unauthorized.",
//       },
//       {
//         status:
//           403,
//       },
//     );
//   }

//   const {
//     userId,
//   } =
//     await context.params;

//   /* ------------------------------------------------------------------------ */
//   /* VERIFY TARGET USER                                                       */
//   /* ------------------------------------------------------------------------ */

//   const targetUser =
//     await prisma.userAccount.findUnique({
//       where: {
//         id:
//           userId,
//       },

//       select: {
//         id:
//           true,

//         displayName:
//           true,

//         username:
//           true,

//         email:
//           true,
//       },
//     });

//   if (
//     !targetUser
//   ) {
//     return NextResponse.json(
//       {
//         message:
//           "User account not found.",
//       },
//       {
//         status:
//           404,
//       },
//     );
//   }

//   /* ------------------------------------------------------------------------ */
//   /* FILTERS                                                                  */
//   /* ------------------------------------------------------------------------ */

//   const searchParams =
//     request.nextUrl.searchParams;

//   const auditAction =
//     searchParams.get(
//       "auditAction",
//     ) ??
//     "";

//   const auditActor =
//     searchParams.get(
//       "auditActor",
//     ) ??
//     "";

//   const auditFrom =
//     searchParams.get(
//       "auditFrom",
//     ) ??
//     "";

//   const auditTo =
//     searchParams.get(
//       "auditTo",
//     ) ??
//     "";

//   const filters =
//     buildAuditFilters({
//       action:
//         auditAction,

//       actor:
//         auditActor,

//       from:
//         auditFrom,

//       to:
//         auditTo,
//     });

//   const userAuditWhere =
//     buildUserAuditWhere({
//       userId:
//         targetUser.id,

//       filters,
//     });

//   /* ------------------------------------------------------------------------ */
//   /* EXPORT LIMIT                                                             */
//   /* ------------------------------------------------------------------------ */

//   const totalRecords =
//     await prisma.accessAuditLog.count({
//       where:
//         userAuditWhere,
//     });

//   if (
//     totalRecords >
//     MAX_EXPORT_RECORDS
//   ) {
//     return NextResponse.json(
//       {
//         message:
//           `This export contains ${totalRecords.toLocaleString()} records. Narrow the audit filters before exporting. The maximum export size is ${MAX_EXPORT_RECORDS.toLocaleString()} records.`,
//       },
//       {
//         status:
//           413,
//       },
//     );
//   }

//   /* ------------------------------------------------------------------------ */
//   /* FETCH COMPLETE FILTERED RESULT                                           */
//   /* ------------------------------------------------------------------------ */

//   const records =
//     await prisma.accessAuditLog.findMany({
//       where:
//         userAuditWhere,

//       orderBy: [
//         {
//           createdAt:
//             "desc",
//         },

//         {
//           id:
//             "desc",
//         },
//       ],

//       select: {
//         id:
//           true,

//         createdAt:
//           true,

//         action:
//           true,

//         actorId:
//           true,

//         actorName:
//           true,

//         actorRole:
//           true,

//         targetUserId:
//           true,

//         roleId:
//           true,

//         metadata:
//           true,

//         role: {
//           select: {
//             key:
//               true,

//             name:
//               true,

//             type:
//               true,
//           },
//         },
//       },
//     });

//   /* ------------------------------------------------------------------------ */
//   /* CSV                                                                      */
//   /* ------------------------------------------------------------------------ */

//   const headers = [
//     "Audit ID",
//     "Timestamp",
//     "Action",
//     "Actor Name",
//     "Actor ID",
//     "Actor Role",
//     "Target User",
//     "Role Name",
//     "Role Key",
//     "Role Type",
//     "Metadata",
//   ];

//   const rows =
//     records.map(
//       (
//         record,
//       ) => [
//         record.id,

//         record.createdAt.toISOString(),

//         record.action,

//         record.actorName ??
//           "",

//         record.actorId ??
//           "",

//         record.actorRole ??
//           "",

//         record.targetUserId,

//         record.role?.name ??
//           "",

//         record.role?.key ??
//           "",

//         record.role?.type ??
//           "",

//         serializeMetadata(
//           record.metadata,
//         ),
//       ],
//     );

//   const csv =
//     [
//       headers,
//       ...rows,
//     ]
//       .map(
//         (
//           row,
//         ) =>
//           row
//             .map(
//               csvCell,
//             )
//             .join(
//               ",",
//             ),
//       )
//       .join(
//         "\r\n",
//       );

//   /*
//    * UTF-8 BOM improves compatibility with
//    * Microsoft Excel when names contain
//    * non-ASCII characters.
//    */
//   const body =
//     `\uFEFF${csv}`;

//   /* ------------------------------------------------------------------------ */
//   /* FILE NAME                                                                */
//   /* ------------------------------------------------------------------------ */

//   const identity =
//     targetUser.displayName ||
//     targetUser.username ||
//     targetUser.email ||
//     targetUser.id;

//   const date =
//     new Date()
//       .toISOString()
//       .slice(
//         0,
//         10,
//       );

//   const fileName =
//     `audit-${safeFilePart(
//       identity,
//     )}-${date}.csv`;

//   /* ------------------------------------------------------------------------ */
//   /* RESPONSE                                                                 */
//   /* ------------------------------------------------------------------------ */

//   return new NextResponse(
//     body,
//     {
//       status:
//         200,

//       headers: {
//         "Content-Type":
//           "text/csv; charset=utf-8",

//         "Content-Disposition":
//           `attachment; filename="${fileName}"`,

//         "Cache-Control":
//           "private, no-store, max-age=0",

//         "X-Content-Type-Options":
//           "nosniff",
//       },
//     },
//   );
// }