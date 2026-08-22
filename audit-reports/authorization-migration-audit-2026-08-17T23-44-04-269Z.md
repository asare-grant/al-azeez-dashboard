# Authorization Migration Audit

Generated: 2026-08-17T23:44:04.302Z

## Executive Summary

- Files scanned: **725**
- Total findings: **872**
- Migration risk score: **3992**
- Good RBAC signals: **96**

## Severity Summary

| Severity | Count |
|---|---:|
| CRITICAL | 296 |
| HIGH | 154 |
| MEDIUM | 25 |
| REVIEW | 212 |
| INFO | 89 |
| GOOD | 96 |

## Migration Classes

| Class | Count |
|---|---:|
| MUTATION_RISK | 296 |
| LEGACY_ROLE | 127 |
| LEGACY_ROLE_GUARD | 107 |
| CENTRALIZED | 96 |
| AUTH_ONLY_REVIEW | 89 |
| ROLE_SCOPE_REVIEW | 84 |
| CLAIMS | 67 |
| LEGACY_ROUTE_GUARD | 4 |
| REDIRECT | 1 |
| PREFIX_POLICY | 1 |

## Priority Findings

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:455`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    451 |       await prisma.$transaction(
    452 |         async (
    453 |           tx,
    454 |         ) => {
>   455 |           await tx.accessReviewItem.update({
    456 |             where: {
    457 |               id:
    458 |                 item.id,
    459 |             },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:494`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    490 |               } satisfies Prisma.InputJsonValue,
    491 |             },
    492 |           });
    493 | 
>   494 |           await tx.accessAuditLog.create({
    495 |             data: {
    496 |               action:
    497 |                 AccessAuditAction.ACCESS_REVIEW_CERTIFIED,
    498 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:591`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    587 |         await prisma.$transaction(
    588 |           async (
    589 |             tx,
    590 |           ) => {
>   591 |             await tx.accessReviewItem.update({
    592 |               where: {
    593 |                 id:
    594 |                   item.id,
    595 |               },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:628`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    624 |                 } satisfies Prisma.InputJsonValue,
    625 |               },
    626 |             });
    627 | 
>   628 |             await tx.accessAuditLog.create({
    629 |               data: {
    630 |                 action:
    631 |                   AccessAuditAction.ACCESS_REVIEW_REVOKED,
    632 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:851`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    847 |           /*
    848 |            * AccessReviewItem.assignment uses onDelete: SetNull,
    849 |            * so the review history remains after revocation.
    850 |            */
>   851 |           await tx.userRoleAssignment.delete({
    852 |             where: {
    853 |               id:
    854 |                 assignment.id,
    855 |             },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:858`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    854 |                 assignment.id,
    855 |             },
    856 |           });
    857 | 
>   858 |           await tx.accessReviewItem.update({
    859 |             where: {
    860 |               id:
    861 |                 item.id,
    862 |             },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:900`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    896 | 
    897 |           /*
    898 |            * Existing RBAC audit event.
    899 |            */
>   900 |           await tx.accessAuditLog.create({
    901 |             data: {
    902 |               action:
    903 |                 AccessAuditAction.ROLE_REMOVED,
    904 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:956`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    952 | 
    953 |           /*
    954 |            * Formal review decision audit event.
    955 |            */
>   956 |           await tx.accessAuditLog.create({
    957 |             data: {
    958 |               action:
    959 |                 AccessAuditAction.ACCESS_REVIEW_REVOKED,
    960 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1114`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1110 |     await prisma.$transaction(
   1111 |       async (
   1112 |         tx,
   1113 |       ) => {
>  1114 |         await tx.userRoleAssignment.update({
   1115 |           where: {
   1116 |             id:
   1117 |               assignment.id,
   1118 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1126`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1122 |               nextExpiresAt,
   1123 |           },
   1124 |         });
   1125 | 
>  1126 |         await tx.accessReviewItem.update({
   1127 |           where: {
   1128 |             id:
   1129 |               item.id,
   1130 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1181`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1177 | 
   1178 |         /*
   1179 |          * Existing assignment change audit.
   1180 |          */
>  1181 |         await tx.accessAuditLog.create({
   1182 |           data: {
   1183 |             action:
   1184 |               AccessAuditAction.ROLE_ASSIGNMENT_UPDATED,
   1185 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1236`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1232 |             } satisfies Prisma.InputJsonValue,
   1233 |           },
   1234 |         });
   1235 | 
>  1236 |         await tx.accessAuditLog.create({
   1237 |           data: {
   1238 |             action:
   1239 |               AccessAuditAction.ACCESS_REVIEW_MODIFIED,
   1240 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:260`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    256 | 
    257 |       const completedAt = new Date();
    258 | 
    259 |       await prisma.$transaction(async (tx) => {
>   260 |         await tx.accessReviewCampaign.update({
    261 |           where: {
    262 |             id: campaign.id,
    263 |           },
    264 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:272`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    268 |             completedAt,
    269 |           },
    270 |         });
    271 | 
>   272 |         await tx.accessAuditLog.create({
    273 |           data: {
    274 |             action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_COMPLETED,
    275 | 
    276 |             actorId: actor.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:415`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    411 | 
    412 |     const cancelledAt = new Date();
    413 | 
    414 |     await prisma.$transaction(async (tx) => {
>   415 |       await tx.accessReviewCampaign.update({
    416 |         where: {
    417 |           id: campaign.id,
    418 |         },
    419 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:427`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    423 |           cancelledAt,
    424 |         },
    425 |       });
    426 | 
>   427 |       await tx.accessAuditLog.create({
    428 |         data: {
    429 |           action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CANCELLED,
    430 | 
    431 |           actorId: actor.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/start/route.ts:172`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    168 | 
    169 |     const startedAt = new Date();
    170 | 
    171 |     await prisma.$transaction(async (tx) => {
>   172 |       await tx.accessReviewCampaign.update({
    173 |         where: {
    174 |           id: campaign.id,
    175 |         },
    176 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/campaigns/[campaignId]/start/route.ts:184`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    180 |           startedAt,
    181 |         },
    182 |       });
    183 | 
>   184 |       await tx.accessAuditLog.create({
    185 |         data: {
    186 |           action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_STARTED,
    187 | 
    188 |           actorId: actor.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/reviews/reports/route.ts:246`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    242 |     /* ---------------------------------------------------------------------- */
    243 |     /* AUDIT EXPORT                                                           */
    244 |     /* ---------------------------------------------------------------------- */
    245 | 
>   246 |     await prisma.accessAuditLog.create({
    247 |       data: {
    248 |         action:
    249 |           AccessAuditAction.ACCESS_REVIEW_REPORT_EXPORTED,
    250 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/lifecycle/route.ts:282`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    278 |   updatedUser =
    279 |     await prisma.$transaction(
    280 |       async (tx) => {
    281 |         const updated =
>   282 |           await tx.userAccount.update({
    283 |             where: {
    284 |               id:
    285 |                 targetUserId,
    286 |             },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/lifecycle/route.ts:294`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    290 |                 nextStatus,
    291 |             },
    292 |           });
    293 | 
>   294 |         await tx.accessAuditLog.create({
    295 |           data: {
    296 |             action:
    297 |               auditAction,
    298 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/password-reset/route.ts:226`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    222 |     /* ---------------------------------------------------------------------- */
    223 |     /* PRE-ACTION AUDIT                                                       */
    224 |     /* ---------------------------------------------------------------------- */
    225 | 
>   226 |     const auditEntry = await prisma.accessAuditLog.create({
    227 |       data: {
    228 |         action: AccessAuditAction.PASSWORD_RESET_REQUIRED,
    229 | 
    230 |         actorId: actorAccount.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/password-reset/route.ts:293`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    289 |     /* ---------------------------------------------------------------------- */
    290 |     /* FINALIZE AUDIT                                                         */
    291 |     /* ---------------------------------------------------------------------- */
    292 | 
>   293 |     await prisma.accessAuditLog.update({
    294 |       where: {
    295 |         id: auditEntry.id,
    296 |       },
    297 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/password-reset/route.ts:359`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    355 |      * preserve that failure for investigation.
    356 |      */
    357 |     if (auditLogId) {
    358 |       try {
>   359 |         await prisma.accessAuditLog.update({
    360 |           where: {
    361 |             id: auditLogId,
    362 |           },
    363 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:195`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    191 |     /* TRANSACTION                                                            */
    192 |     /* ---------------------------------------------------------------------- */
    193 | 
    194 |     const result = await prisma.$transaction(async (tx) => {
>   195 |       const updatedUser = await tx.userAccount.update({
    196 |         where: {
    197 |           id: targetUser.id,
    198 |         },
    199 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:220`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    216 |        * ------------------------------------------------------------
    217 |        */
    218 | 
    219 |       if (legacyRole === "student") {
>   220 |         const domainUpdate = await tx.student.updateMany({
    221 |           where: {
    222 |             id: targetUser.id,
    223 |           },
    224 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:244`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    240 |        * ------------------------------------------------------------
    241 |        */
    242 | 
    243 |       if (legacyRole === "teacher") {
>   244 |         const domainUpdate = await tx.teacher.updateMany({
    245 |           where: {
    246 |             id: targetUser.id,
    247 |           },
    248 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:268`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    264 |        * ------------------------------------------------------------
    265 |        */
    266 | 
    267 |       if (legacyRole === "parent") {
>   268 |         const domainUpdate = await tx.parent.updateMany({
    269 |           where: {
    270 |             id: targetUser.id,
    271 |           },
    272 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:295`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    291 |        * ------------------------------------------------------------
    292 |        */
    293 | 
    294 |       if (legacyRole === "admin") {
>   295 |         const domainUpdate = await tx.admin.updateMany({
    296 |           where: {
    297 |             id: targetUser.id,
    298 |           },
    299 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:312`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    308 |       /* -------------------------------------------------------------------- */
    309 |       /* AUDIT                                                                */
    310 |       /* -------------------------------------------------------------------- */
    311 | 
>   312 |       await tx.accessAuditLog.create({
    313 |         data: {
    314 |           action: AccessAuditAction.USER_UPDATED,
    315 | 
    316 |           actorId: actorAccount.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:475`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    471 | 
    472 |     const assignment = await prisma.$transaction(async (tx) => {
    473 |       const created =
    474 |         renewingExpiredAssignment && existing
>   475 |           ? await tx.userRoleAssignment.update({
    476 |               where: {
    477 |                 id: existing.id,
    478 |               },
    479 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:490`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    486 | 
    487 |                 expiresAt,
    488 |               },
    489 |             })
>   490 |           : await tx.userRoleAssignment.create({
    491 |               data: {
    492 |                 userId: targetUser.id,
    493 | 
    494 |                 roleId: role.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:504`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    500 |                 expiresAt,
    501 |               },
    502 |             });
    503 | 
>   504 |       await tx.accessAuditLog.create({
    505 |         data: {
    506 |           action: AccessAuditAction.ROLE_ASSIGNED,
    507 | 
    508 |           targetUserId: targetUser.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:594`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `DELETE(`

```ts
    590 | /* ========================================================================== */
    591 | /* REMOVE ROLE                                                                */
    592 | /* ========================================================================== */
    593 | 
>   594 | export async function DELETE(request: Request, { params }: RouteContext) {
    595 |   try {
    596 |     const { userId: targetUserId } = await params;
    597 | 
    598 |     const body = (await request.json()) as RemoveRoleBody;
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:823`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    819 |     /* DELETE + AUDIT                                                         */
    820 |     /* ---------------------------------------------------------------------- */
    821 | 
    822 |     await prisma.$transaction(async (tx) => {
>   823 |       await tx.userRoleAssignment.delete({
    824 |         where: {
    825 |           id: assignment.id,
    826 |         },
    827 |       });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:829`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    825 |           id: assignment.id,
    826 |         },
    827 |       });
    828 | 
>   829 |       await tx.accessAuditLog.create({
    830 |         data: {
    831 |           action: AccessAuditAction.ROLE_REMOVED,
    832 | 
    833 |           targetUserId: targetUser.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:1318`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1314 |         async (
   1315 |           tx,
   1316 |         ) => {
   1317 |           const updated =
>  1318 |             await tx.userRoleAssignment.update({
   1319 |               where: {
   1320 |                 id:
   1321 |                   assignment.id,
   1322 |               },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/access-control/users/[userId]/roles/route.ts:1330`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1326 |                   nextExpiresAt,
   1327 |               },
   1328 |             });
   1329 | 
>  1330 |           await tx.accessAuditLog.create({
   1331 |             data: {
   1332 |               action:
   1333 |                 AccessAuditAction.ROLE_ASSIGNMENT_UPDATED,
   1334 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/attendance/create/route.ts:149`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    145 |       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    146 |     }
    147 |   }
    148 | 
>   149 |   const attendance = await prisma.attendance.create({
    150 |     data: { studentId, date: new Date(date), present, day },
    151 |   });
    152 | 
    153 |   return NextResponse.json(attendance, { status: 201 });
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/attendance/update/[id]/route.ts:94`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
     90 |         );
     91 |       }
     92 |     }
     93 | 
>    94 |     const updated = await prisma.attendance.update({
     95 |       where: { id: attendanceId },
     96 |       data: { present },
     97 |     });
     98 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/attendance/upsert/route.ts:194`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    190 |             present: true,
    191 |           },
    192 |         });
    193 | 
>   194 |         const attendance = await tx.attendance.upsert({
    195 |           where: {
    196 |             studentId_date: {
    197 |               studentId,
    198 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/bus-fee/add-student/route.ts:7`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
      3 | 
      4 | export async function POST(req: Request) {
      5 |   const body = await req.json();
      6 | 
>     7 |   const added = await prisma.busFeeStudent.upsert({
      8 |     where: {
      9 |       studentId: body.studentId,
     10 |     },
     11 |     update: {},
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/bus-fee/route.ts:36`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
     32 |   const body = await req.json();
     33 | 
     34 |   const date = new Date(body.date);
     35 | 
>    36 |   const saved = await prisma.busFeePayment.upsert({
     37 |     where: {
     38 |       studentId_date: {
     39 |         studentId: body.studentId,
     40 |         date,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/feeding-fee/add-student/route.ts:8`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
      4 | 
      5 | export async function POST(req: Request) {
      6 |   const body = await req.json();
      7 | 
>     8 |   const added = await prisma.feedingFeeStudent.upsert({
      9 |     where: {
     10 |       studentId: body.studentId,
     11 |     },
     12 |     update: {},
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/feeding-fee/route.ts:37`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
     33 |   const body = await req.json();
     34 | 
     35 |   const date = new Date(body.date);
     36 | 
>    37 |   const saved = await prisma.feedingFeePayment.upsert({
     38 |     where: {
     39 |       studentId_date: {
     40 |         studentId: body.studentId,
     41 |         date,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/app/api/generate-invoices/route.ts:196`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    192 |               "Student could not be resolved while generating the invoice.",
    193 |             );
    194 |           }
    195 | 
>   196 |           const feeMaster = await tx.feeMaster.create({
    197 |             data: {
    198 |               studentId: student.id,
    199 | 
    200 |               term,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/grading-scales/GradingScaleFilters.tsx:55`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     51 | 
     52 |     if (value) {
     53 |       params.set(name, value);
     54 |     } else {
>    55 |       params.delete(name);
     56 |     }
     57 | 
     58 |     params.delete("page");
     59 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/grading-scales/GradingScaleFilters.tsx:58`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     54 |     } else {
     55 |       params.delete(name);
     56 |     }
     57 | 
>    58 |     params.delete("page");
     59 | 
     60 |     router.push(
     61 |       params.toString()
     62 |         ? `${pathname}?${params.toString()}`
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/grading-scales/GradingScalePagination.tsx:48`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     44 |         searchParams.toString(),
     45 |       );
     46 | 
     47 |     if (nextPage === 1) {
>    48 |       params.delete("page");
     49 |     } else {
     50 |       params.set(
     51 |         "page",
     52 |         String(nextPage),
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/weightings/AcademicWeightingFilters.tsx:58`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     54 | 
     55 |     if (value) {
     56 |       params.set(name, value);
     57 |     } else {
>    58 |       params.delete(name);
     59 |     }
     60 | 
     61 |     params.delete("page");
     62 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/weightings/AcademicWeightingFilters.tsx:61`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     57 |     } else {
     58 |       params.delete(name);
     59 |     }
     60 | 
>    61 |     params.delete("page");
     62 | 
     63 |     router.push(
     64 |       params.toString()
     65 |         ? `${pathname}?${params.toString()}`
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/academic-settings/weightings/AcademicWeightingPagination.tsx:48`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     44 |         searchParams.toString(),
     45 |       );
     46 | 
     47 |     if (nextPage === 1) {
>    48 |       params.delete("page");
     49 |     } else {
     50 |       params.set(
     51 |         "page",
     52 |         String(nextPage),
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:217`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    213 |                   value={
    214 |                     weighting.academicYear
    215 |                   }
    216 |                   onChange={(value) =>
>   217 |                     update(
    218 |                       "academicYear",
    219 |                       value,
    220 |                     )
    221 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:246`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    242 |                     weighting.termId ||
    243 |                       "",
    244 |                   )}
    245 |                   onChange={(value) =>
>   246 |                     update(
    247 |                       "termId",
    248 |                       Number(value),
    249 |                     )
    250 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:281`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    277 |                     weighting.gradeId ||
    278 |                       "",
    279 |                   )}
    280 |                   onChange={(value) =>
>   281 |                     update(
    282 |                       "gradeId",
    283 |                       Number(value),
    284 |                     )
    285 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:310`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    306 |                     weighting.gradingScaleId ||
    307 |                       "",
    308 |                   )}
    309 |                   onChange={(value) =>
>   310 |                     update(
    311 |                       "gradingScaleId",
    312 |                       Number(value),
    313 |                     )
    314 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:354`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    350 |                     weighting.assignmentWeight
    351 |                   }
    352 |                   suffix="%"
    353 |                   onChange={(value) =>
>   354 |                     update(
    355 |                       "assignmentWeight",
    356 |                       value,
    357 |                     )
    358 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:368`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    364 |                     weighting.assessmentWeight
    365 |                   }
    366 |                   suffix="%"
    367 |                   onChange={(value) =>
>   368 |                     update(
    369 |                       "assessmentWeight",
    370 |                       value,
    371 |                     )
    372 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:382`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    378 |                     weighting.examWeight
    379 |                   }
    380 |                   suffix="%"
    381 |                   onChange={(value) =>
>   382 |                     update(
    383 |                       "examWeight",
    384 |                       value,
    385 |                     )
    386 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:397`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    393 |                   value={
    394 |                     weighting.assessmentScoreStrategy
    395 |                   }
    396 |                   onChange={(value) =>
>   397 |                     update(
    398 |                       "assessmentScoreStrategy",
    399 |                       value as AcademicWeightingInput["assessmentScoreStrategy"],
    400 |                     )
    401 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:423`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    419 |                     weighting.passMark
    420 |                   }
    421 |                   suffix="%"
    422 |                   onChange={(value) =>
>   423 |                     update(
    424 |                       "passMark",
    425 |                       value,
    426 |                     )
    427 |                   }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/components/academic-settings/weightings/AcademicWeightingStudio.tsx:434`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    430 | 
    431 |               <button
    432 |                 type="button"
    433 |                 onClick={() =>
>   434 |                   update(
    435 |                     "isActive",
    436 |                     !weighting.isActive,
    437 |                   )
    438 |                 }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/ComplianceReportExportButton.tsx:202`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `remove(`

```ts
    198 |       );
    199 | 
    200 |       anchor.click();
    201 | 
>   202 |       anchor.remove();
    203 | 
    204 |       URL.revokeObjectURL(
    205 |         url,
    206 |       );
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/PermissionMatrix.tsx:184`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    180 |           next.has(
    181 |             module,
    182 |           )
    183 |         ) {
>   184 |           next.delete(
    185 |             module,
    186 |           );
    187 |         } else {
    188 |           next.add(
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/RolePermissionSelector.tsx:167`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    163 |       next.add(
    164 |         permissionId,
    165 |       );
    166 |     } else {
>   167 |       next.delete(
    168 |         permissionId,
    169 |       );
    170 |     }
    171 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/RolePermissionSelector.tsx:208`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    204 |         next.add(
    205 |           id,
    206 |         );
    207 |       } else {
>   208 |         next.delete(
    209 |           id,
    210 |         );
    211 |       }
    212 |     }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/UserDirectoryFilters.tsx:98`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     94 |         !value ||
     95 |         value ===
     96 |           "ALL"
     97 |       ) {
>    98 |         params.delete(
     99 |           key,
    100 |         );
    101 |       } else {
    102 |         params.set(
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/UserDirectoryFilters.tsx:113`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    109 |     /*
    110 |      * Whenever filters change,
    111 |      * reset pagination.
    112 |      */
>   113 |     params.delete(
    114 |       "page",
    115 |     );
    116 | 
    117 |     const query =
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/access-control/UserDirectoryPagination.tsx:69`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     65 |         page,
     66 |       ),
     67 |     );
     68 |   } else {
>    69 |     params.delete(
     70 |       "page",
     71 |     );
     72 |   }
     73 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/assessments/command-centre/AssessmentCommandFilters.tsx:92`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     88 |     if (
     89 |       value === undefined ||
     90 |       value === ""
     91 |     ) {
>    92 |       params.delete(key);
     93 |     } else {
     94 |       params.set(key, value);
     95 |     }
     96 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/assessments/command-centre/AssessmentCommandFilters.tsx:97`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     93 |     } else {
     94 |       params.set(key, value);
     95 |     }
     96 | 
>    97 |     params.delete("page");
     98 | 
     99 |     router.push(
    100 |       `${pathname}?${params.toString()}`
    101 |     );
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/assessments/player/useAssessmentAutosave.ts:95`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     91 |         active.current.add(
     92 |           questionId
     93 |         );
     94 | 
>    95 |         queues.current.delete(
     96 |           questionId
     97 |         );
     98 | 
     99 |         onSaving(questionId);
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/assessments/player/useAssessmentAutosave.ts:109`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    105 |             clientMutationId:
    106 |               createClientMutationId(),
    107 |           });
    108 | 
>   109 |         active.current.delete(
    110 |           questionId
    111 |         );
    112 | 
    113 |         if (
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FilterDropdown.tsx:196`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    192 |   const updateFilter = (key: string, value: string) => {
    193 |     const params = new URLSearchParams(window.location.search);
    194 | 
    195 |     if (value) params.set(key, value);
>   196 |     else params.delete(key);
    197 | 
    198 |     params.set("page", "1"); // Reset pagination
    199 | 
    200 |     router.push(`${window.location.pathname}?${params.toString()}`, {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FilterDropdown.tsx:216`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    212 |     const params = new URLSearchParams(window.location.search);
    213 | 
    214 |     Object.entries(filters).forEach(([key, val]) => {
    215 |       if (val) params.set(key, val);
>   216 |       else params.delete(key);
    217 |     });
    218 | 
    219 |     params.set("page", "1");
    220 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FilterDropdown.tsx:233`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    229 |   const clearFilters = () => {
    230 |     setFilters({ student: "", grade: "", term: "" });
    231 | 
    232 |     const params = new URLSearchParams(window.location.search);
>   233 |     params.delete("student");
    234 |     params.delete("grade");
    235 |     params.delete("term");
    236 |     params.set("page", "1");
    237 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FilterDropdown.tsx:234`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    230 |     setFilters({ student: "", grade: "", term: "" });
    231 | 
    232 |     const params = new URLSearchParams(window.location.search);
    233 |     params.delete("student");
>   234 |     params.delete("grade");
    235 |     params.delete("term");
    236 |     params.set("page", "1");
    237 | 
    238 |     router.push(`${window.location.pathname}?${params.toString()}`, {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FilterDropdown.tsx:235`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    231 | 
    232 |     const params = new URLSearchParams(window.location.search);
    233 |     params.delete("student");
    234 |     params.delete("grade");
>   235 |     params.delete("term");
    236 |     params.set("page", "1");
    237 | 
    238 |     router.push(`${window.location.pathname}?${params.toString()}`, {
    239 |       scroll: false,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FinanceTableSearch.tsx:89`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     85 | 
     86 |     if (search.trim() !== "") {
     87 |       params.set("search", search);
     88 |     } else {
>    89 |       params.delete("search");
     90 |     }
     91 | 
     92 |     // Always reset to page 1
     93 |     params.set("page", "1");
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/FinanceTableSearch.tsx:111`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    107 |   const clearSearch = () => {
    108 |     setSearch("");
    109 | 
    110 |     const params = new URLSearchParams(window.location.search);
>   111 |     params.delete("search");
    112 |     params.set("page", "1");
    113 | 
    114 |     router.push(`${window.location.pathname}?${params.toString()}`, {
    115 |       scroll: false,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — ROLE_DERIVED_ROUTE

**File:** `src/components/NavbarClient.tsx:386`

**File type:** COMPONENT

**Migration class:** REDIRECT

**Match:** `\`/${role}\``

```ts
    382 | 
    383 |                 {/* ACCOUNT BUTTON */}
    384 | 
    385 |                 <Link
>   386 |                   href={`/${role}`}
    387 |                   className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-black text-slate-700 transition-all duration-200 hover:bg-slate-200 hover:text-slate-950"
    388 |                 >
    389 |                   <UserRound className="h-4 w-4" />
    390 | 
```

**Recommendation:** Route through /dashboard or getRoleDashboardPath() instead of constructing /${role}.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/bulk-review/ReportCardBulkReviewFilters.tsx:100`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     96 |         key,
     97 |         value,
     98 |       );
     99 |     } else {
>   100 |       params.delete(key);
    101 |     }
    102 | 
    103 |     params.delete("page");
    104 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/bulk-review/ReportCardBulkReviewFilters.tsx:103`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     99 |     } else {
    100 |       params.delete(key);
    101 |     }
    102 | 
>   103 |     params.delete("page");
    104 | 
    105 |     navigate(params);
    106 |   }
    107 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/bulk-review/ReportCardBulkReviewPagination.tsx:89`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     85 |         searchParams.toString(),
     86 |       );
     87 | 
     88 |     if (safePage === 1) {
>    89 |       params.delete("page");
     90 |     } else {
     91 |       params.set(
     92 |         "page",
     93 |         String(safePage),
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/bulk-review/ReportCardBulkReviewWorkspace.tsx:95`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     91 |     setSelectedIds((current) => {
     92 |       const next = new Set(current);
     93 | 
     94 |       if (next.has(reportCardId)) {
>    95 |         next.delete(reportCardId);
     96 |       } else {
     97 |         next.add(reportCardId);
     98 |       }
     99 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/bulk-review/ReportCardBulkReviewWorkspace.tsx:110`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    106 |       const next = new Set(current);
    107 | 
    108 |       if (allPageSelected) {
    109 |         for (const item of data.items) {
>   110 |           next.delete(item.id);
    111 |         }
    112 |       } else {
    113 |         for (const item of data.items) {
    114 |           next.add(item.id);
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/command-centre/ReportCardFilters.tsx:74`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     70 | 
     71 |     if (value) {
     72 |       params.set(key, value);
     73 |     } else {
>    74 |       params.delete(key);
     75 |     }
     76 | 
     77 |     params.delete("page");
     78 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/report-cards/command-centre/ReportCardFilters.tsx:77`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     73 |     } else {
     74 |       params.delete(key);
     75 |     }
     76 | 
>    77 |     params.delete("page");
     78 | 
     79 |     navigateWithParams(params);
     80 |   }
     81 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/results/command-centre/ResultsCommandCentreFilters.tsx:65`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     61 | 
     62 |     if (value) {
     63 |       params.set(name, value);
     64 |     } else {
>    65 |       params.delete(name);
     66 |     }
     67 | 
     68 |     params.delete("page");
     69 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/results/command-centre/ResultsCommandCentreFilters.tsx:68`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     64 |     } else {
     65 |       params.delete(name);
     66 |     }
     67 | 
>    68 |     params.delete("page");
     69 | 
     70 |     router.push(
     71 |       `${pathname}?${params.toString()}`,
     72 |     );
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/results/command-centre/ResultsCommandCentrePagination.tsx:50`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     46 |         searchParams.toString(),
     47 |       );
     48 | 
     49 |     if (nextPage === 1) {
>    50 |       params.delete("page");
     51 |     } else {
     52 |       params.set(
     53 |         "page",
     54 |         String(nextPage),
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/components/results/student-profile/StudentResultsProfileFilters.tsx:45`

**File type:** COMPONENT

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
     41 | 
     42 |     if (value) {
     43 |       params.set(name, value);
     44 |     } else {
>    45 |       params.delete(name);
     46 |     }
     47 | 
     48 |     router.push(
     49 |       `${pathname}?${params.toString()}`,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:132`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    128 |           throw new Error("DEFAULT_SCALE_MUST_BE_ACTIVE");
    129 |         }
    130 | 
    131 |         if (data.isDefault) {
>   132 |           await tx.gradingScale.updateMany({
    133 |             where: {
    134 |               isDefault: true,
    135 |             },
    136 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/academic-weightings/actions.ts:143`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    139 |             },
    140 |           });
    141 |         }
    142 | 
>   143 |         return tx.gradingScale.create({
    144 |           data: {
    145 |             name: data.name.trim(),
    146 | 
    147 |             description: data.description?.trim() || null,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:275`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    271 |           throw new Error("USED_SCALE_CANNOT_BE_ARCHIVED");
    272 |         }
    273 | 
    274 |         if (data.isDefault) {
>   275 |           await tx.gradingScale.updateMany({
    276 |             where: {
    277 |               isDefault: true,
    278 | 
    279 |               id: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/academic-weightings/actions.ts:295`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    291 |          * Replace boundaries as one atomic unit.
    292 |          * Either the complete scale is updated or
    293 |          * no part of it changes.
    294 |          */
>   295 |         await tx.gradeBoundary.deleteMany({
    296 |           where: {
    297 |             gradingScaleId: data.id,
    298 |           },
    299 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:301`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    297 |             gradingScaleId: data.id,
    298 |           },
    299 |         });
    300 | 
>   301 |         return tx.gradingScale.update({
    302 |           where: {
    303 |             id: data.id,
    304 |           },
    305 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:444`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    440 |         }
    441 | 
    442 |         const shouldRemoveDefault = parsed.data.status === "ARCHIVED";
    443 | 
>   444 |         return tx.gradingScale.update({
    445 |           where: {
    446 |             id: parsed.data.id,
    447 |           },
    448 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:566`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    562 |         if (scale._count.boundaries === 0) {
    563 |           throw new Error("DEFAULT_SCALE_REQUIRES_BOUNDARIES");
    564 |         }
    565 | 
>   566 |         await tx.gradingScale.updateMany({
    567 |           where: {
    568 |             isDefault: true,
    569 | 
    570 |             id: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:580`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    576 |             isDefault: false,
    577 |           },
    578 |         });
    579 | 
>   580 |         return tx.gradingScale.update({
    581 |           where: {
    582 |             id: scale.id,
    583 |           },
    584 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/academic-weightings/actions.ts:696`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    692 |          * GradeBoundary rows are deleted by
    693 |          * the cascade relation configured in
    694 |          * the Prisma schema.
    695 |          */
>   696 |         return tx.gradingScale.delete({
    697 |           where: {
    698 |             id: scale.id,
    699 |           },
    700 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/academic-weightings/actions.ts:982`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    978 |                 data.gradingScaleId,
    979 |             },
    980 |           );
    981 | 
>   982 |           return tx.academicWeighting.create({
    983 |             data: {
    984 |               academicYear:
    985 |                 data.academicYear,
    986 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:1128`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1124 |                 data.gradingScaleId,
   1125 |             },
   1126 |           );
   1127 | 
>  1128 |           return tx.academicWeighting.update({
   1129 |             where: {
   1130 |               id: data.id,
   1131 |             },
   1132 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/academic-weightings/actions.ts:1239`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1235 | 
   1236 |     await requireAcademicWeightingAdmin();
   1237 | 
   1238 |     const updated =
>  1239 |       await prisma.academicWeighting.update({
   1240 |         where: {
   1241 |           id: parsed.data.id,
   1242 |         },
   1243 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/academic-weightings/actions.ts:1317`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1313 | 
   1314 |     await requireAcademicWeightingAdmin();
   1315 | 
   1316 |     const deleted =
>  1317 |       await prisma.academicWeighting.delete({
   1318 |         where: {
   1319 |           id: parsed.data.id,
   1320 |         },
   1321 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/access-review-campaigns.ts:329`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    325 |   /* CREATE CAMPAIGN + SNAPSHOT ITEMS + AUDIT                                 */
    326 |   /* ------------------------------------------------------------------------ */
    327 | 
    328 |   const campaign = await prisma.$transaction(async (tx) => {
>   329 |     const createdCampaign = await tx.accessReviewCampaign.create({
    330 |       data: {
    331 |         name,
    332 | 
    333 |         description,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/access-review-campaigns.ts:355`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    351 |           "Super Administrator",
    352 |       },
    353 |     });
    354 | 
>   355 |     await tx.accessReviewItem.createMany({
    356 |       data: scopedAssignments.map((assignment) => ({
    357 |         campaignId: createdCampaign.id,
    358 | 
    359 |         assignmentId: assignment.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/access-review-campaigns.ts:385`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    381 |         source: assignment.source,
    382 |       })),
    383 |     });
    384 | 
>   385 |     await tx.accessAuditLog.create({
    386 |       data: {
    387 |         action: AccessAuditAction.ACCESS_REVIEW_CAMPAIGN_CREATED,
    388 | 
    389 |         actorId: actor.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/access-review-compliance-report.ts:1564`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1560 |   /* DOCUMENT                                                                 */
   1561 |   /* ------------------------------------------------------------------------ */
   1562 | 
   1563 |   const pdf =
>  1564 |     await PDFDocument.create();
   1565 | 
   1566 |   const regular =
   1567 |     await pdf.embedFont(
   1568 |       StandardFonts.Helvetica,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/profile-adapters/admin.ts:37`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     33 |       "A username is required for administrator accounts.",
     34 |     );
     35 |   }
     36 | 
>    37 |   await tx.admin.create({
     38 |     data: {
     39 |       id:
     40 |         userId,
     41 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/profile-adapters/parent.ts:198`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    194 |       "A parent with this username, email or phone already exists.",
    195 |     );
    196 |   }
    197 | 
>   198 |   await tx.parent.create({
    199 |     data: {
    200 |       id:
    201 |         userId,
    202 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/profile-adapters/student.ts:231`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    227 |   /* ---------------------------------------------------------------------- */
    228 |   /*                                CREATE                                  */
    229 |   /* ---------------------------------------------------------------------- */
    230 | 
>   231 |   await tx.student.create({
    232 |     data: {
    233 |       id:
    234 |         userId,
    235 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/profile-adapters/teacher.ts:162`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    158 |       "A teacher with this Teacher ID, username, email or phone already exists.",
    159 |     );
    160 |   }
    161 | 
>   162 |   await tx.teacher.create({
    163 |     data: {
    164 |       id:
    165 |         userId,
    166 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:245`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    241 |       const displayName = `${identity.firstName} ${identity.lastName}`.trim();
    242 | 
    243 |       /* USER ACCOUNT */
    244 | 
>   245 |       await tx.userAccount.create({
    246 |         data: {
    247 |           id: clerkUser.id,
    248 | 
    249 |           username: identity.username,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:298`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    294 |       });
    295 | 
    296 |       /* ROLE ASSIGNMENTS */
    297 | 
>   298 |       await tx.userRoleAssignment.createMany({
    299 |         data: roles.map((role) => ({
    300 |           userId: clerkUser.id,
    301 | 
    302 |           roleId: role.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:314`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    310 |       });
    311 | 
    312 |       /* USER CREATED AUDIT */
    313 | 
>   314 |       await tx.accessAuditLog.create({
    315 |         data: {
    316 |           action: "USER_CREATED",
    317 | 
    318 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:339`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    335 | 
    336 |       /* ROLE ASSIGNMENT AUDITS */
    337 | 
    338 |       if (roles.length > 0) {
>   339 |         await tx.accessAuditLog.createMany({
    340 |           data: roles.map((role) => ({
    341 |             action: "ROLE_ASSIGNED" as const,
    342 | 
    343 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:142`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    138 |       /* -------------------------------------------------------------- */
    139 |       /* ROLE                                                           */
    140 |       /* -------------------------------------------------------------- */
    141 | 
>   142 |       const createdRole = await tx.accessRole.create({
    143 |         data: {
    144 |           key,
    145 | 
    146 |           name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:171`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    167 |       /* PERMISSIONS                                                    */
    168 |       /* -------------------------------------------------------------- */
    169 | 
    170 |       if (validPermissions.length > 0) {
>   171 |         await tx.rolePermission.createMany({
    172 |           data: validPermissions.map((permission) => ({
    173 |             roleId: createdRole.id,
    174 | 
    175 |             permissionId: permission.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:188`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    184 |       /* -------------------------------------------------------------- */
    185 |       /* AUDIT                                                          */
    186 |       /* -------------------------------------------------------------- */
    187 | 
>   188 |       await tx.accessAuditLog.create({
    189 |         data: {
    190 |           action: "ROLE_CREATED",
    191 | 
    192 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:327`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    323 |       if (duplicate) {
    324 |         throw new Error("ROLE_ALREADY_EXISTS");
    325 |       }
    326 | 
>   327 |       const clonedRole = await tx.accessRole.create({
    328 |         data: {
    329 |           key,
    330 | 
    331 |           name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:354`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    350 |         },
    351 |       });
    352 | 
    353 |       if (sourceRole.permissions.length > 0) {
>   354 |         await tx.rolePermission.createMany({
    355 |           data: sourceRole.permissions.map((item) => ({
    356 |             roleId: clonedRole.id,
    357 | 
    358 |             permissionId: item.permissionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:365`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    361 |           })),
    362 |         });
    363 |       }
    364 | 
>   365 |       await tx.accessAuditLog.create({
    366 |         data: {
    367 |           action: "ROLE_CREATED",
    368 | 
    369 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/role-service.ts:486`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    482 |       if (duplicateName) {
    483 |         throw new Error("ROLE_NAME_EXISTS");
    484 |       }
    485 | 
>   486 |       await tx.accessRole.update({
    487 |         where: {
    488 |           id: roleId,
    489 |         },
    490 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:498`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    494 |           description: normalizeDescription(description),
    495 |         },
    496 |       });
    497 | 
>   498 |       await tx.accessAuditLog.create({
    499 |         data: {
    500 |           action: "ROLE_UPDATED",
    501 | 
    502 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/access-control/role-service.ts:631`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    627 | 
    628 |       const toRemove = Array.from(existing).filter((id) => !requested.has(id));
    629 | 
    630 |       if (toRemove.length > 0) {
>   631 |         await tx.rolePermission.deleteMany({
    632 |           where: {
    633 |             roleId,
    634 | 
    635 |             permissionId: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:643`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    639 |         });
    640 |       }
    641 | 
    642 |       if (toAdd.length > 0) {
>   643 |         await tx.rolePermission.createMany({
    644 |           data: toAdd.map((permissionId) => ({
    645 |             roleId,
    646 | 
    647 |             permissionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:660`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    656 |       /*
    657 |        * Write individual audit entries.
    658 |        */
    659 |       if (toAdd.length > 0) {
>   660 |         await tx.accessAuditLog.createMany({
    661 |           data: toAdd.map((permissionId) => ({
    662 |             action: "PERMISSION_ADDED" as const,
    663 | 
    664 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:678`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    674 |         });
    675 |       }
    676 | 
    677 |       if (toRemove.length > 0) {
>   678 |         await tx.accessAuditLog.createMany({
    679 |           data: toRemove.map((permissionId) => ({
    680 |             action: "PERMISSION_REMOVED" as const,
    681 | 
    682 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/role-service.ts:781`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    777 |        * We allow historical assignments to remain.
    778 |        * Once isActive=false, the authorization context
    779 |        * already ignores this role.
    780 |        */
>   781 |       await tx.accessRole.update({
    782 |         where: {
    783 |           id: role.id,
    784 |         },
    785 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:791`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    787 |           isActive: false,
    788 |         },
    789 |       });
    790 | 
>   791 |       await tx.accessAuditLog.create({
    792 |         data: {
    793 |           action: "ROLE_UPDATED",
    794 | 
    795 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/sync-current-user.ts:114`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    110 |           true,
    111 |       },
    112 |     });
    113 | 
>   114 |   await prisma.userAccount.upsert({
    115 |     where: {
    116 |       id:
    117 |         user.id,
    118 |     },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/sync-current-user.ts:261`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    257 | 
    258 |   if (
    259 |     !existingAssignment
    260 |   ) {
>   261 |     await prisma.userRoleAssignment.create({
    262 |       data: {
    263 |         userId:
    264 |           user.id,
    265 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/system-role-sync-core.ts:373`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    369 | 
    370 |     if (
    371 |       !existing
    372 |     ) {
>   373 |       await prisma.permission.create({
    374 |         data: {
    375 |           key,
    376 | 
    377 |           name:
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/system-role-sync-core.ts:414`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    410 | 
    411 |     if (
    412 |       changed
    413 |     ) {
>   414 |       await prisma.permission.update({
    415 |         where: {
    416 |           id:
    417 |             existing.id,
    418 |         },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/system-role-sync-core.ts:522`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    518 |   if (
    519 |     !existing
    520 |   ) {
    521 |     const created =
>   522 |       await prisma.accessRole.create({
    523 |         data: {
    524 |           key:
    525 |             normalizedRoleKey,
    526 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/system-role-sync-core.ts:608`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    604 |     };
    605 |   }
    606 | 
    607 |   const updated =
>   608 |     await prisma.accessRole.update({
    609 |       where: {
    610 |         id:
    611 |           existing.id,
    612 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/access-control/system-role-sync-core.ts:886`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    882 |       if (
    883 |         permissionIdsToRemove.length >
    884 |         0
    885 |       ) {
>   886 |         await tx.rolePermission.deleteMany({
    887 |           where: {
    888 |             roleId:
    889 |               role.id,
    890 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/system-role-sync-core.ts:903`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    899 |       if (
    900 |         permissionsToAdd.length >
    901 |         0
    902 |       ) {
>   903 |         await tx.rolePermission.createMany({
    904 |           data:
    905 |             permissionsToAdd.map(
    906 |               (
    907 |                 permission,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/access-control/system-role-sync-core.ts:1132`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
   1128 |       if (
   1129 |         permissionIdsToRemove.length >
   1130 |         0
   1131 |       ) {
>  1132 |         await tx.rolePermission.deleteMany({
   1133 |           where: {
   1134 |             roleId:
   1135 |               role.id,
   1136 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/system-role-sync-core.ts:1149`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
   1145 |       if (
   1146 |         permissionsToAdd.length >
   1147 |         0
   1148 |       ) {
>  1149 |         await tx.rolePermission.createMany({
   1150 |           data:
   1151 |             permissionsToAdd.map(
   1152 |               (
   1153 |                 permission,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:68`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     64 |   currentState: CurrentState,
     65 |   data: SubjectSchema,
     66 | ) => {
     67 |   try {
>    68 |     await prisma.subject.create({
     69 |       data: {
     70 |         name: data.name,
     71 |         teachers: {
     72 |           connect: data.teachers.map((teacherId) => ({ id: teacherId })),
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:90`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
     86 |   currentState: CurrentState,
     87 |   data: SubjectSchema,
     88 | ) => {
     89 |   try {
>    90 |     await prisma.subject.update({
     91 |       where: {
     92 |         id: data.id,
     93 |       },
     94 |       data: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:116`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    112 |   data: FormData,
    113 | ) => {
    114 |   const id = data.get("id") as string;
    115 |   try {
>   116 |     await prisma.subject.delete({
    117 |       where: {
    118 |         id: parseInt(id),
    119 |       },
    120 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:135`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    131 |   currentState: CurrentState,
    132 |   data: ClassSchema,
    133 | ) => {
    134 |   try {
>   135 |     await prisma.class.create({
    136 |       data,
    137 |     });
    138 | 
    139 |     // revalidatePath("/list/class");
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:155`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    151 |   if (!data.id) {
    152 |     return { success: false, error: true };
    153 |   }
    154 |   try {
>   155 |     await prisma.class.update({
    156 |       where: {
    157 |         id: data.id,
    158 |       },
    159 |       data,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:176`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    172 |   data: FormData,
    173 | ) => {
    174 |   const id = data.get("id") as string;
    175 |   try {
>   176 |     await prisma.class.delete({
    177 |       where: {
    178 |         id: parseInt(id),
    179 |       },
    180 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:205`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    201 |       lastName: data.surname,
    202 |       publicMetadata: { role: "teacher" },
    203 |     });
    204 | 
>   205 |     await prisma.teacher.create({
    206 |       data: {
    207 |         id: user.id,
    208 |         username: data.username,
    209 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:251`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    247 |       firstName: data.name,
    248 |       lastName: data.surname,
    249 |     });
    250 | 
>   251 |     await prisma.teacher.update({
    252 |       where: {
    253 |         id: data.id,
    254 |       },
    255 |       data: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:292`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    288 |     const client = await clerkClient();
    289 | 
    290 |     await client.users.deleteUser(id);
    291 | 
>   292 |     await prisma.teacher.delete({
    293 |       where: {
    294 |         id: id,
    295 |       },
    296 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:331`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    327 |       lastName: data.surname,
    328 |       publicMetadata: { role: "student" },
    329 |     });
    330 | 
>   331 |     await prisma.student.create({
    332 |       data: {
    333 |         id: user.id,
    334 |         username: data.username,
    335 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:377`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    373 |       firstName: data.name,
    374 |       lastName: data.surname,
    375 |     });
    376 | 
>   377 |     await prisma.student.update({
    378 |       where: {
    379 |         id: data.id,
    380 |       },
    381 |       data: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:418`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    414 |     const client = await clerkClient();
    415 | 
    416 |     await client.users.deleteUser(id);
    417 | 
>   418 |     await prisma.student.delete({
    419 |       where: {
    420 |         id: id,
    421 |       },
    422 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:451`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    447 |       publicMetadata: { role: "parent" },
    448 |     });
    449 | 
    450 |     // Create parent in Prisma
>   451 |     await prisma.parent.create({
    452 |       data: {
    453 |         id: user.id, // Clerk user id as parent id
    454 |         username: data.username,
    455 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:493`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    489 |       lastName: data.surname,
    490 |     });
    491 | 
    492 |     // Update Prisma parent record
>   493 |     await prisma.parent.update({
    494 |       where: { id: data.id },
    495 |       data: {
    496 |         username: data.username,
    497 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:533`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    529 |   try {
    530 |     const client = await clerkClient();
    531 | 
    532 |     // 1️⃣ Delete associated students first (if any)
>   533 |     await prisma.student.deleteMany({
    534 |       where: { parentId: id },
    535 |     });
    536 | 
    537 |     // 2️⃣ Delete parent from Prisma
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:538`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    534 |       where: { parentId: id },
    535 |     });
    536 | 
    537 |     // 2️⃣ Delete parent from Prisma
>   538 |     await prisma.parent.delete({
    539 |       where: { id },
    540 |     });
    541 | 
    542 |     // 3️⃣ Delete parent from Clerk
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:556`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    552 |       console.warn(
    553 |         "⚠️ Parent not found in Clerk. Continuing with Prisma deletion.",
    554 |       );
    555 |       try {
>   556 |         await prisma.parent.delete({ where: { id } });
    557 |         return { success: true, error: false };
    558 |       } catch (prismaErr) {
    559 |         console.error("❌ Error deleting parent from Prisma:", prismaErr);
    560 |       }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:623`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    619 |         error: true,
    620 |       };
    621 |     }
    622 | 
>   623 |     await prisma.exam.create({
    624 |       data: {
    625 |         title: data.title,
    626 | 
    627 |         startTime: data.startTime,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:707`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    703 |     }
    704 | 
    705 |     const academicYear = data.academicYear.trim();
    706 | 
>   707 |     await prisma.exam.update({
    708 |       where: {
    709 |         id: data.id,
    710 |       },
    711 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:759`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    755 |   const { userId, sessionClaims } = await auth();
    756 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    757 | 
    758 |   try {
>   759 |     await prisma.exam.delete({
    760 |       where: {
    761 |         id: parseInt(id),
    762 |         ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
    763 |       },
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:790`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    786 |     // Convert "08:30" → Date object (using arbitrary base date)
    787 |     const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    788 |     const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);
    789 | 
>   790 |     await prisma.lesson.create({
    791 |       data: {
    792 |         name: data.name,
    793 |         day: data.day,
    794 |         startTime,
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:834`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    830 |     // Both fields REQUIRED → Convert to Date always
    831 |     const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
    832 |     const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);
    833 | 
>   834 |     await prisma.lesson.update({
    835 |       where: { id: data.id },
    836 |       data: {
    837 |         name: data.name,
    838 |         day: data.day,
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:874`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    870 |     if (role === "teacher" && lesson.teacherId !== userId) {
    871 |       return { success: false, error: true };
    872 |     }
    873 | 
>   874 |     await prisma.lesson.delete({
    875 |       where: { id: parseInt(id) },
    876 |     });
    877 | 
    878 |     // revalidatePath("/list/lessons");
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:1044`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1040 |       /* -------------------------------------------------------------------- */
   1041 |       /* CREATE                                                               */
   1042 |       /* -------------------------------------------------------------------- */
   1043 | 
>  1044 |       await prisma.assignment.create({
   1045 |         data: {
   1046 |           title:
   1047 |             data.title,
   1048 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:1295`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1291 |       /* -------------------------------------------------------------------- */
   1292 |       /* UPDATE                                                               */
   1293 |       /* -------------------------------------------------------------------- */
   1294 | 
>  1295 |       await prisma.assignment.update({
   1296 |         where: {
   1297 |           id:
   1298 |             data.id,
   1299 |         },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1476`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1472 |       /* -------------------------------------------------------------------- */
   1473 |       /* DELETE                                                               */
   1474 |       /* -------------------------------------------------------------------- */
   1475 | 
>  1476 |       await prisma.assignment.delete({
   1477 |         where: {
   1478 |           id:
   1479 |             assignmentId,
   1480 |         },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:1910`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1906 |    * Keep NotificationEvent as historical/audit data,
   1907 |    * but hide deliveries that describe an obsolete
   1908 |    * event schedule.
   1909 |    */
>  1910 |   await tx.notification.updateMany({
   1911 |     where: {
   1912 |       archivedAt: null,
   1913 | 
   1914 |       event: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2004`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2000 |     }
   2001 | 
   2002 |     const event = await prisma.$transaction(
   2003 |       async (tx) => {
>  2004 |         const created = await tx.event.create({
   2005 |           data: {
   2006 |             title: values.title,
   2007 | 
   2008 |             description: values.description,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2223`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2219 |           existing.startTime.getTime() !== values.startTime.getTime() ||
   2220 |           existing.endTime.getTime() !== values.endTime.getTime() ||
   2221 |           existing.classId !== (values.classId ?? null);
   2222 | 
>  2223 |         const updated = await tx.event.update({
   2224 |           where: {
   2225 |             id: eventId,
   2226 |           },
   2227 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2458`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2454 | 
   2455 |           actorName: null,
   2456 |         });
   2457 | 
>  2458 |         await tx.event.delete({
   2459 |           where: {
   2460 |             id: eventId,
   2461 |           },
   2462 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2510`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2506 |   currentState: CurrentState,
   2507 |   data: AnnouncementSchema,
   2508 | ) => {
   2509 |   try {
>  2510 |     await prisma.announcement.create({
   2511 |       data: {
   2512 |         title: data.title,
   2513 |         description: data.description,
   2514 |         date: new Date(data.date), // NEW
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2536`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2532 |     return { success: false, error: true };
   2533 |   }
   2534 | 
   2535 |   try {
>  2536 |     await prisma.announcement.update({
   2537 |       where: { id: typeof data.id === "string" ? parseInt(data.id) : data.id },
   2538 |       data: {
   2539 |         title: data.title,
   2540 |         description: data.description,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2562`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2558 |   if (!id) {
   2559 |     return { success: false, error: true };
   2560 |   }
   2561 |   try {
>  2562 |     await prisma.announcement.delete({
   2563 |       where: { id: parseInt(id) },
   2564 |     });
   2565 |     // revalidatePath("/list/announcements");
   2566 |     return { success: true, error: false };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2583`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2579 |   currentState: any,
   2580 |   data: FeeCategorySchema,
   2581 | ) => {
   2582 |   try {
>  2583 |     await prisma.feeCategory.create({
   2584 |       data: { name: data.name },
   2585 |     });
   2586 | 
   2587 |     return { success: true, error: false };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2601`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2597 | ) => {
   2598 |   if (!data.id) return { success: false, error: true };
   2599 | 
   2600 |   try {
>  2601 |     await prisma.feeCategory.update({
   2602 |       where: { id: data.id },
   2603 |       data: { name: data.name },
   2604 |     });
   2605 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2618`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2614 |   const id = data.get("id") as string;
   2615 |   if (!id) return { success: false, error: true };
   2616 | 
   2617 |   try {
>  2618 |     await prisma.feeCategory.delete({ where: { id: parseInt(id) } });
   2619 |     return { success: true, error: false };
   2620 |   } catch (err) {
   2621 |     console.log("DELETE FEE CATEGORY ERROR:", err);
   2622 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2628`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2624 | };
   2625 | 
   2626 | export const createFeeType = async (currentState: any, data: FeeTypeSchema) => {
   2627 |   try {
>  2628 |     await prisma.feeType.create({
   2629 |       data: {
   2630 |         name: data.name,
   2631 |         categoryId: data.categoryId,
   2632 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2646`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2642 | export const updateFeeType = async (currentState: any, data: FeeTypeSchema) => {
   2643 |   if (!data.id) return { success: false, error: true };
   2644 | 
   2645 |   try {
>  2646 |     await prisma.feeType.update({
   2647 |       where: { id: data.id },
   2648 |       data: {
   2649 |         name: data.name,
   2650 |         categoryId: data.categoryId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2666`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2662 |   const id = data.get("id") as string;
   2663 |   if (!id) return { success: false, error: true };
   2664 | 
   2665 |   try {
>  2666 |     await prisma.feeType.delete({ where: { id: parseInt(id) } });
   2667 |     return { success: true, error: false };
   2668 |   } catch (err) {
   2669 |     console.log("DELETE FEE TYPE ERROR:", err);
   2670 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2679`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2675 |   currentState: any,
   2676 |   data: FeeStructureSchema,
   2677 | ) => {
   2678 |   try {
>  2679 |     await prisma.feeStructure.create({
   2680 |       data: {
   2681 |         amount: data.amount,
   2682 |         studentType: data.studentType,
   2683 |         boardingType: data.boardingType,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2704`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2700 | ) => {
   2701 |   if (!data.id) return { success: false, error: true };
   2702 | 
   2703 |   try {
>  2704 |     await prisma.feeStructure.update({
   2705 |       where: { id: data.id },
   2706 |       data: {
   2707 |         amount: data.amount,
   2708 |         studentType: data.studentType,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2728`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2724 |   const id = data.get("id") as string;
   2725 |   if (!id) return { success: false, error: true };
   2726 | 
   2727 |   try {
>  2728 |     await prisma.feeStructure.delete({ where: { id: parseInt(id) } });
   2729 |     return { success: true, error: false };
   2730 |   } catch (err) {
   2731 |     console.log("DELETE FEE STRUCTURE ERROR:", err);
   2732 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2741`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2737 |   currentState: any,
   2738 |   data: FeeMasterSchema,
   2739 | ) => {
   2740 |   try {
>  2741 |     await prisma.feeMaster.create({
   2742 |       data: {
   2743 |         studentId: data.studentId,
   2744 |         term: data.term,
   2745 |         academicYear: data.academicYear,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2765`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2761 | ) => {
   2762 |   if (!data.id) return { success: false, error: true };
   2763 | 
   2764 |   try {
>  2765 |     await prisma.feeMaster.update({
   2766 |       where: { id: data.id },
   2767 |       data: {
   2768 |         studentId: data.studentId,
   2769 |         term: data.term,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2788`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2784 |   const id = data.get("id") as string;
   2785 |   if (!id) return { success: false, error: true };
   2786 | 
   2787 |   try {
>  2788 |     await prisma.feeMaster.delete({ where: { id: parseInt(id) } });
   2789 |     return { success: true, error: false };
   2790 |   } catch (err) {
   2791 |     console.log("DELETE FEE MASTER ERROR:", err);
   2792 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2798`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2794 | };
   2795 | 
   2796 | export const createFee = async (currentState: any, data: FeeSchema) => {
   2797 |   try {
>  2798 |     await prisma.fee.create({
   2799 |       data: {
   2800 |         masterId: data.masterId,
   2801 |         structureId: data.structureId,
   2802 |         amount: data.amount,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2817`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2813 | export const updateFee = async (currentState: any, data: FeeSchema) => {
   2814 |   if (!data.id) return { success: false, error: true };
   2815 | 
   2816 |   try {
>  2817 |     await prisma.fee.update({
   2818 |       where: { id: data.id },
   2819 |       data: {
   2820 |         masterId: data.masterId,
   2821 |         structureId: data.structureId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2838`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2834 |   const id = data.get("id") as string;
   2835 |   if (!id) return { success: false, error: true };
   2836 | 
   2837 |   try {
>  2838 |     await prisma.fee.delete({ where: { id: parseInt(id) } });
   2839 |     return { success: true, error: false };
   2840 |   } catch (err) {
   2841 |     console.log("DELETE FEE ERROR:", err);
   2842 |     return { success: false, error: true };
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2943`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2939 |             )}.`,
   2940 |           );
   2941 |         }
   2942 | 
>  2943 |         const payment = await tx.feePayment.create({
   2944 |           data: {
   2945 |             masterId: data.masterId,
   2946 | 
   2947 |             amount: data.amount,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3057`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3053 | ) => {
   3054 |   if (!data.id) return { success: false, error: true };
   3055 | 
   3056 |   try {
>  3057 |     await prisma.feePayment.update({
   3058 |       where: { id: data.id },
   3059 |       data: {
   3060 |         masterId: data.masterId,
   3061 |         amount: data.amount,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3079`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3075 |   const id = data.get("id") as string;
   3076 |   if (!id) return { success: false, error: true };
   3077 | 
   3078 |   try {
>  3079 |     await prisma.feePayment.delete({ where: { id: parseInt(id) } });
   3080 |     return { success: true, error: false };
   3081 |   } catch (err) {
   3082 |     console.log("DELETE FEE PAYMENT ERROR:", err);
   3083 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3122`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3118 |   // 3️⃣ Calculate total
   3119 |   const totalAmount = feeStructures.reduce((sum, fs) => sum + fs.amount, 0);
   3120 | 
   3121 |   // 4️⃣ Create FeeMaster
>  3122 |   const feeMaster = await prisma.feeMaster.create({
   3123 |     data: {
   3124 |       studentId,
   3125 |       term,
   3126 |       academicYear,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3147`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3143 |   currentState: CurrentState,
   3144 |   data: AttendanceSchema,
   3145 | ) => {
   3146 |   try {
>  3147 |     await prisma.attendance.create({
   3148 |       data: {
   3149 |         date: data.date,
   3150 |         present: data.present,
   3151 |         day: data.day,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3170`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3166 | ) => {
   3167 |   if (!data.id) return { success: false, error: true };
   3168 | 
   3169 |   try {
>  3170 |     await prisma.attendance.update({
   3171 |       where: { id: data.id },
   3172 |       data: {
   3173 |         date: data.date,
   3174 |         present: data.present,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3345`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   3341 |          * The school has one current active
   3342 |          * term across the application.
   3343 |          */
   3344 |         if (data.isActive) {
>  3345 |           await tx.schoolTerm.updateMany({
   3346 |             where: {
   3347 |               isActive: true,
   3348 | 
   3349 |               ...(data.id
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3410`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3406 |           const termDateRangeChanged =
   3407 |             existing.startDate.getTime() !== startDate.getTime() ||
   3408 |             existing.endDate.getTime() !== endDate.getTime();
   3409 | 
>  3410 |           const updated = await tx.schoolTerm.update({
   3411 |             where: {
   3412 |               id: data.id,
   3413 |             },
   3414 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3508`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3504 |         /* ------------------------------------------------------------ */
   3505 |         /*                         CREATE                               */
   3506 |         /* ------------------------------------------------------------ */
   3507 | 
>  3508 |         const created = await tx.schoolTerm.create({
   3509 |           data: {
   3510 |             academicYearId: data.academicYearId,
   3511 | 
   3512 |             name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4038`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   4034 |        * Only one academic year should
   4035 |        * be active at a time.
   4036 |        */
   4037 |       if (data.isActive) {
>  4038 |         await tx.schoolAcademicYear.updateMany({
   4039 |           where: {
   4040 |             isActive: true,
   4041 |           },
   4042 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:4049`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   4045 |           },
   4046 |         });
   4047 |       }
   4048 | 
>  4049 |       return tx.schoolAcademicYear.create({
   4050 |         data: {
   4051 |           name,
   4052 | 
   4053 |           startDate: data.startDate,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4155`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   4151 |         throw new Error("The academic year could not be found.");
   4152 |       }
   4153 | 
   4154 |       if (data.isActive) {
>  4155 |         await tx.schoolAcademicYear.updateMany({
   4156 |           where: {
   4157 |             isActive: true,
   4158 | 
   4159 |             NOT: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4170`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   4166 |           },
   4167 |         });
   4168 |       }
   4169 | 
>  4170 |       return tx.schoolAcademicYear.update({
   4171 |         where: {
   4172 |           id: data.id,
   4173 |         },
   4174 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:215`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    211 |     const currentYear = now.getFullYear();
    212 | 
    213 |     const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;
    214 | 
>   215 |     const assessment = await prisma.assessment.create({
    216 |       data: {
    217 |         title: "Untitled Assessment",
    218 |         instructions: "",
    219 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:346`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    342 |         return assessmentFailure("You cannot use the selected lesson.");
    343 |       }
    344 |     }
    345 | 
>   346 |     const assessment = await prisma.assessment.update({
    347 |       where: {
    348 |         id: data.id,
    349 |       },
    350 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:530`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    526 |          *
    527 |          * AssessmentQuestion -> AssessmentOption cascades through
    528 |          * the Prisma relations defined in the schema.
    529 |          */
>   530 |         await tx.assessmentQuestion.deleteMany({
    531 |           where: {
    532 |             assessmentId: data.id,
    533 |           },
    534 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:536`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    532 |             assessmentId: data.id,
    533 |           },
    534 |         });
    535 | 
>   536 |         return tx.assessment.update({
    537 |           where: {
    538 |             id: data.id,
    539 |           },
    540 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:767`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    763 |     console.log("PUBLISH: updating status", nextStatus);
    764 | 
    765 |     const published = await prisma.$transaction(
    766 |       async (tx) => {
>   767 |         const updated = await tx.assessment.update({
    768 |           where: {
    769 |             id: assessment.id,
    770 |           },
    771 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:932`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    928 |         "This assessment cannot return to draft because students have already started it.",
    929 |       );
    930 |     }
    931 | 
>   932 |     await prisma.assessment.update({
    933 |       where: {
    934 |         id: assessmentId,
    935 |       },
    936 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:996`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    992 |     if (assessment.status === "ARCHIVED") {
    993 |       return assessmentFailure("Archived assessments cannot be closed.");
    994 |     }
    995 | 
>   996 |     await prisma.assessment.update({
    997 |       where: {
    998 |         id: assessmentId,
    999 |       },
   1000 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1078`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1074 |     if (!assessment) {
   1075 |       return assessmentFailure("The assessment could not be found.");
   1076 |     }
   1077 | 
>  1078 |     await prisma.assessment.update({
   1079 |       where: {
   1080 |         id: assessmentId,
   1081 |       },
   1082 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:1165`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1161 |     const now = new Date();
   1162 | 
   1163 |     const newDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
   1164 | 
>  1165 |     const duplicate = await prisma.assessment.create({
   1166 |       data: {
   1167 |         title: `${source.title} — Copy`,
   1168 |         instructions: source.instructions,
   1169 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:1305`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1301 |         "This assessment has student records and cannot be permanently deleted.",
   1302 |       );
   1303 |     }
   1304 | 
>  1305 |     await prisma.assessment.delete({
   1306 |       where: {
   1307 |         id: assessmentId,
   1308 |       },
   1309 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:1393`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
   1389 |         if (existing.status !== "DRAFT" || existing._count.attempts > 0) {
   1390 |           throw new Error("PUBLISHED_ASSESSMENT_LOCKED");
   1391 |         }
   1392 | 
>  1393 |         await tx.assessmentQuestion.deleteMany({
   1394 |           where: {
   1395 |             assessmentId: input.id,
   1396 |           },
   1397 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1399`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1395 |             assessmentId: input.id,
   1396 |           },
   1397 |         });
   1398 | 
>  1399 |         return tx.assessment.update({
   1400 |           where: {
   1401 |             id: input.id,
   1402 |           },
   1403 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1648`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1644 |           )
   1645 |           .map((attempt) => attempt.id);
   1646 | 
   1647 |         if (staleAttemptIds.length > 0) {
>  1648 |           await tx.assessmentAttempt.updateMany({
   1649 |             where: {
   1650 |               id: {
   1651 |                 in: staleAttemptIds,
   1652 |               },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:1681`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1677 | 
   1678 |           durationMinutes: assessment.durationMinutes,
   1679 |         });
   1680 | 
>  1681 |         const attempt = await tx.assessmentAttempt.create({
   1682 |           data: {
   1683 |             assessmentId,
   1684 |             studentId: userId,
   1685 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1891`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
   1887 |           );
   1888 |         }
   1889 |       }
   1890 | 
>  1891 |       const answer = await tx.assessmentAnswer.upsert({
   1892 |         where: {
   1893 |           attemptId_questionId: {
   1894 |             attemptId,
   1895 |             questionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1940`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1936 |           updatedAt: true,
   1937 |         },
   1938 |       });
   1939 | 
>  1940 |       await tx.assessmentAttempt.update({
   1941 |         where: {
   1942 |           id: attemptId,
   1943 |         },
   1944 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2213`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   2209 |         /*
   2210 |          * Atomically claim the attempt for grading.
   2211 |          * Only an IN_PROGRESS attempt can be claimed.
   2212 |          */
>  2213 |         const lockResult = await tx.assessmentAttempt.updateMany({
   2214 |           where: {
   2215 |             id: attemptId,
   2216 |             assessmentId,
   2217 |             studentId: userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2340`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2336 |           /*
   2337 |            * Return the attempt to active because
   2338 |            * validation failed before grading.
   2339 |            */
>  2340 |           await tx.assessmentAttempt.update({
   2341 |             where: {
   2342 |               id: attemptId,
   2343 |             },
   2344 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2366`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2362 |          * Update existing answer rows with marking.
   2363 |          */
   2364 |         for (const gradedAnswer of grading.gradedAnswers) {
   2365 |           if (gradedAnswer.answerId) {
>  2366 |             await tx.assessmentAnswer.update({
   2367 |               where: {
   2368 |                 id: gradedAnswer.answerId,
   2369 |               },
   2370 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:2382`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2378 |             /*
   2379 |              * Create an explicit unanswered record.
   2380 |              * This makes review and analytics easier.
   2381 |              */
>  2382 |             await tx.assessmentAnswer.create({
   2383 |               data: {
   2384 |                 attemptId,
   2385 |                 questionId: gradedAnswer.questionId,
   2386 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2416`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2412 | 
   2413 |         const finalStatus: AssessmentAttemptStatus =
   2414 |           submissionMode === "AUTO" ? "AUTO_SUBMITTED" : "SUBMITTED";
   2415 | 
>  2416 |         await tx.assessmentAttempt.update({
   2417 |           where: {
   2418 |             id: attemptId,
   2419 |           },
   2420 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2712`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2708 |         }
   2709 | 
   2710 |         const reviewedAt = new Date();
   2711 | 
>  2712 |         const updatedAttempt = await tx.assessmentAttempt.update({
   2713 |           where: {
   2714 |             id: attemptId,
   2715 |           },
   2716 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2902`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2898 |           "Backtracking is disabled.",
   2899 |         );
   2900 |       }
   2901 | 
>  2902 |       const updated = await tx.assessmentAttempt.update({
   2903 |         where: {
   2904 |           id: attemptId,
   2905 |         },
   2906 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/attempt-status.ts:11`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
      7 | } = {}) {
      8 |   const now = new Date();
      9 | 
     10 |   const result =
>    11 |     await prisma.assessmentAttempt.updateMany({
     12 |       where: {
     13 |         status: "IN_PROGRESS",
     14 | 
     15 |         expiresAt: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/audit.ts:32`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     28 | export async function createAssessmentAudit(
     29 |   client: AuditClient,
     30 |   input: CreateAssessmentAuditInput
     31 | ) {
>    32 |   return client.assessmentAuditLog.create({
     33 |     data: {
     34 |       action: input.action,
     35 | 
     36 |       actorId: input.actorId ?? null,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/grading-service.ts:428`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    424 |            *
    425 |            * A retry with the same token may
    426 |            * continue. A different token cannot.
    427 |            */
>   428 |           const lockResult = await tx.assessmentAttempt.updateMany({
    429 |             where: {
    430 |               id: attemptId,
    431 | 
    432 |               assessmentId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/grading-service.ts:563`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    559 |             submissionMode === "MANUAL" &&
    560 |             !attempt.assessment.allowUnanswered &&
    561 |             unansweredCount > 0
    562 |           ) {
>   563 |             await tx.assessmentAttempt.update({
    564 |               where: {
    565 |                 id: attemptId,
    566 |               },
    567 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/grading-service.ts:606`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    602 |            * existing answer.
    603 |            */
    604 |           for (const gradedAnswer of grading.gradedAnswers) {
    605 |             if (gradedAnswer.answerId) {
>   606 |               await tx.assessmentAnswer.update({
    607 |                 where: {
    608 |                   id: gradedAnswer.answerId,
    609 |                 },
    610 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/grading-service.ts:625`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    621 |             /*
    622 |              * Create explicit unanswered rows for
    623 |              * review and analytics.
    624 |              */
>   625 |             await tx.assessmentAnswer.create({
    626 |               data: {
    627 |                 attemptId,
    628 | 
    629 |                 questionId: gradedAnswer.questionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/grading-service.ts:668`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    664 |           /*
    665 |            * Store the final attempt totals and
    666 |            * clear temporary submission data.
    667 |            */
>   668 |           await tx.assessmentAttempt.update({
    669 |             where: {
    670 |               id: attemptId,
    671 |             },
    672 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/notifications.ts:42`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
     38 |       ? `${assessmentTitle} has been scheduled. Check the opening date before starting.`
     39 |       : `${assessmentTitle} is now available for you to complete.`;
     40 | 
     41 |   const result =
>    42 |     await client.notification.createMany({
     43 |       data:
     44 |         studentIds.map(
     45 |           (studentId) => ({
     46 |             title:
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/rate-limit.ts:49`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
     45 |           if (
     46 |             !existing ||
     47 |             existing.expiresAt <= now
     48 |           ) {
>    49 |             return tx.assessmentRateLimit.upsert({
     50 |               where: {
     51 |                 key,
     52 |               },
     53 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/rate-limit.ts:69`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
     65 |               },
     66 |             });
     67 |           }
     68 | 
>    69 |           return tx.assessmentRateLimit.update({
     70 |             where: {
     71 |               key,
     72 |             },
     73 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/recover-stale-submissions.ts:11`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
      7 |         10 * 60 * 1000
      8 |     );
      9 | 
     10 |   const result =
>    11 |     await prisma.assessmentAttempt.updateMany({
     12 |       where: {
     13 |         status: "SUBMITTING",
     14 | 
     15 |         submissionStartedAt: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/status.ts:8`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
      4 |   const now = new Date();
      5 | 
      6 |   const [published, closed] =
      7 |     await prisma.$transaction([
>     8 |       prisma.assessment.updateMany({
      9 |         where: {
     10 |           status: "SCHEDULED",
     11 | 
     12 |           startDate: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/status.ts:26`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
     22 |           status: "PUBLISHED",
     23 |         },
     24 |       }),
     25 | 
>    26 |       prisma.assessment.updateMany({
     27 |         where: {
     28 |           status: {
     29 |             in: [
     30 |               "SCHEDULED",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/finance/fee-account-service.ts:200`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    196 | 
    197 |       tx,
    198 |     });
    199 | 
>   200 |   await tx.feeMaster.update({
    201 |     where: {
    202 |       id:
    203 |         feeMasterId,
    204 |     },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:66`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
     62 |     };
     63 |   }
     64 | 
     65 |   const result =
>    66 |     await prisma.notification.updateMany({
     67 |       where: {
     68 |         id:
     69 |           notificationId,
     70 | 
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:124`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    120 |   const now =
    121 |     new Date();
    122 | 
    123 |   const result =
>   124 |     await prisma.notification.updateMany({
    125 |       where: {
    126 |         recipientId:
    127 |           userId,
    128 | 
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:181`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    177 |       success: false,
    178 |     };
    179 |   }
    180 | 
>   181 |   await prisma.notification.updateMany({
    182 |     where: {
    183 |       recipientId:
    184 |         userId,
    185 | 
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:243`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    239 |     };
    240 |   }
    241 | 
    242 |   const result =
>   243 |     await prisma.notification.updateMany({
    244 |       where: {
    245 |         id:
    246 |           notificationId,
    247 | 
```

**Recommendation:** Add an explicit server-side permission guard before this mutation.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:356`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    352 |   ) {
    353 |     const now =
    354 |       new Date();
    355 | 
>   356 |     await prisma.notification.update({
    357 |       where: {
    358 |         id:
    359 |           notification.id,
    360 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:448`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    444 |         "Critical system notifications cannot be disabled.",
    445 |     };
    446 |   }
    447 | 
>   448 |   await prisma.notificationPreference.upsert({
    449 |     where: {
    450 |       userId_category: {
    451 |         userId,
    452 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:624`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    620 |       };
    621 |     }
    622 |   }
    623 | 
>   624 |   await prisma.notificationUserSettings.upsert({
    625 |     where: {
    626 |       userId,
    627 |     },
    628 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:103`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     99 |     /*                         CREATE RUN LOG                             */
    100 |     /* ------------------------------------------------------------------ */
    101 | 
    102 |     const schedulerRun =
>   103 |       await prisma.notificationSchedulerRun.create({
    104 |         data: {
    105 |           trigger:
    106 | 
    107 |             trigger
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:169`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    165 |       const scannerStartedAt =
    166 |         new Date();
    167 | 
    168 |       const scannerLog =
>   169 |         await prisma.notificationSchedulerScannerRun.create({
    170 |           data: {
    171 |             runId:
    172 |               schedulerRun.id,
    173 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:205`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    201 |         const durationMs =
    202 |           completedAt.getTime() -
    203 |           scannerStartedAt.getTime();
    204 | 
>   205 |         await prisma.notificationSchedulerScannerRun.update({
    206 |           where: {
    207 |             id:
    208 |               scannerLog.id,
    209 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:263`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    259 |          * Record this scanner failure and CONTINUE.
    260 |          *
    261 |          * This is the core failure-isolation behaviour.
    262 |          */
>   263 |         await prisma.notificationSchedulerScannerRun.update({
    264 |           where: {
    265 |             id:
    266 |               scannerLog.id,
    267 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:324`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    320 |             0
    321 |           ? "PARTIAL"
    322 |           : "FAILED";
    323 | 
>   324 |     await prisma.notificationSchedulerRun.update({
    325 |       where: {
    326 |         id:
    327 |           schedulerRun.id,
    328 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/scheduled/run-scheduled-notifications.ts:393`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    389 |     if (
    390 |       runId
    391 |     ) {
    392 |       try {
>   393 |         await prisma.notificationSchedulerRun.update({
    394 |           where: {
    395 |             id:
    396 |               runId,
    397 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/notifications/scheduled/scheduler-lock.ts:69`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
     65 |   /*
     66 |    * First try to claim an existing expired lease.
     67 |    */
     68 |   const reclaimed =
>    69 |     await prisma.notificationSchedulerLock.updateMany({
     70 |       where: {
     71 |         key:
     72 |           LOCK_KEY,
     73 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/scheduled/scheduler-lock.ts:109`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    105 |    * The unique primary key protects against
    106 |    * both acquiring the lock.
    107 |    */
    108 |   try {
>   109 |     await prisma.notificationSchedulerLock.create({
    110 |       data: {
    111 |         key:
    112 |           LOCK_KEY,
    113 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/notifications/scheduled/scheduler-lock.ts:163`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    159 |    * token is part of the condition so an old
    160 |    * worker can never release a newer worker's
    161 |    * lease after its original lease expired.
    162 |    */
>   163 |   await prisma.notificationSchedulerLock.deleteMany({
    164 |     where: {
    165 |       key,
    166 | 
    167 |       token,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/service.ts:220`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    216 |    * No event needs to be created because there
    217 |    * will be no deliveries.
    218 |    */
    219 |   if (recipients.length === 0) {
>   220 |     await db.notificationDispatchAudit.create({
    221 |       data: {
    222 |         eventId: null,
    223 | 
    224 |         type: input.type,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/service.ts:294`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    290 |     : null;
    291 | 
    292 |   const event = existingEvent
    293 |     ? existingEvent
>   294 |     : await db.notificationEvent.create({
    295 |         data: {
    296 |           type: input.type,
    297 | 
    298 |           category: input.category,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/service.ts:340`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    336 |    *
    337 |    * so retrying the same logical dispatch does
    338 |    * not create duplicate user deliveries.
    339 |    */
>   340 |   const delivery = await db.notification.createMany({
    341 |     data: recipients.map((recipient) => ({
    342 |       eventId: event.id,
    343 | 
    344 |       recipientId: recipient.recipientId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/notifications/service.ts:353`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    349 |     skipDuplicates: true,
    350 |   });
    351 | 
    352 |   
>   353 |   await db.notificationDispatchAudit.create({
    354 |   data: {
    355 |     eventId:
    356 |       event.id,
    357 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/pdf/generateFeeStatement.ts:294`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    290 |   const receiptWidth = 226; // 80mm POS receipt width
    291 |   const baseHeight = 360 + lineItems.length * 22 + payments.length * 24;
    292 |   const receiptHeight = Math.max(baseHeight, 520);
    293 | 
>   294 |   const pdfDoc = await PDFDocument.create();
    295 |   const page = pdfDoc.addPage([receiptWidth, receiptHeight]);
    296 | 
    297 |   const font = await pdfDoc.embedFont(StandardFonts.Courier);
    298 |   const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/actions.ts:290`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    286 |         /* -------------------------------------------------------------- */
    287 |         /*                     ATOMIC PUBLICATION CLAIM                   */
    288 |         /* -------------------------------------------------------------- */
    289 | 
>   290 |         const claimed = await tx.reportCard.updateMany({
    291 |           where: {
    292 |             id: reportCard.id,
    293 | 
    294 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/actions.ts:480`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    476 |         if (existing.status === "ARCHIVED") {
    477 |           throw new Error("REPORT_ALREADY_ARCHIVED");
    478 |         }
    479 | 
>   480 |         const archived = await tx.reportCard.updateMany({
    481 |           where: {
    482 |             id: reportCardId,
    483 | 
    484 |             status: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/actions.ts:665`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    661 |     const now = new Date();
    662 | 
    663 |     const bulkPublication = await prisma.$transaction(
    664 |       async (tx) => {
>   665 |         const published = await tx.reportCard.updateMany({
    666 |           where: {
    667 |             id: {
    668 |               in: eligibleIds,
    669 |             },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/report-cards/activity-service.ts:39`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     35 |   description,
     36 |   note,
     37 |   metadata,
     38 | }: CreateReportCardActivityInput) {
>    39 |   return tx.reportCardActivity.create({
     40 |     data: {
     41 |       reportCardId,
     42 | 
     43 |       type,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/bulk-review-actions.ts:217`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    213 | 
    214 |           continue;
    215 |         }
    216 | 
>   217 |         const updateResult = await tx.reportCard.updateMany({
    218 |           where: {
    219 |             id: reportCardId,
    220 | 
    221 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/bulk-review-actions.ts:419`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    415 |           });
    416 | 
    417 |           continue;
    418 |         }
>   419 |         const updateResult = await tx.reportCard.updateMany({
    420 |           where: {
    421 |             id: reportCardId,
    422 | 
    423 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/bulk-review-actions.ts:621`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    617 | 
    618 |           continue;
    619 |         }
    620 | 
>   621 |         const updateResult = await tx.reportCard.updateMany({
    622 |           where: {
    623 |             id: reportCardId,
    624 | 
    625 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/generation-service.ts:1006`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1002 |         /*                           UPDATE DRAFT                            */
   1003 |         /* ---------------------------------------------------------------- */
   1004 | 
   1005 |         if (existing) {
>  1006 |           const updateResult = await tx.reportCard.updateMany({
   1007 |             where: {
   1008 |               id: existing.id,
   1009 | 
   1010 |               status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/report-cards/generation-service.ts:1078`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
   1074 | 
   1075 |             continue;
   1076 |           }
   1077 | 
>  1078 |           await tx.reportCardSubject.deleteMany({
   1079 |             where: {
   1080 |               reportCardId: existing.id,
   1081 |             },
   1082 |           });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/report-cards/generation-service.ts:1085`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
   1081 |             },
   1082 |           });
   1083 | 
   1084 |           if (studentReport.subjects.length > 0) {
>  1085 |             await tx.reportCardSubject.createMany({
   1086 |               data: studentReport.subjects.map((subject) =>
   1087 |                 buildSubjectCreateManyData({
   1088 |                   reportCardId: existing.id,
   1089 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/report-cards/generation-service.ts:1169`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1165 |         /* ---------------------------------------------------------------- */
   1166 | 
   1167 |         const metrics = deriveStudentMetrics(studentReport);
   1168 | 
>  1169 |         const createdCard = await tx.reportCard.create({
   1170 |           data: {
   1171 |             student: {
   1172 |               connect: {
   1173 |                 id: studentId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/invalidation-service.ts:186`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    182 |    * - fresh
    183 |    *
    184 |    * when the mutation occurs.
    185 |    */
>   186 |   const updateResult = await tx.reportCard.updateMany({
    187 |     where: {
    188 |       id: reportCard.id,
    189 | 
    190 |       status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/persistence-service.ts:65`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
     61 |     generatedById,
     62 |   });
     63 | 
     64 |   const reportCard = existing
>    65 |     ? await tx.reportCard.update({
     66 |         where: {
     67 |           id: existing.id,
     68 |         },
     69 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/report-cards/persistence-service.ts:116`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    112 |         select: {
    113 |           id: true,
    114 |         },
    115 |       })
>   116 |     : await tx.reportCard.create({
    117 |         data: {
    118 |           ...reportData,
    119 | 
    120 |           status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/report-cards/persistence-service.ts:142`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    138 |   /*
    139 |    * Subject snapshots are replaced only while the
    140 |    * parent report card remains a draft.
    141 |    */
>   142 |   await tx.reportCardSubject.deleteMany({
    143 |     where: {
    144 |       reportCardId: reportCard.id,
    145 |     },
    146 |   });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/report-cards/persistence-service.ts:149`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    145 |     },
    146 |   });
    147 | 
    148 |   if (report.subjects.length > 0) {
>   149 |     await tx.reportCardSubject.createMany({
    150 |       data: report.subjects.map((subject) =>
    151 |         mapReportCardSubjectData({
    152 |           reportCardId: reportCard.id,
    153 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:288`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    284 |         /*
    285 |          * Repeat authorization, lifecycle state
    286 |          * and version in the actual write.
    287 |          */
>   288 |         const updated = await tx.reportCard.updateMany({
    289 |           where: {
    290 |             ...managerWhere,
    291 | 
    292 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:511`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    507 |         }
    508 | 
    509 |         const now = new Date();
    510 | 
>   511 |         const updated = await tx.reportCard.updateMany({
    512 |           where: {
    513 |             ...managerWhere,
    514 | 
    515 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:695`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    691 |               "Changes cannot be requested for this report card.",
    692 |           );
    693 |         }
    694 | 
>   695 |         const updated = await tx.reportCard.updateMany({
    696 |           where: {
    697 |             id: reportCard.id,
    698 | 
    699 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:876`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    872 |         }
    873 | 
    874 |         const now = new Date();
    875 | 
>   876 |         const updated = await tx.reportCard.updateMany({
    877 |           where: {
    878 |             id: reportCard.id,
    879 | 
    880 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:1072`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1068 |         if (!reportCard) {
   1069 |           throw new Error("REPORT_NOT_APPROVED");
   1070 |         }
   1071 | 
>  1072 |         const updated = await tx.reportCard.updateMany({
   1073 |           where: {
   1074 |             id: reportCard.id,
   1075 | 
   1076 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/results/assessment-result-sync.ts:363`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    359 |   /*                           RESULT UPSERT                                */
    360 |   /* ---------------------------------------------------------------------- */
    361 | 
    362 |   const result =
>   363 |     await tx.result.upsert({
    364 |       where: {
    365 |         assessmentAttemptId:
    366 |           assessmentAttemptId,
    367 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/results/assignment-result-sync.ts:341`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    337 |   );
    338 | 
    339 | const result =
    340 |   resultId !== undefined
>   341 |     ? await tx.result.update({
    342 |         where: {
    343 |           id: resultId,
    344 |         },
    345 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/results/assignment-result-sync.ts:366`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    362 |         select: {
    363 |           id: true,
    364 |         },
    365 |       })
>   366 |     : await tx.result.create({
    367 |         data: {
    368 |           studentId:
    369 |             normalizedStudentId,
    370 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/results/delete-result-service.ts:273`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
    269 |   /* ---------------------------------------------------------------------- */
    270 |   /*                            DELETE RESULT                               */
    271 |   /* ---------------------------------------------------------------------- */
    272 | 
>   273 |   await tx.result.delete({
    274 |     where: {
    275 |       id: result.id,
    276 |     },
    277 |   });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/results/exam-result-sync.ts:423`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    419 | 
    420 |   const result =
    421 |     resultId !==
    422 |     undefined
>   423 |       ? await tx.result.update({
    424 |           where: {
    425 |             id:
    426 |               resultId,
    427 |           },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/results/exam-result-sync.ts:450`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    446 |           select: {
    447 |             id: true,
    448 |           },
    449 |         })
>   450 |       : await tx.result.create({
    451 |           data: {
    452 |             studentId:
    453 |               normalizedStudentId,
    454 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:100`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
     96 |   const now =
     97 |     new Date();
     98 | 
     99 |   const claimed =
>   100 |     await prisma.whatsAppDelivery.updateMany({
    101 |       where: {
    102 |         id:
    103 |           deliveryId,
    104 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:235`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    231 | 
    232 |   if (
    233 |     !delivery.feeMaster
    234 |   ) {
>   235 |     await prisma.whatsAppDelivery.update({
    236 |       where: {
    237 |         id:
    238 |           delivery.id,
    239 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:271`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    267 | 
    268 |   if (
    269 |     !parent
    270 |   ) {
>   271 |     await prisma.whatsAppDelivery.update({
    272 |       where: {
    273 |         id:
    274 |           delivery.id,
    275 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:319`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    315 |   if (
    316 |     summary.balance <=
    317 |     0
    318 |   ) {
>   319 |     await prisma.whatsAppDelivery.update({
    320 |       where: {
    321 |         id:
    322 |           delivery.id,
    323 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:372`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    368 |         balance:
    369 |           summary.balance,
    370 |       });
    371 | 
>   372 |     await prisma.whatsAppDelivery.update({
    373 |       where: {
    374 |         id:
    375 |           delivery.id,
    376 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:418`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    414 | 
    415 |     if (
    416 |       finalAttempt
    417 |     ) {
>   418 |       await prisma.whatsAppDelivery.update({
    419 |         where: {
    420 |           id:
    421 |             delivery.id,
    422 |         },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/whatsapp/process-queue.ts:456`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    452 |             delivery.attemptCount,
    453 |           ),
    454 |       );
    455 | 
>   456 |     await prisma.whatsAppDelivery.update({
    457 |       where: {
    458 |         id:
    459 |           delivery.id,
    460 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/whatsapp/queue.ts:37`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
     33 | 
     34 |   const templateName =
     35 |     process.env.WHATSAPP_FEE_REMINDER_TEMPLATE ?? "school_fee_balance_reminder";
     36 | 
>    37 |   return tx.whatsAppDelivery.create({
     38 |     data: {
     39 |       recipientId,
     40 | 
     41 |       recipientRole: "parent",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/scripts/clear-old-notifications.ts:5`

**File type:** OTHER

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
      1 | import prisma from "@/lib/prisma";
      2 | 
      3 | async function main() {
      4 |   const result =
>     5 |     await prisma.notification.deleteMany();
      6 | 
      7 |   console.log(
      8 |     `Deleted ${result.count} legacy notifications.`,
      9 |   );
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/dashboard/page.tsx:61`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
     57 |           }
     58 |         | undefined
     59 |     )?.role ??
     60 |     (
>    61 |       sessionClaims
     62 |         ?.metadata as
     63 |         | {
     64 |             role?:
     65 |               unknown;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/announcements/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 |   // ✅ Unwrap searchParams (Next.js 15 change)
     19 |   const searchParams = await props.searchParams;
     20 | 
     21 |   const { userId, sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 |   const currentUserId = userId;
     24 | 
     25 |   // ✅ Table Columns
     26 |   const columns = [
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/announcements/page.tsx:30`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     26 |   const columns = [
     27 |     { header: "Title", accessor: "title" },
     28 |     { header: "Class", accessor: "class" },
     29 |     { header: "Date", accessor: "date", className: "hidden md:table-cell" },
>    30 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     31 |   ];
     32 | 
     33 |   // ✅ Row Renderer
     34 |   const renderRow = (item: AnnouncementList) => (
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/announcements/page.tsx:44`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     40 |       <td>{item.class?.name || "-"}</td>
     41 |       <td className="hidden md:table-cell">
     42 |         {new Intl.DateTimeFormat("en-US").format(item.date)}
     43 |       </td>
>    44 |       {role === "admin" && (
     45 |         <td>
     46 |           <div className="flex items-center gap-2">
     47 |             <FormContainer table="announcement" type="update" data={item} />
     48 |             <FormContainer table="announcement" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/announcements/page.tsx:82`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     78 |     student: { students: { some: { id: currentUserId! } } },
     79 |     parent: { students: { some: { parentId: currentUserId! } } },
     80 |   };
     81 | 
>    82 |   if (role === "admin") {
     83 |     // Admins see all announcements
     84 |     query.OR = undefined;
     85 |   } else {
     86 |     query.OR = [
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/announcements/page.tsx:120`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    116 |             </button>
    117 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    118 |               <Image src="/sort.png" alt="" width={14} height={14} />
    119 |             </button>
>   120 |             {role === "admin" && (
    121 |               <FormContainer table="announcement" type="create" />
    122 |             )}
    123 |           </div>
    124 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/assignments/page.tsx:28`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     24 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     25 |   const searchParams = await props.searchParams;
     26 | 
     27 |   const { userId, sessionClaims } = await auth();
>    28 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     29 |   const currentUserId = userId;
     30 | 
     31 |   const columns = [
     32 |     { header: "Subject Name", accessor: "name" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/assignments/page.tsx:36`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     32 |     { header: "Subject Name", accessor: "name" },
     33 |     { header: "Class", accessor: "class" },
     34 |     { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
     35 |     { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
>    36 |     ...(role === "admin" || role === "teacher"
     37 |       ? [{ header: "Actions", accessor: "action" }]
     38 |       : []),
     39 |   ];
     40 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/assignments/page.tsx:56`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     52 |         {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
     53 |       </td>
     54 |       <td>
     55 |         <div className="flex items-center gap-2">
>    56 |           {(role === "admin" || role === "teacher") && (
     57 |             <>
     58 |               <FormModal table="assignment" type="update" data={item} />
     59 |               <FormModal table="assignment" type="delete" id={item.id} />
     60 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/assignments/page.tsx:151`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    147 |             </button>
    148 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    149 |               <Image src="/sort.png" alt="" width={14} height={14} />
    150 |             </button>
>   151 |             {(role === "admin" || role === "teacher") && (
    152 |               <FormModal table="assignment" type="create" />
    153 |             )}
    154 |           </div>
    155 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/attendance/page.tsx:11`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
      7 | const AttendanceListPage = async () => {
      8 |   const { sessionClaims, userId } = await auth();
      9 | 
     10 |   const role =
>    11 |     (sessionClaims?.metadata as { role?: "admin" | "teacher" })?.role ??
     12 |     "teacher";
     13 | 
     14 |   /**
     15 |    * Fetch classes
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/classes/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     19 |   const searchParams = await props.searchParams;
     20 | 
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   const columns = [
     25 |     { header: "Class Name", accessor: "name" },
     26 |     { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/classes/page.tsx:29`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     25 |     { header: "Class Name", accessor: "name" },
     26 |     { header: "Capacity", accessor: "capacity", className: "hidden md:table-cell" },
     27 |     { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
     28 |     { header: "Supervisor", accessor: "supervisor", className: "hidden md:table-cell" },
>    29 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     30 |   ];
     31 | 
     32 |   const renderRow = (item: ClassList) => (
     33 |     <tr
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/classes/page.tsx:47`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     43 |         : "No Supervisor"}
     44 |     </td>
     45 |       <td>
     46 |         <div className="flex items-center gap-2">
>    47 |           {role === "admin" && (
     48 |             <>
     49 |               <FormContainer table="class" type="update" data={item} />
     50 |               <FormContainer table="class" type="delete" id={item.id} />
     51 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/classes/page.tsx:106`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    102 |             </button>
    103 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    104 |               <Image src="/sort.png" alt="" width={14} height={14} />
    105 |             </button>
>   106 |             {role === "admin" && <FormContainer table="class" type="create" />}
    107 |           </div>
    108 |         </div>
    109 |       </div>
    110 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/events/page.tsx:27`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     23 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     24 |   const searchParams = await props.searchParams;
     25 | 
     26 |   const { userId, sessionClaims } = await auth();
>    27 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     28 |   const currentUserId = userId;
     29 | 
     30 |   // ✅ Define table columns
     31 |   const columns = [
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/events/page.tsx:45`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     41 |       header: "End Time",
     42 |       accessor: "endTime",
     43 |       className: "hidden md:table-cell",
     44 |     },
>    45 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     46 |   ];
     47 | 
     48 |   // ✅ Row Renderer
     49 |   const renderRow = (item: EventList) => (
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/events/page.tsx:79`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     75 |           minute: "2-digit",
     76 |           hour12: false,
     77 |         })}
     78 |       </td>
>    79 |       {role === "admin" && (
     80 |         <td>
     81 |           <div className="flex items-center gap-2">
     82 |             <FormContainer table="event" type="update" data={item} />
     83 |             <FormContainer table="event" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/events/page.tsx:169`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    165 |             </button>
    166 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    167 |               <Image src="/sort.png" alt="" width={14} height={14} />
    168 |             </button>
>   169 |             {role === "admin" && <FormContainer table="event" type="create" />}
    170 |           </div>
    171 |         </div>
    172 |       </div>
    173 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/exams/page.tsx:28`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     24 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     25 |   const searchParams = await props.searchParams;
     26 | 
     27 |   const { userId, sessionClaims } = await auth();
>    28 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     29 |   const currentUserId = userId;
     30 | 
     31 |   // ✅ Define table columns
     32 |   const columns = [
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/exams/page.tsx:37`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     33 |     { header: "Subject Name", accessor: "name" },
     34 |     { header: "Class", accessor: "class" },
     35 |     { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
     36 |     { header: "Date", accessor: "date", className: "hidden md:table-cell" },
>    37 |     ...(role === "admin" || role === "teacher"
     38 |       ? [{ header: "Actions", accessor: "action" }]
     39 |       : []),
     40 |   ];
     41 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/exams/page.tsx:58`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     54 |         {new Intl.DateTimeFormat("en-US").format(item.startTime)}
     55 |       </td>
     56 |       <td>
     57 |         <div className="flex items-center gap-2">
>    58 |           {(role === "admin" || role === "teacher") && (
     59 |             <>
     60 |               <FormContainer table="exam" type="update" data={item} />
     61 |               <FormContainer table="exam" type="delete" id={item.id} />
     62 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/exams/page.tsx:146`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    142 |             </button>
    143 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    144 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    145 |             </button>
>   146 |             {(role === "admin" || role === "teacher") && (
    147 |               <FormContainer table="exam" type="create" />
    148 |             )}
    149 |           </div>
    150 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/fee-category/page.tsx:19`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     15 | }) {
     16 |   const searchParams = await props.searchParams;
     17 | 
     18 |   const { sessionClaims } = await auth();
>    19 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     20 | 
     21 |   const columns = [
     22 |     { header: "Category Name", accessor: "name" },
     23 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-category/page.tsx:23`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     19 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     20 | 
     21 |   const columns = [
     22 |     { header: "Category Name", accessor: "name" },
>    23 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     24 |   ];
     25 | 
     26 |   const renderRow = (item: FeeCategory) => (
     27 |     <tr
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-category/page.tsx:34`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     30 |     >
     31 |       <td className="p-4">{item.name}</td>
     32 |       <td>
     33 |         <div className="flex items-center gap-2">
>    34 |           {role === "admin" && (
     35 |             <>
     36 |               <FormContainer table="fee-category" type="update" data={item} />
     37 |               <FormContainer table="fee-category" type="delete" id={item.id} />
     38 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-category/page.tsx:80`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     76 |             </button>
     77 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
     78 |               <Image src="/sort.png" alt="" width={14} height={14} />
     79 |             </button>
>    80 |             {role === "admin" && (
     81 |               <FormContainer table="fee-category" type="create" />
     82 |             )}
     83 |           </div>
     84 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/fee-master/page.tsx:24`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     20 |   const searchParams = await props.searchParams;
     21 | 
     22 |   // Server-side auth
     23 |   const { sessionClaims } = await auth();
>    24 |   const role = (sessionClaims?.metadata as { role?: string })?.role || "";
     25 | 
     26 |   // pagination + searcH
     27 |   const { page, search } = searchParams;
     28 |   const p = page ? parseInt(page as string, 10) : 1;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/fee-structure/page.tsx:27`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     23 |   const searchParams = await props.searchParams;
     24 | 
     25 |   // Fetch Clerk auth on server
     26 |   const { sessionClaims } = await auth();
>    27 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     28 | 
     29 |   // Pagination & filters
     30 |   const { page, classId, gradeId, typeId } = searchParams;
     31 |   const p = page ? parseInt(page as string) : 1;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-structure/page.tsx:65`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     61 |       accessor: "boardingType",
     62 |       className: "hidden lg:table-cell",
     63 |     },
     64 |     { header: "Amount", accessor: "amount" },
>    65 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     66 |   ];
     67 | 
     68 |   // Row renderer
     69 |   const renderRow = (item: FeeStructureList) => (
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-structure/page.tsx:79`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     75 |       <td className="hidden lg:table-cell">{item.type?.name}</td>
     76 |       <td className="hidden lg:table-cell">{item.studentType}</td>
     77 |       <td className="hidden lg:table-cell">{item.boardingType}</td>
     78 |       <td>{item.amount.toFixed(2)}</td>
>    79 |       {role === "admin" && (
     80 |         <td>
     81 |           <div className="flex items-center gap-2">
     82 |             <FormContainer table="fee-structure" type="update" data={item} />
     83 |             <FormContainer table="fee-structure" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-structure/page.tsx:106`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    102 |             </button>
    103 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    104 |               <Image src="/sort.png" alt="" width={14} height={14} />
    105 |             </button>
>   106 |             {role === "admin" && (
    107 |               <FormContainer table="fee-structure" type="create" />
    108 |             )}
    109 |           </div>
    110 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/fee-type/page.tsx:20`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     16 |   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
     17 | }) {
     18 |   const searchParams = await props.searchParams;
     19 |   const { sessionClaims } = await auth();
>    20 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     21 | 
     22 |   const columns = [
     23 |     { header: "Fee Type", accessor: "name" },
     24 |     {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-type/page.tsx:29`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     25 |       header: "Category",
     26 |       accessor: "category",
     27 |       className: "hidden md:table-cell",
     28 |     },
>    29 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     30 |   ];
     31 | 
     32 |   const renderRow = (item: FeeTypeList) => (
     33 |     <tr
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-type/page.tsx:43`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     39 |         {item.category?.name ?? "No Category"}
     40 |       </td>
     41 |       <td>
     42 |         <div className="flex items-center gap-2">
>    43 |           {role === "admin" && (
     44 |             <>
     45 |               <FormContainer table="fee-type" type="update" data={item} />
     46 |               <FormContainer table="fee-type" type="delete" id={item.id} />
     47 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee-type/page.tsx:91`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     87 |             </button>
     88 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
     89 |               <Image src="/sort.png" alt="" width={14} height={14} />
     90 |             </button>
>    91 |             {role === "admin" && (
     92 |               <FormContainer table="fee-type" type="create" />
     93 |             )}
     94 |           </div>
     95 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/fee/page.tsx:27`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     23 |   const searchParams = await props.searchParams;
     24 | 
     25 |   // server-side auth
     26 |   const { sessionClaims } = await auth();
>    27 |   const role = (sessionClaims?.metadata as { role?: string })?.role || "";
     28 | 
     29 |   // pagination
     30 |   const { page, search } = searchParams;
     31 |   const p = page ? parseInt(page as string, 10) : 1;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee/page.tsx:115`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    111 |       accessor: "academicYear",
    112 |       className: "hidden lg:table-cell",
    113 |     },
    114 |     { header: "Amount", accessor: "amount" },
>   115 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
    116 |   ];
    117 | 
    118 |   // render row
    119 |   const renderRow = (item: FeeListItem) => (
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee/page.tsx:133`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    129 |       </td>
    130 |       <td className="hidden md:table-cell">{item.master.term}</td>
    131 |       <td className="hidden lg:table-cell">{item.master.academicYear}</td>
    132 |       <td>{item.amount.toFixed(2)}</td>
>   133 |       {role === "admin" && (
    134 |         <td className="p-2 flex gap-2">
    135 |           <FormContainer table="fee" type="update" data={item} />
    136 |           <FormContainer table="fee" type="delete" id={item.id} />
    137 |         </td>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/fee/page.tsx:156`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    152 |             </button>
    153 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    154 |               <Image src="/sort.png" alt="" width={14} height={14} />
    155 |             </button>
>   156 |             {role === "admin" && <FormContainer table="fee" type="create" />}
    157 |           </div>
    158 |         </div>
    159 |       </div>
    160 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/FinanceDashboardPage/page.tsx:29`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     25 |   const p = page ? Number(page) : 1;
     26 |   const perPage = limit ? Number(limit) : 10; // default 10
     27 | 
     28 |   const { sessionClaims } = await auth();
>    29 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     30 | 
     31 |   // -----------------------------
     32 |   // BUILD DYNAMIC QUERY
     33 |   // -----------------------------
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/FinanceDashboardPage/page.tsx:135`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    131 |       accessor: "balance",
    132 |       className: "hidden lg:table-cell",
    133 |     },
    134 |     { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
>   135 |     ...(role === "admin"
    136 |       ? [
    137 |           {
    138 |             header: "Actions",
    139 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/FinanceDashboardPage/page.tsx:185`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    181 |           >
    182 |             {status}
    183 |           </span>
    184 |         </td>
>   185 |         {role === "admin" && (
    186 |           <td className="p-2">
    187 |             <div className="flex items-center gap-2">
    188 |               {/* ADD PAYMENT */}
    189 |               <FormContainer
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/lessons/page.tsx:26`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     22 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     23 |   const searchParams = await props.searchParams;
     24 | 
     25 |   const { sessionClaims } = await auth();
>    26 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     27 | 
     28 |   // ✅ Table columns
     29 |   const columns = [
     30 |     { header: "Subject Name", accessor: "name" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/lessons/page.tsx:33`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     29 |   const columns = [
     30 |     { header: "Subject Name", accessor: "name" },
     31 |     { header: "Class", accessor: "class" },
     32 |     { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
>    33 |     ...(role === "admin"
     34 |       ? [{ header: "Actions", accessor: "action" }]
     35 |       : []),
     36 |   ];
     37 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/lessons/page.tsx:51`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     47 |         {item.teacher.name + " " + item.teacher.surname}
     48 |       </td>
     49 |       <td>
     50 |         <div className="flex items-center gap-2">
>    51 |           {role === "admin" && (
     52 |             <>
     53 |               <FormContainer table="lesson" type="update" data={item} />
     54 |               <FormContainer table="lesson" type="delete" id={item.id} />
     55 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/lessons/page.tsx:119`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    115 |             </button>
    116 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    117 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    118 |             </button>
>   119 |             {role === "admin" && <FormContainer table="lesson" type="create" />}
    120 |           </div>
    121 |         </div>
    122 |       </div>
    123 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/parents/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     19 |   const searchParams = await props.searchParams;
     20 | 
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   // ✅ Define table columns
     25 |   const columns = [
     26 |     { header: "Info", accessor: "info" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/parents/page.tsx:30`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     26 |     { header: "Info", accessor: "info" },
     27 |     { header: "Student Names", accessor: "students", className: "hidden md:table-cell" },
     28 |     { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
     29 |     { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
>    30 |     ...(role === "admin"
     31 |       ? [{ header: "Actions", accessor: "action" }]
     32 |       : []),
     33 |   ];
     34 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/parents/page.tsx:54`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     50 |       <td className="hidden md:table-cell">{item.phone}</td>
     51 |       <td className="hidden md:table-cell">{item.address}</td>
     52 |       <td>
     53 |         <div className="flex items-center gap-2">
>    54 |           {role === "admin" && (
     55 |             <>
     56 |               <FormContainer table="parent" type="update" data={item} />
     57 |               <FormContainer table="parent" type="delete" id={item.id} />
     58 |             </>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/parents/page.tsx:110`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    106 |             </button>
    107 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    108 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    109 |             </button>
>   110 |             {role === "admin" && <FormContainer table="parent" type="create" />}
    111 |           </div>
    112 |         </div>
    113 |       </div>
    114 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/report-cards/[reportCardId]/page.tsx:38`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     34 | 
     35 |   const { sessionClaims } = await auth();
     36 | 
     37 |   const role = (
>    38 |     sessionClaims?.metadata as {
     39 |       role?: string;
     40 |     }
     41 |   )?.role;
     42 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/report-cards/[reportCardId]/page.tsx:46`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     42 | 
     43 |   return (
     44 |     <ReportCardViewer
     45 |       reportCard={reportCard}
>    46 |       isAdmin={role === "admin"}
     47 |       backHref="/list/report-cards"
     48 |       printHref={`/list/report-cards/${reportCard.id}/print`}
     49 |       reviewHref={`/list/report-cards/${reportCard.id}/review`}
     50 |       canReview={role === "admin" || role === "teacher"}
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/report-cards/[reportCardId]/page.tsx:50`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     46 |       isAdmin={role === "admin"}
     47 |       backHref="/list/report-cards"
     48 |       printHref={`/list/report-cards/${reportCard.id}/print`}
     49 |       reviewHref={`/list/report-cards/${reportCard.id}/review`}
>    50 |       canReview={role === "admin" || role === "teacher"}
     51 |     />
     52 |   );
     53 | }
     54 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/report-cards/page.tsx:65`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     61 |       currentFilters={params}
     62 |       page={result.pagination.page}
     63 |       totalPages={result.pagination.totalPages}
     64 |       total={result.pagination.total}
>    65 |       isAdmin={role === "admin" || role === "super_admin"}
     66 |     />
     67 |   );
     68 | }
     69 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/results/legacy/page.tsx:70`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     66 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     67 |   const searchParams = await props.searchParams;
     68 | 
     69 |   const { userId, sessionClaims } = await auth();
>    70 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     71 |   const currentUserId = userId;
     72 | 
     73 |   // ✅ Define table columns
     74 |   const columns = [
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/results/legacy/page.tsx:89`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     85 |       className: "hidden md:table-cell",
     86 |     },
     87 |     { header: "Class", accessor: "class", className: "hidden md:table-cell" },
     88 |     { header: "Date", accessor: "date", className: "hidden md:table-cell" },
>    89 |     ...(role === "admin" || role === "teacher"
     90 |       ? [{ header: "Actions", accessor: "action" }]
     91 |       : []),
     92 |   ];
     93 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/results/legacy/page.tsx:133`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    129 |       <td className="hidden md:table-cell">{item.className}</td>
    130 |       <td className="hidden md:table-cell">
    131 |         {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    132 |       </td>
>   133 |       {(role === "admin" || role === "teacher") && (
    134 |         <td>
    135 |           <div className="flex items-center gap-2">
    136 |             <FormContainer table="result" type="update" data={item} />
    137 |             <FormContainer table="result" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/results/legacy/page.tsx:390`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    386 |             </button>
    387 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    388 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    389 |             </button>
>   390 |             {(role === "admin" || role === "teacher") && (
    391 |               <FormContainer table="result" type="create" />
    392 |             )}
    393 |           </div>
    394 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/results/page.tsx:33`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     29 |     redirect("/sign-in");
     30 |   }
     31 | 
     32 |   const role = (
>    33 |     sessionClaims?.metadata as {
     34 |       role?: string;
     35 |     }
     36 |   )?.role;
     37 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/results/page.tsx:105`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    101 |    * Teacher and administrator command centre
    102 |    */
    103 |   if (
    104 |     role === "teacher" ||
>   105 |     role === "admin"
    106 |   ) {
    107 |     redirect(
    108 |       "/list/results/manage",
    109 |     );
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/settings/academic-calendar/page.tsx:32`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     28 |     redirect("/sign-in");
     29 |   }
     30 | 
     31 |   const role = (
>    32 |     sessionClaims?.metadata as {
     33 |       role?: string;
     34 |     }
     35 |   )?.role;
     36 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/settings/academic-calendar/page.tsx:37`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     33 |       role?: string;
     34 |     }
     35 |   )?.role;
     36 | 
>    37 |   if (role !== "admin") {
     38 |     redirect("/");
     39 |   }
     40 | 
     41 |   const [academicYears, terms] = await Promise.all([
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/settings/audit/page.tsx:145`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
    141 |     );
    142 |   }
    143 | 
    144 |   const role = (
>   145 |     sessionClaims
    146 |       ?.metadata as {
    147 |       role?: string;
    148 |     }
    149 |   )?.role;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/settings/audit/page.tsx:152`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    148 |     }
    149 |   )?.role;
    150 | 
    151 |   if (
>   152 |     role !== "admin"
    153 |   ) {
    154 |     redirect("/");
    155 |   }
    156 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/settings/page.tsx:39`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
     35 |     );
     36 |   }
     37 | 
     38 |   const role = (
>    39 |     sessionClaims
     40 |       ?.metadata as {
     41 |       role?: string;
     42 |     }
     43 |   )?.role;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/settings/page.tsx:46`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     42 |     }
     43 |   )?.role;
     44 | 
     45 |   if (
>    46 |     role !== "admin"
     47 |   ) {
     48 |     redirect("/");
     49 |   }
     50 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/students/[id]/page.tsx:26`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     22 |   console.log("🧩 PARAM ID:", id);
     23 |   if (!id) return notFound();
     24 | 
     25 |   const { sessionClaims } = await auth();
>    26 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     27 | 
     28 |   const student:
     29 |     | (Student & {
     30 |         class: Class & { _count: { lessons: number } };
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/students/[id]/page.tsx:66`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     62 |               <div className="flex items-center gap-4">
     63 |                 <h1 className="text-xl font-semibold">
     64 |                   {student.name + " " + student.surname}
     65 |                 </h1>
>    66 |                 {role === "admin" && (
     67 |                   <FormContainer table="student" type="update" data={student} />
     68 |                 )}
     69 |               </div>
     70 |               <p className="text-sm text-gray-500">
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/students/[id]/page.tsx:174`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    170 |       </div>
    171 | 
    172 |       {/* RIGHT */}
    173 |       <div className="w-full xl:w-1/3 flex flex-col gap-4">
>   174 |         {role === "admin" && <FeeStatementForm studentId={student.id} />}
    175 |         <div className="bg-white p-4 rounded-md">
    176 |           <h1 className="text-xl font-semibold">Shortcuts</h1>
    177 |           <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
    178 |             <Link
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/students/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 | }) {
     19 |   const searchParams = await props.searchParams;
     20 | 
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   // -----------------------
     25 |   // Extract pagination
     26 |   // -----------------------
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/students/page.tsx:103`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     99 |       header: "Address",
    100 |       accessor: "address",
    101 |       className: "hidden lg:table-cell",
    102 |     },
>   103 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
    104 |   ];
    105 | 
    106 |   const renderRow = (item: StudentList) => (
    107 |     <tr
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/students/page.tsx:133`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    129 |       <td className="hidden md:table-cell">{item.boardingType}</td>
    130 |       <td className="hidden lg:table-cell">{item.phone}</td>
    131 |       <td className="hidden lg:table-cell">{item.address}</td>
    132 | 
>   133 |       {role === "admin" && (
    134 |         <td>
    135 |           <div className="flex items-center gap-2">
    136 |             <Link href={`/list/students/${item.id}`}>
    137 |               <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA]">
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/students/page.tsx:170`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    166 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    167 |               <Image src="/sort.png" alt="" width={14} height={14} />
    168 |             </button>
    169 | 
>   170 |             {role === "admin" && (
    171 |               <FormContainer table="student" type="create" />
    172 |             )}
    173 |           </div>
    174 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/subjects/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 |   // ✅ Fix for Next.js 15 — unwrap searchParams
     19 |   const searchParams = await props.searchParams;
     20 | 
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   // ✅ Table columns
     25 |   const columns = [
     26 |     { header: "Subject Name", accessor: "name" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/subjects/page.tsx:28`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     24 |   // ✅ Table columns
     25 |   const columns = [
     26 |     { header: "Subject Name", accessor: "name" },
     27 |     { header: "Teachers", accessor: "teachers", className: "hidden md:table-cell" },
>    28 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     29 |   ];
     30 | 
     31 |   // ✅ Table rows
     32 |   const renderRow = (item: SubjectList) => (
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/subjects/page.tsx:41`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     37 |       <td className="flex items-center gap-4 p-4">{item.name}</td>
     38 |       <td className="hidden md:table-cell">
     39 |         {item.teachers.map((teacher) => teacher.name).join(", ")}
     40 |       </td>
>    41 |       {role === "admin" && (
     42 |         <td>
     43 |           <div className="flex items-center gap-2">
     44 |             <FormContainer table="subject" type="update" data={item} />
     45 |             <FormContainer table="subject" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/subjects/page.tsx:98`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     94 |             </button>
     95 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
     96 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
     97 |             </button>
>    98 |             {role === "admin" && <FormContainer table="subject" type="create" />}
     99 |           </div>
    100 |         </div>
    101 |       </div>
    102 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/teachers/[id]/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 | 
     19 |   console.log("🧩 PARAM ID:", id);
     20 |   if (!id) return notFound();
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   const teacher:
     25 |     | (Teacher & {
     26 |         _count: { subjects: number; lessons: number; classes: number };
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/teachers/[id]/page.tsx:67`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     63 |               <div className="flex items-center gap-4">
     64 |                 <h1 className="text-xl font-semibold">
     65 |                   {teacher.name + " " + teacher.surname}
     66 |                 </h1>
>    67 |                 {role === "admin" && (
     68 |                   <FormContainer table="teacher" type="update" data={teacher} />
     69 |                 )}
     70 |               </div>
     71 |               <p className="text-sm text-gray-500">
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/list/teachers/page.tsx:22`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     18 | }) {
     19 |   // ✅ Fix for Next.js 15: unwrap searchParams
     20 |   const searchParams = await props.searchParams;
     21 |   const { sessionClaims } = await auth();
>    22 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     23 | 
     24 |   const columns = [
     25 |     { header: "Info", accessor: "info" },
     26 |     {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/teachers/page.tsx:47`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     43 |       header: "Address",
     44 |       accessor: "address",
     45 |       className: "hidden lg:table-cell",
     46 |     },
>    47 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     48 |   ];
     49 | 
     50 |   const renderRow = (item: TeacherList) => (
     51 |     <tr
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/teachers/page.tsx:89`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     85 |             <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA]">
     86 |               <Image src="/view.png" alt="" width={16} height={16} />
     87 |             </button>
     88 |           </Link>
>    89 |           {role === "admin" && (
     90 |             <FormContainer table="teacher" type="delete" id={item.id} />
     91 |           )}
     92 |         </div>
     93 |       </td>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/teachers/page.tsx:146`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    142 |             </button>
    143 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    144 |               <Image src="/sort.png" alt="" width={14} height={14} />
    145 |             </button>
>   146 |             {role === "admin" && (
    147 |               <FormContainer table="teacher" type="create" />
    148 |             )}
    149 |           </div>
    150 |         </div>
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/notifications/page.tsx:31`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     27 | 
     28 |   const { sessionClaims } = await auth();
     29 | 
     30 |   const role = (
>    31 |     sessionClaims?.metadata as {
     32 |       role?: AppRole;
     33 |     }
     34 |   )?.role;
     35 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/parent/results/page.tsx:42`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
     38 |     );
     39 |   }
     40 | 
     41 |   const role = (
>    42 |     sessionClaims
     43 |       ?.metadata as {
     44 |       role?: string;
     45 |     }
     46 |   )?.role;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/(dashboard)/teacher/classes/page.tsx:40`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     36 |     redirect("/sign-in");
     37 |   }
     38 | 
     39 |   const role = (
>    40 |     sessionClaims?.metadata as {
     41 |       role?: string;
     42 |     }
     43 |   )?.role;
     44 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/(dashboard)/teacher/classes/page.tsx:47`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     43 |   )?.role;
     44 | 
     45 |   if (
     46 |     role !== "teacher" &&
>    47 |     role !== "admin"
     48 |   ) {
     49 |     redirect("/");
     50 |   }
     51 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/academic-period-options/route.ts:36`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
     32 |       );
     33 |     }
     34 | 
     35 |     const role = (
>    36 |       sessionClaims
     37 |         ?.metadata as {
     38 |         role?: string;
     39 |       }
     40 |     )?.role;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/academic-period-options/route.ts:43`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     39 |       }
     40 |     )?.role;
     41 | 
     42 |     if (
>    43 |       role !== "admin" &&
     44 |       role !== "teacher"
     45 |     ) {
     46 |       return NextResponse.json(
     47 |         {
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:188`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "admin"`

```ts
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
>   188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
    191 |     /* TRANSACTION                                                            */
    192 |     /* ---------------------------------------------------------------------- */
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/access-control/users/[userId]/profile/route.ts:294`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "admin"`

```ts
    290 |        * Admin
    291 |        * ------------------------------------------------------------
    292 |        */
    293 | 
>   294 |       if (legacyRole === "admin") {
    295 |         const domainUpdate = await tx.admin.updateMany({
    296 |           where: {
    297 |             id: targetUser.id,
    298 |           },
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/attendance/create/route.ts:134`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    130 | import prisma from "@/lib/prisma";
    131 | 
    132 | export async function POST(req: Request) {
    133 |   const { sessionClaims, userId } = await auth();
>   134 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    135 | 
    136 |   const { studentId, date, present, day } = await req.json();
    137 | 
    138 |   if (role !== "admin") {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/attendance/create/route.ts:138`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    134 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    135 | 
    136 |   const { studentId, date, present, day } = await req.json();
    137 | 
>   138 |   if (role !== "admin") {
    139 |     const student = await prisma.student.findUnique({
    140 |       where: { id: studentId },
    141 |       include: { class: true },
    142 |     });
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/attendance/update/[id]/route.ts:46`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     42 |   context: { params: Promise<{ id: string }> }
     43 | ) {
     44 |   try {
     45 |     const { sessionClaims, userId } = await auth();
>    46 |     const role = (sessionClaims?.metadata as { role?: string })?.role;
     47 | 
     48 |     const { id } = await context.params;
     49 |     const attendanceId = Number(id);
     50 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/attendance/update/[id]/route.ts:67`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     63 |         { status: 400 }
     64 |       );
     65 |     }
     66 | 
>    67 |     if (role !== "admin") {
     68 |       const record = await prisma.attendance.findUnique({
     69 |         where: { id: attendanceId },
     70 |         include: {
     71 |           student: {
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/attendance/upsert/route.ts:26`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     22 |     );
     23 |   }
     24 | 
     25 |   const role = (
>    26 |     sessionClaims?.metadata as {
     27 |       role?: string;
     28 |     }
     29 |   )?.role;
     30 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/attendance/upsert/route.ts:128`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    124 |       },
    125 |     );
    126 |   }
    127 | 
>   128 |   if (role !== "admin" && student.class.supervisorId !== userId) {
    129 |     return NextResponse.json(
    130 |       {
    131 |         error: "Forbidden",
    132 |       },
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/dev/access-check/route.ts:44`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     40 |     await auth();
     41 | 
     42 |   const legacyRole =
     43 |     (
>    44 |       sessionClaims?.metadata as {
     45 |         role?:
     46 |           string;
     47 |       }
     48 |     )?.role ??
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/generate-invoices/route.ts:36`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     32 | 
     33 | export async function POST() {
     34 |   try {
     35 |     const { sessionClaims, userId } = await auth();
>    36 |     const role = (sessionClaims?.metadata as { role?: string })?.role;
     37 | 
     38 |     if (role !== "admin") {
     39 |       return NextResponse.json(
     40 |         { success: false, message: "Unauthorized" },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/generate-invoices/route.ts:38`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     34 |   try {
     35 |     const { sessionClaims, userId } = await auth();
     36 |     const role = (sessionClaims?.metadata as { role?: string })?.role;
     37 | 
>    38 |     if (role !== "admin") {
     39 |       return NextResponse.json(
     40 |         { success: false, message: "Unauthorized" },
     41 |         { status: 403 },
     42 |       );
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/api/lessonsForUser/route.ts:8`

**File type:** API_ROUTE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
      4 | 
      5 | export async function GET() {
      6 |   try {
      7 |     const { userId, sessionClaims } = await auth();
>     8 |     const role = (sessionClaims?.metadata as { role?: string })?.role;
      9 | 
     10 |     let lessons: { id: number; name: string; }[];
     11 | 
     12 |     if (role === "admin") {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/app/api/lessonsForUser/route.ts:12`

**File type:** API_ROUTE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
      8 |     const role = (sessionClaims?.metadata as { role?: string })?.role;
      9 | 
     10 |     let lessons: { id: number; name: string; }[];
     11 | 
>    12 |     if (role === "admin") {
     13 |       // Admin: fetch all lessons
     14 |       lessons = await prisma.lesson.findMany({
     15 |         select: { id: true, name: true },
     16 |       });
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/app/session-tasks/reset-password/complete/page.tsx:30`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     26 |           }
     27 |         | undefined
     28 |     )?.role ||
     29 |     (
>    30 |       sessionClaims?.metadata as
     31 |         | {
     32 |             role?: string;
     33 |           }
     34 |         | undefined
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/components/Announcements.tsx:6`

**File type:** COMPONENT

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
      2 | import { auth } from "@clerk/nextjs/server";
      3 | 
      4 | const Announcements = async () => {
      5 |   const { userId, sessionClaims } = await auth();
>     6 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
      7 | 
      8 |   const roleConditions = {
      9 |     teacher: { lessons: { some: { teacherId: userId! } } },
     10 |     student: { students: { some: { id: userId! } } },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/Announcements.tsx:18`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     14 |   const data = await prisma.announcement.findMany({
     15 |     take: 3,
     16 |     orderBy: { date: "desc" },
     17 |     where: {
>    18 |       ...(role !== "admin" && {
     19 |         OR: [
     20 |           { classId: null },
     21 |           { class: roleConditions[role as keyof typeof roleConditions] || {} },
     22 |         ],
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/AttendanceTable.tsx:70`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     66 | 
     67 |   /* ---------------- PERMISSIONS ---------------- */
     68 | 
     69 |   const canEdit = useMemo(() => {
>    70 |     if (role === "admin") return true;
     71 |     const cls = classes.find((c) => c.id === Number(selectedClass));
     72 |     return cls?.supervisorId === userId;
     73 |   }, [role, userId, selectedClass, classes]);
     74 | 
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/components/EventCalendarContainer.tsx:57`

**File type:** COMPONENT

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     53 |     return null;
     54 |   }
     55 | 
     56 |   const role = (
>    57 |     sessionClaims?.metadata as {
     58 |       role?: string;
     59 |     }
     60 |   )?.role as EventViewerRole | undefined;
     61 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/components/EventList.tsx:46`

**File type:** COMPONENT

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     42 |     return null;
     43 |   }
     44 | 
     45 |   const role = (
>    46 |     sessionClaims?.metadata as {
     47 |       role?: string;
     48 |     }
     49 |   )?.role as EventViewerRole | undefined;
     50 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/fee-master/FeeMasterHeader.tsx:39`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     35 | 
     36 |       <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
     37 |         <TableSearch />
     38 |         <div className="flex w-full justify-start md:justify-end">
>    39 |           {role === "admin" && (
     40 |             <button
     41 |               onClick={generateInvoices}
     42 |               disabled={loading}
     43 |               className="bg-green-500 text-white p-2 rounded-md text-sm disabled:bg-gray-400"
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/fee-master/FeeMasterTable.tsx:27`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     23 |     { header: "Term", accessor: "term", className: "hidden lg:table-cell" },
     24 |     { header: "Academic Year", accessor: "academicYear", className: "hidden lg:table-cell" },
     25 |     { header: "Total Amount", accessor: "totalAmount" },
     26 |     { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
>    27 |     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
     28 |   ];
     29 | 
     30 |   const renderRow = (item: FeeMasterList) => {
     31 |     
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/fee-master/FeeMasterTable.tsx:45`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     41 |         <td className = "hidden lg:table-cell" >{item.academicYear}</td>
     42 |         <td>{item.totalAmount.toFixed(2)}</td>
     43 |         <td className = "hidden lg:table-cell" >{item.status}</td>
     44 | 
>    45 |         {role === "admin" && (
     46 |           <td className="p-2 flex gap-2 items-center">
     47 |             {/* update / delete / create payment */}
     48 |             <FormContainer table="fee-master" type="update" data={item} />
     49 |             <FormContainer table="fee-master" type="delete" id={item.id} />
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/components/FormContainer.tsx:36`

**File type:** COMPONENT

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     32 | const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
     33 |   let relatedData = {};
     34 | 
     35 |   const { userId, sessionClaims } = await auth();
>    36 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
     37 |   const currentUserId = userId;
     38 | 
     39 |   if (type !== "delete") {
     40 |     switch (table) {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/components/NavbarClient.tsx:401`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    397 |             {/* MENU ITEMS                                          */}
    398 |             {/* ================================================== */}
    399 | 
    400 |             <div className="px-2 pb-2">
>   401 |               {role === "admin" && (
    402 |                 <PremiumMenuItem
    403 |                   href="/list/settings/academic-calendar"
    404 |                   icon={Settings}
    405 |                   title="Settings"
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/academic-weightings/auth.ts:23`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     19 |     );
     20 |   }
     21 | 
     22 |   const role = (
>    23 |     sessionClaims?.metadata as {
     24 |       role?: string;
     25 |     }
     26 |   )?.role;
     27 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/academic-weightings/auth.ts:28`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     24 |       role?: string;
     25 |     }
     26 |   )?.role;
     27 | 
>    28 |   if (role !== "admin") {
     29 |     throw new Error(
     30 |       "UNAUTHORISED",
     31 |     );
     32 |   }
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/access-control/admin-dashboard.ts:64`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "admin"`

```ts
     60 |    * This means a properly provisioned super_admin works
     61 |    * even though it is not literally "admin".
     62 |    */
     63 |   const administrativeIdentity =
>    64 |     legacyRole ===
     65 |       "admin" ||
     66 |     legacyRole ===
     67 |       "super_admin" ||
     68 |     roleKeys.has(
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/access-control/provisioning-service.ts:27`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     23 |   } =
     24 |     await auth();
     25 | 
     26 |   const role = (
>    27 |     sessionClaims?.metadata as {
     28 |       role?: string;
     29 |     }
     30 |   )?.role;
     31 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/access-control/provisioning-service.ts:39`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     35 |    * boundary for user provisioning.
     36 |    */
     37 |   if (
     38 |     !userId ||
>    39 |     role !== "admin"
     40 |   ) {
     41 |     throw new Error(
     42 |       "Unauthorized",
     43 |     );
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/access-control/role-service.ts:24`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     20 | async function requireRoleManagementAdmin() {
     21 |   const { userId, sessionClaims } = await auth();
     22 | 
     23 |   const role = (
>    24 |     sessionClaims?.metadata as {
     25 |       role?: string;
     26 |     }
     27 |   )?.role;
     28 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/access-control/role-service.ts:35`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     31 |    *
     32 |    * We still deliberately enforce through the
     33 |    * existing Clerk role during the shadow-RBAC phase.
     34 |    */
>    35 |   if (!userId || role !== "admin") {
     36 |     throw new Error("Unauthorized");
     37 |   }
     38 | 
     39 |   const clerkUser = await currentUser();
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:575`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    571 | ) => {
    572 |   const { userId, sessionClaims } = await auth();
    573 | 
    574 |   const role = (
>   575 |     sessionClaims?.metadata as {
    576 |       role?: string;
    577 |     }
    578 |   )?.role;
    579 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:669`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    665 | ) => {
    666 |   const { userId, sessionClaims } = await auth();
    667 | 
    668 |   const role = (
>   669 |     sessionClaims?.metadata as {
    670 |       role?: string;
    671 |     }
    672 |   )?.role;
    673 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:756`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    752 | ) => {
    753 |   const id = data.get("id") as string;
    754 | 
    755 |   const { userId, sessionClaims } = await auth();
>   756 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    757 | 
    758 |   try {
    759 |     await prisma.exam.delete({
    760 |       where: {
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:779`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    775 |   currentState: CurrentState,
    776 |   data: LessonSchema,
    777 | ) => {
    778 |   const { userId, sessionClaims } = await auth();
>   779 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    780 | 
    781 |   try {
    782 |     if (role === "teacher" && userId !== data.teacherId) {
    783 |       return { success: false, error: true };
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:814`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    810 |   currentState: CurrentState,
    811 |   data: LessonSchema,
    812 | ) => {
    813 |   const { userId, sessionClaims } = await auth();
>   814 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    815 | 
    816 |   try {
    817 |     if (!data.id) return { success: false, error: true };
    818 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:860`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    856 |   data: FormData,
    857 | ) => {
    858 |   const id = data.get("id") as string;
    859 |   const { userId, sessionClaims } = await auth();
>   860 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    861 | 
    862 |   try {
    863 |     const lesson = await prisma.lesson.findUnique({
    864 |       where: { id: parseInt(id) },
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:1945`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
   1941 | ) => {
   1942 |   const { userId, sessionClaims } = await auth();
   1943 | 
   1944 |   const role = (
>  1945 |     sessionClaims?.metadata as {
   1946 |       role?: string;
   1947 |     }
   1948 |   )?.role;
   1949 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/actions.ts:1950`

**File type:** SERVER_ACTION

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
   1946 |       role?: string;
   1947 |     }
   1948 |   )?.role;
   1949 | 
>  1950 |   if (!userId || role !== "admin") {
   1951 |     return {
   1952 |       success: false,
   1953 | 
   1954 |       error: true,
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:2115`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
   2111 | ) => {
   2112 |   const { userId, sessionClaims } = await auth();
   2113 | 
   2114 |   const role = (
>  2115 |     sessionClaims?.metadata as {
   2116 |       role?: string;
   2117 |     }
   2118 |   )?.role;
   2119 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/actions.ts:2120`

**File type:** SERVER_ACTION

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
   2116 |       role?: string;
   2117 |     }
   2118 |   )?.role;
   2119 | 
>  2120 |   if (!userId || role !== "admin") {
   2121 |     return {
   2122 |       success: false,
   2123 | 
   2124 |       error: true,
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:2373`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
   2369 | ) => {
   2370 |   const { userId, sessionClaims } = await auth();
   2371 | 
   2372 |   const role = (
>  2373 |     sessionClaims?.metadata as {
   2374 |       role?: string;
   2375 |     }
   2376 |   )?.role;
   2377 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/actions.ts:2378`

**File type:** SERVER_ACTION

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
   2374 |       role?: string;
   2375 |     }
   2376 |   )?.role;
   2377 | 
>  2378 |   if (!userId || role !== "admin") {
   2379 |     return {
   2380 |       success: false,
   2381 | 
   2382 |       error: true,
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:2854`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
   2850 | ) => {
   2851 |   const { userId, sessionClaims } = await auth();
   2852 | 
   2853 |   const role = (
>  2854 |     sessionClaims?.metadata as {
   2855 |       role?: string;
   2856 |     }
   2857 |   )?.role;
   2858 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/actions.ts:2859`

**File type:** SERVER_ACTION

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
   2855 |       role?: string;
   2856 |     }
   2857 |   )?.role;
   2858 | 
>  2859 |   if (!userId || role !== "admin") {
   2860 |     return {
   2861 |       success: false,
   2862 | 
   2863 |       error: true,
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/actions.ts:3205`

**File type:** SERVER_ACTION

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
   3201 | }) => {
   3202 |   const { userId, sessionClaims } = await auth();
   3203 | 
   3204 |   const role = (
>  3205 |     sessionClaims?.metadata as {
   3206 |       role?: string;
   3207 |     }
   3208 |   )?.role;
   3209 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/events/visibility.ts:24`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     20 |   role:
     21 |     EventViewerRole;
     22 | }): Prisma.EventWhereInput {
     23 |   if (
>    24 |     role ===
     25 |     "admin"
     26 |   ) {
     27 |     return {};
     28 |   }
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/navigation/roles.ts:288`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    284 |   role:
    285 |     AppRole,
    286 | ) {
    287 |   return (
>   288 |     role ===
    289 |       "admin" ||
    290 |     role ===
    291 |       "super_admin"
    292 |   );
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/access.ts:211`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    207 |    * Only administrators and teachers can mutate
    208 |    * report-card review state.
    209 |    */
    210 |   if (
>   211 |     role !== "admin" &&
    212 |     role !== "teacher"
    213 |   ) {
    214 |     return null;
    215 |   }
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/report-cards/auth.ts:219`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
    215 |           }
    216 |         | undefined
    217 |     )?.role ??
    218 |     (
>   219 |       sessionClaims?.metadata as
    220 |         | {
    221 |             role?: unknown;
    222 |           }
    223 |         | undefined
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:262`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "admin"`

```ts
    258 |   }
    259 | 
    260 |   const legacyRole = accessActor.actor.legacyRole?.trim().toLowerCase();
    261 | 
>   262 |   const administrator = legacyRole === "admin" || legacyRole === "super_admin";
    263 | 
    264 |   /*
    265 |    * Transitional workspace-level RBAC check.
    266 |    *
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:327`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role !== "admin"`

```ts
    323 |     throw new Error("UNAUTHORISED");
    324 |   }
    325 | 
    326 |   if (
>   327 |     user.role !== "admin" &&
    328 |     user.role !== "super_admin" &&
    329 |     user.role !== "custom"
    330 |   ) {
    331 |     throw new Error("UNAUTHORISED");
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:358`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role !== "admin"`

```ts
    354 |    * Teacher access belongs to the manager workflow,
    355 |    * not the administrative/bulk-review workflow.
    356 |    */
    357 |   if (
>   358 |     user.role !== "admin" &&
    359 |     user.role !== "super_admin" &&
    360 |     user.role !== "custom"
    361 |   ) {
    362 |     throw new Error("UNAUTHORISED");
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/bulk-review-actions.ts:44`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     40 | 
     41 | async function requireReportCardAdmin() {
     42 |   const { userId, role } = await requireReportCardUser();
     43 | 
>    44 |   if (role !== "admin") {
     45 |     throw new Error("ADMIN_REQUIRED");
     46 |   }
     47 | 
     48 |   return {
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/generation-validator.ts:159`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    155 |     role,
    156 |   } = await requireReportCardUser();
    157 | 
    158 |   if (
>   159 |     role !== "admin" &&
    160 |     role !== "teacher"
    161 |   ) {
    162 |     throw new Error(
    163 |       "UNAUTHORISED",
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/review-actions.ts:315`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    311 |              * Teachers cannot overwrite
    312 |              * the head-teacher remark.
    313 |              */
    314 |             headTeacherRemark:
>   315 |               role === "admin"
    316 |                 ? normalizeNullableText(data.headTeacherRemark)
    317 |                 : reportCard.headTeacherRemark,
    318 | 
    319 |             promotionStatus: normalizeNullableText(data.promotionStatus),
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/review-permissions.ts:156`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    152 |    * "admin" persona. We only classify its authority for this
    153 |    * review workspace.
    154 |    */
    155 |   const isAdministrativeReviewer =
>   156 |     role ===
    157 |       "admin" ||
    158 |     role ===
    159 |       "super_admin" ||
    160 |     role ===
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/results/command-centre-queries.ts:30`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     26 |     throw new Error("UNAUTHENTICATED");
     27 |   }
     28 | 
     29 |   const role = (
>    30 |     sessionClaims?.metadata as {
     31 |       role?: string;
     32 |     }
     33 |   )?.role;
     34 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/results/command-centre-queries.ts:35`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     31 |       role?: string;
     32 |     }
     33 |   )?.role;
     34 | 
>    35 |   if (role !== "admin" && role !== "teacher") {
     36 |     throw new Error("UNAUTHORISED");
     37 |   }
     38 | 
     39 |   return {
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/results/command-centre-queries.ts:97`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
     93 | function getOwnershipWhere({
     94 |   userId,
     95 |   role,
     96 | }: ResultsManager): Prisma.ResultWhereInput {
>    97 |   if (role === "admin") {
     98 |     return {};
     99 |   }
    100 | 
    101 |   return {
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/results/queries.ts:445`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
    441 |     );
    442 |   }
    443 | 
    444 |   const role = (
>   445 |     sessionClaims
    446 |       ?.metadata as {
    447 |       role?: string;
    448 |     } | undefined
    449 |   )?.role;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/lib/results/student-profile-queries.ts:39`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.metadata`

```ts
     35 |     );
     36 |   }
     37 | 
     38 |   const role = (
>    39 |     sessionClaims?.metadata as {
     40 |       role?: string;
     41 |     }
     42 |   )?.role;
     43 | 
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/results/student-profile-queries.ts:45`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
     41 |     }
     42 |   )?.role;
     43 | 
     44 |   if (
>    45 |     role !== "admin" &&
     46 |     role !== "teacher"
     47 |   ) {
     48 |     throw new Error(
     49 |       "UNAUTHORISED",
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — SESSION_METADATA_ROLE_SOURCE

**File:** `src/middleware.ts:146`

**File type:** OTHER

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.metadata`

```ts
    142 |             }
    143 |           | undefined
    144 |       )?.role ??
    145 |       (
>   146 |         sessionClaims
    147 |           ?.metadata as
    148 |           | {
    149 |               role?:
    150 |                 unknown;
```

**Recommendation:** Prefer centralized identity/profile resolution. If role data is required, normalize consistently.

### MEDIUM — SESSION_PUBLIC_METADATA_SOURCE

**File:** `src/app/(dashboard)/dashboard/page.tsx:52`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.publicMetadata`

```ts
     48 |   }
     49 | 
     50 |   const rawRole =
     51 |     (
>    52 |       sessionClaims
     53 |         ?.publicMetadata as
     54 |         | {
     55 |             role?:
     56 |               unknown;
```

**Recommendation:** Acceptable for identity extraction, but authorization should preferably use Access Context/Actor.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/app/(dashboard)/list/report-cards/page.tsx:65`

**File type:** PAGE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "super_admin"`

```ts
     61 |       currentFilters={params}
     62 |       page={result.pagination.page}
     63 |       totalPages={result.pagination.totalPages}
     64 |       total={result.pagination.total}
>    65 |       isAdmin={role === "admin" || role === "super_admin"}
     66 |     />
     67 |   );
     68 | }
     69 | 
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — SESSION_PUBLIC_METADATA_SOURCE

**File:** `src/app/session-tasks/reset-password/complete/page.tsx:23`

**File type:** PAGE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.publicMetadata`

```ts
     19 |   }
     20 | 
     21 |   const role =
     22 |     (
>    23 |       sessionClaims?.publicMetadata as
     24 |         | {
     25 |             role?: string;
     26 |           }
     27 |         | undefined
```

**Recommendation:** Acceptable for identity extraction, but authorization should preferably use Access Context/Actor.

### MEDIUM — HARDCODED_ROLE_ARRAY

**File:** `src/components/AppSidebarClient.tsx:258`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `["student", "parent"]`

```ts
    254 |             ? "/parent/assessments"
    255 |             : "/list/assessments",
    256 | 
    257 |       access: {
>   258 |         personas: ["student", "parent"],
    259 | 
    260 |         anyPermissions: [
    261 |           "assessments.view",
    262 |           "assessments.create",
```

**Recommendation:** For navigation/workspace authorization prefer permission-aware policies.

### MEDIUM — HARDCODED_ROLE_ARRAY

**File:** `src/components/AppSidebarClient.tsx:323`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `["student", "parent", "teacher"]`

```ts
    319 |               ? "/teacher/classes"
    320 |               : "/list/report-cards",
    321 | 
    322 |       access: {
>   323 |         personas: ["student", "parent", "teacher"],
    324 | 
    325 |         anyPermissions: [
    326 |           "report_cards.view",
    327 |           "report_cards.edit",
```

**Recommendation:** For navigation/workspace authorization prefer permission-aware policies.

### MEDIUM — HARDCODED_ROLE_ARRAY

**File:** `src/components/results/student-profile/StudentResultsProfileHero.tsx:21`

**File type:** COMPONENT

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `["student"]`

```ts
     17 |   student,
     18 |   totalResults,
     19 | }: {
     20 |   student:
>    21 |     StudentResultProfileData["student"];
     22 | 
     23 |   totalResults: number;
     24 | }) {
     25 |   const fullName =
```

**Recommendation:** For navigation/workspace authorization prefer permission-aware policies.

### MEDIUM — HARDCODED_ROLE_ARRAY

**File:** `src/lib/academic-engine/ranking.ts:260`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `["student"]`

```ts
    256 |   mode = "COMPETITION",
    257 |   decimalPlaces = 2,
    258 | }: {
    259 |   subjectResults: {
>   260 |     student: StudentTermReport["student"];
    261 |     result: SubjectFinalResult;
    262 |   }[];
    263 | 
    264 |   mode?: AcademicEngineRankingMode;
```

**Recommendation:** For navigation/workspace authorization prefer permission-aware policies.

### MEDIUM — HARDCODED_ROLE_ARRAY

**File:** `src/lib/academic-engine/subject-performance.ts:35`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `["student"]`

```ts
     31 |   subjectName: string;
     32 | 
     33 |   results: {
     34 |     student:
>    35 |       StudentTermReport["student"];
     36 | 
     37 |     result:
     38 |       SubjectFinalResult;
     39 |   }[];
```

**Recommendation:** For navigation/workspace authorization prefer permission-aware policies.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/access-control/admin-dashboard.ts:66`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "super_admin"`

```ts
     62 |    */
     63 |   const administrativeIdentity =
     64 |     legacyRole ===
     65 |       "admin" ||
>    66 |     legacyRole ===
     67 |       "super_admin" ||
     68 |     roleKeys.has(
     69 |       "admin",
     70 |     ) ||
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — PUBLIC_METADATA_ROLE_SOURCE

**File:** `src/lib/access-control/sync-current-user.ts:52`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `publicMetadata.role`

```ts
     48 |     return null;
     49 |   }
     50 | 
     51 |   const legacyRole =
>    52 |     typeof user.publicMetadata.role ===
     53 |     "string"
     54 |       ? user.publicMetadata.role
     55 |           .trim()
     56 |           .toLowerCase()
```

**Recommendation:** Use centralized role/profile normalization unless this is identity synchronization.

### MEDIUM — PUBLIC_METADATA_ROLE_SOURCE

**File:** `src/lib/access-control/sync-current-user.ts:54`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `publicMetadata.role`

```ts
     50 | 
     51 |   const legacyRole =
     52 |     typeof user.publicMetadata.role ===
     53 |     "string"
>    54 |       ? user.publicMetadata.role
     55 |           .trim()
     56 |           .toLowerCase()
     57 |       : null;
     58 | 
```

**Recommendation:** Use centralized role/profile normalization unless this is identity synchronization.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/auth/require-route-access.ts:142`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "super_admin"`

```ts
    138 |    *
    139 |    * ["admin", "super_admin"]
    140 |    */
    141 |   if (
>   142 |     role ===
    143 |       "super_admin" &&
    144 |     allowedRoles.includes(
    145 |       "admin",
    146 |     )
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/navigation/roles.ts:290`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "super_admin"`

```ts
    286 | ) {
    287 |   return (
    288 |     role ===
    289 |       "admin" ||
>   290 |     role ===
    291 |       "super_admin"
    292 |   );
    293 | }
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — MUTATION_UPDATE

**File:** `src/lib/notifications/actions.ts:735`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    731 |   accessActor.actor.id;
    732 | 
    733 |   try {
    734 |     const settings =
>   735 |       await prisma.notificationSystemSettings.upsert({
    736 |         where: {
    737 |           id:
    738 |             1,
    739 |         },
```

**Recommendation:** Confirm the mutation checks the correct exact permission before execution.

### MEDIUM — SESSION_PUBLIC_METADATA_SOURCE

**File:** `src/lib/report-cards/auth.ts:212`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `sessionClaims?.publicMetadata`

```ts
    208 |    * read from that location.
    209 |    */
    210 |   const rawRole =
    211 |     (
>   212 |       sessionClaims?.publicMetadata as
    213 |         | {
    214 |             role?: unknown;
    215 |           }
    216 |         | undefined
```

**Recommendation:** Acceptable for identity extraction, but authorization should preferably use Access Context/Actor.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:262`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `legacyRole === "super_admin"`

```ts
    258 |   }
    259 | 
    260 |   const legacyRole = accessActor.actor.legacyRole?.trim().toLowerCase();
    261 | 
>   262 |   const administrator = legacyRole === "admin" || legacyRole === "super_admin";
    263 | 
    264 |   /*
    265 |    * Transitional workspace-level RBAC check.
    266 |    *
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:328`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role !== "super_admin"`

```ts
    324 |   }
    325 | 
    326 |   if (
    327 |     user.role !== "admin" &&
>   328 |     user.role !== "super_admin" &&
    329 |     user.role !== "custom"
    330 |   ) {
    331 |     throw new Error("UNAUTHORISED");
    332 |   }
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:359`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role !== "super_admin"`

```ts
    355 |    * not the administrative/bulk-review workflow.
    356 |    */
    357 |   if (
    358 |     user.role !== "admin" &&
>   359 |     user.role !== "super_admin" &&
    360 |     user.role !== "custom"
    361 |   ) {
    362 |     throw new Error("UNAUTHORISED");
    363 |   }
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/review-permissions.ts:158`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "super_admin"`

```ts
    154 |    */
    155 |   const isAdministrativeReviewer =
    156 |     role ===
    157 |       "admin" ||
>   158 |     role ===
    159 |       "super_admin" ||
    160 |     role ===
    161 |       "custom";
    162 | 
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — ROUTE_ACCESS_MAP

**File:** `src/lib/settings.ts:62`

**File type:** SERVICE

**Migration class:** LEGACY_ROUTE_GUARD

**Match:** `routeAccessMap`

```ts
     58 |  * Sensitive authorization must continue to be enforced
     59 |  * by the RBAC checks inside pages, services and APIs.
     60 |  */
     61 | 
>    62 | export const routeAccessMap: RouteAccessMap = {
     63 |   /* ------------------------------------------------------------------------ */
     64 |   /* DASHBOARDS                                                               */
     65 |   /* ------------------------------------------------------------------------ */
     66 | 
```

**Recommendation:** Transitional only. Eventually replace with centralized permission-aware route authorization.

### MEDIUM — PUBLIC_METADATA_ROLE_SOURCE

**File:** `src/lib/users/current-school-profile.ts:366`

**File type:** SERVICE

**Migration class:** CLAIMS

**Match:** `publicMetadata .role`

```ts
    362 |   /* ------------------------------------------------------------------------ */
    363 | 
    364 |   const rawRole =
    365 |     getClerkRole(
>   366 |       user.publicMetadata
    367 |         .role,
    368 |     );
    369 | 
    370 |   /*
```

**Recommendation:** Use centralized role/profile normalization unless this is identity synchronization.

### MEDIUM — ROUTE_ACCESS_MAP

**File:** `src/middleware.ts:13`

**File type:** OTHER

**Migration class:** LEGACY_ROUTE_GUARD

**Match:** `routeAccessMap`

```ts
      9 |   NextResponse,
     10 | } from "next/server";
     11 | 
     12 | import {
>    13 |   routeAccessMap,
     14 | } from "./lib/settings";
     15 | 
     16 | /* ========================================================================== */
     17 | /* LEGACY ROLE-BASED ROUTES                                                   */
```

**Recommendation:** Transitional only. Eventually replace with centralized permission-aware route authorization.

### MEDIUM — ROUTE_ACCESS_MAP

**File:** `src/middleware.ts:28`

**File type:** OTHER

**Migration class:** LEGACY_ROUTE_GUARD

**Match:** `routeAccessMap`

```ts
     24 |  * the page, service or API resource itself.
     25 |  */
     26 | const matchers =
     27 |   Object.keys(
>    28 |     routeAccessMap,
     29 |   ).map(
     30 |     (
     31 |       route,
     32 |     ) => ({
```

**Recommendation:** Transitional only. Eventually replace with centralized permission-aware route authorization.

### MEDIUM — ROUTE_ACCESS_MAP

**File:** `src/middleware.ts:39`

**File type:** OTHER

**Migration class:** LEGACY_ROUTE_GUARD

**Match:** `routeAccessMap`

```ts
     35 |           route,
     36 |         ]),
     37 | 
     38 |       allowedRoles:
>    39 |         routeAccessMap[
     40 |           route
     41 |         ],
     42 |     }),
     43 |   );
```

**Recommendation:** Transitional only. Eventually replace with centralized permission-aware route authorization.

### MEDIUM — SESSION_PUBLIC_METADATA_SOURCE

**File:** `src/middleware.ts:137`

**File type:** OTHER

**Migration class:** CLAIMS

**Match:** `sessionClaims ?.publicMetadata`

```ts
    133 |     /* ---------------------------------------------------------------------- */
    134 | 
    135 |     const rawRole =
    136 |       (
>   137 |         sessionClaims
    138 |           ?.publicMetadata as
    139 |           | {
    140 |               role?:
    141 |                 unknown;
```

**Recommendation:** Acceptable for identity extraction, but authorization should preferably use Access Context/Actor.

## Review Queue

There are **212** findings requiring human classification.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/delegated-access/page.tsx:595`

```ts
    591 | 
    592 |                 const requiredRoleKey =
    593 |                   resolveLegacyAccessRole(
    594 |                     assignment.user
>   595 |                       .legacyRole,
    596 |                   );
    597 | 
    598 |                 const required =
    599 |                   requiredRoleKey ===
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/page.tsx:363`

```ts
    359 |                       )
    360 |                       .join(
    361 |                         ", ",
    362 |                       ) ||
>   363 |                       user.legacyRole ||
    364 |                       "No role assigned"}
    365 |                   </p>
    366 |                 </div>
    367 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:357`

```ts
    353 |   /* -------------------------------------------------------------------------- */
    354 |   /* LINKED SCHOOL RECORDS                                                      */
    355 |   /* -------------------------------------------------------------------------- */
    356 | 
>   357 |   const linkedRecordType = user.legacyRole?.toLowerCase() ?? null;
    358 | 
    359 |   const [linkedStudent, linkedTeacher, linkedParent, linkedAdmin] =
    360 |     await Promise.all([
    361 |       linkedRecordType === "student"
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1033`

```ts
   1029 |   const effectivePermissionCount = effectivePermissionKeys.length;
   1030 | 
   1031 |   const accountHasAccess = user.status === "ACTIVE" && assignedRoleCount > 0;
   1032 | 
>  1033 |   const primeRole = user.legacyRole
   1034 |     ? formatLegacyRole(user.legacyRole)
   1035 |     : "Not assigned";
   1036 | 
   1037 |   const expectedAccessRoleKey = resolveLegacyAccessRole(user.legacyRole);
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1034`

```ts
   1030 | 
   1031 |   const accountHasAccess = user.status === "ACTIVE" && assignedRoleCount > 0;
   1032 | 
   1033 |   const primeRole = user.legacyRole
>  1034 |     ? formatLegacyRole(user.legacyRole)
   1035 |     : "Not assigned";
   1036 | 
   1037 |   const expectedAccessRoleKey = resolveLegacyAccessRole(user.legacyRole);
   1038 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1037`

```ts
   1033 |   const primeRole = user.legacyRole
   1034 |     ? formatLegacyRole(user.legacyRole)
   1035 |     : "Not assigned";
   1036 | 
>  1037 |   const expectedAccessRoleKey = resolveLegacyAccessRole(user.legacyRole);
   1038 | 
   1039 |   const primaryRoleAssignment = expectedAccessRoleKey
   1040 |     ? (activeRoleAssignments.find(
   1041 |         (assignment) => assignment.role.key === expectedAccessRoleKey,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1075`

```ts
   1071 |   const hasMixedRoleSources = assignmentSources.length > 1;
   1072 | 
   1073 |   const synchronizationIssues: string[] = [];
   1074 | 
>  1075 |   if (!user.legacyRole) {
   1076 |     synchronizationIssues.push(
   1077 |       "No legacy application role is stored for this identity.",
   1078 |     );
   1079 |   }
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1081`

```ts
   1077 |       "No legacy application role is stored for this identity.",
   1078 |     );
   1079 |   }
   1080 | 
>  1081 |   if (user.legacyRole && !legacyRoleMapped) {
   1082 |     synchronizationIssues.push(
   1083 |       "The legacy application role does not map to a known RBAC system role.",
   1084 |     );
   1085 |   }
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1144`

```ts
   1140 |                   displayName: user.displayName,
   1141 |                   username: user.username,
   1142 |                   email: user.email,
   1143 |                   phone: user.phone,
>  1144 |                   legacyRole: user.legacyRole,
   1145 |                   status: user.status,
   1146 |                 }}
   1147 |                 assignedRoleCount={assignedRoleCount}
   1148 |                 linkedRecordKind={linkedRecordKind}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1268`

```ts
   1264 |                       {primaryRole.name}
   1265 |                     </span>
   1266 |                   ) : null}
   1267 | 
>  1268 |                   {user.legacyRole ? (
   1269 |                     <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
   1270 |                       Legacy: {user.legacyRole}
   1271 |                     </span>
   1272 |                   ) : null}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1270`

```ts
   1266 |                   ) : null}
   1267 | 
   1268 |                   {user.legacyRole ? (
   1269 |                     <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
>  1270 |                       Legacy: {user.legacyRole}
   1271 |                     </span>
   1272 |                   ) : null}
   1273 |                 </div>
   1274 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1455`

```ts
   1451 | 
   1452 |                       <AccountInfoCell
   1453 |                         icon={ShieldCheck}
   1454 |                         label="Legacy Role"
>  1455 |                         value={formatLegacyRole(user.legacyRole)}
   1456 |                         badge
   1457 |                       />
   1458 | 
   1459 |                       <AccountInfoCell
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1560`

```ts
   1556 | 
   1557 |                         <AboutAccountItem
   1558 |                           icon={UserCog}
   1559 |                           title="Application Identity"
>  1560 |                           value={formatLegacyRole(user.legacyRole)}
   1561 |                         />
   1562 | 
   1563 |                         <AboutAccountItem
   1564 |                           icon={KeyRound}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:1595`

```ts
   1591 |                           Account Architecture
   1592 |                         </p>
   1593 | 
   1594 |                         <p className="mt-2 text-xs leading-5 text-blue-700">
>  1595 |                           {getAccountArchitectureDescription(user.legacyRole)}
   1596 |                         </p>
   1597 |                       </div>
   1598 |                     </div>
   1599 |                   </article>
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:2366`

```ts
   2362 |                       <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
   2363 |                         <AccessFlowCard
   2364 |                           icon={Fingerprint}
   2365 |                           eyebrow="Application Identity"
>  2366 |                           title={formatLegacyRole(user.legacyRole)}
   2367 |                           description="Stored as the legacy Clerk role and still used by existing application routing and compatibility checks."
   2368 |                           tone="amber"
   2369 |                         />
   2370 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:3899`

```ts
   3895 | 
   3896 |                         <IdentityInfoItem
   3897 |                           icon={Route}
   3898 |                           label="Legacy Routing Role"
>  3899 |                           value={formatLegacyRole(user.legacyRole)}
   3900 |                         />
   3901 |                       </div>
   3902 |                     </article>
   3903 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4282`

```ts
   4278 |                       icon={Waypoints}
   4279 |                       eyebrow="Legacy Mapping"
   4280 |                       title={legacyRoleMapped ? "Mapped" : "Unmapped"}
   4281 |                       value={
>  4282 |                         user.legacyRole
   4283 |                           ? `${formatLegacyRole(user.legacyRole)} → ${
   4284 |                               expectedAccessRoleKey ?? "Unknown"
   4285 |                             }`
   4286 |                           : "No legacy role"
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4283`

```ts
   4279 |                       eyebrow="Legacy Mapping"
   4280 |                       title={legacyRoleMapped ? "Mapped" : "Unmapped"}
   4281 |                       value={
   4282 |                         user.legacyRole
>  4283 |                           ? `${formatLegacyRole(user.legacyRole)} → ${
   4284 |                               expectedAccessRoleKey ?? "Unknown"
   4285 |                             }`
   4286 |                           : "No legacy role"
   4287 |                       }
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4403`

```ts
   4399 |                         <SyncFlowStage
   4400 |                           number="01"
   4401 |                           label="Legacy Identity"
   4402 |                           value={
>  4403 |                             user.legacyRole
   4404 |                               ? formatLegacyRole(user.legacyRole)
   4405 |                               : "Not assigned"
   4406 |                           }
   4407 |                           healthy={Boolean(user.legacyRole)}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4404`

```ts
   4400 |                           number="01"
   4401 |                           label="Legacy Identity"
   4402 |                           value={
   4403 |                             user.legacyRole
>  4404 |                               ? formatLegacyRole(user.legacyRole)
   4405 |                               : "Not assigned"
   4406 |                           }
   4407 |                           healthy={Boolean(user.legacyRole)}
   4408 |                         />
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4407`

```ts
   4403 |                             user.legacyRole
   4404 |                               ? formatLegacyRole(user.legacyRole)
   4405 |                               : "Not assigned"
   4406 |                           }
>  4407 |                           healthy={Boolean(user.legacyRole)}
   4408 |                         />
   4409 | 
   4410 |                         <LifecycleArrow />
   4411 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4650`

```ts
   4646 |                         <SecurityStateItem
   4647 |                           icon={Route}
   4648 |                           label="Legacy Routing"
   4649 |                           value={
>  4650 |                             user.legacyRole
   4651 |                               ? formatLegacyRole(user.legacyRole)
   4652 |                               : "Not assigned"
   4653 |                           }
   4654 |                           status={user.legacyRole ? "AVAILABLE" : "ATTENTION"}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4651`

```ts
   4647 |                           icon={Route}
   4648 |                           label="Legacy Routing"
   4649 |                           value={
   4650 |                             user.legacyRole
>  4651 |                               ? formatLegacyRole(user.legacyRole)
   4652 |                               : "Not assigned"
   4653 |                           }
   4654 |                           status={user.legacyRole ? "AVAILABLE" : "ATTENTION"}
   4655 |                         />
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:4654`

```ts
   4650 |                             user.legacyRole
   4651 |                               ? formatLegacyRole(user.legacyRole)
   4652 |                               : "Not assigned"
   4653 |                           }
>  4654 |                           status={user.legacyRole ? "AVAILABLE" : "ATTENTION"}
   4655 |                         />
   4656 |                       </div>
   4657 |                     </article>
   4658 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:5223`

```ts
   5219 |                     <LinkedRecordMetric
   5220 |                       icon={UserRound}
   5221 |                       label="Application Role"
   5222 |                       value={
>  5223 |                         user.legacyRole
   5224 |                           ? formatLegacyRole(user.legacyRole)
   5225 |                           : "Not assigned"
   5226 |                       }
   5227 |                       description="Primary application identity used during the current migration phase."
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:5224`

```ts
   5220 |                       icon={UserRound}
   5221 |                       label="Application Role"
   5222 |                       value={
   5223 |                         user.legacyRole
>  5224 |                           ? formatLegacyRole(user.legacyRole)
   5225 |                           : "Not assigned"
   5226 |                       }
   5227 |                       description="Primary application identity used during the current migration phase."
   5228 |                       tone="violet"
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:7506`

```ts
   7502 | 
   7503 |                             <AccountInfoCell
   7504 |                               icon={Fingerprint}
   7505 |                               label="Application Identity"
>  7506 |                               value={formatLegacyRole(user.legacyRole)}
   7507 |                               badge
   7508 |                             />
   7509 | 
   7510 |                             <AccountInfoCell
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8031`

```ts
   8027 |                           <div className="mt-5 grid grid-cols-2 gap-2">
   8028 |                             <StudentMiniStat
   8029 |                               label="Expected Type"
   8030 |                               value={
>  8031 |                                 user.legacyRole
   8032 |                                   ? formatLegacyRole(user.legacyRole)
   8033 |                                   : "Unknown"
   8034 |                               }
   8035 |                             />
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8032`

```ts
   8028 |                             <StudentMiniStat
   8029 |                               label="Expected Type"
   8030 |                               value={
   8031 |                                 user.legacyRole
>  8032 |                                   ? formatLegacyRole(user.legacyRole)
   8033 |                                   : "Unknown"
   8034 |                               }
   8035 |                             />
   8036 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8118`

```ts
   8114 | 
   8115 |                             <AccountInfoCell
   8116 |                               icon={UserCog}
   8117 |                               label="Application Identity"
>  8118 |                               value={formatLegacyRole(user.legacyRole)}
   8119 |                               badge
   8120 |                             />
   8121 | 
   8122 |                             <AccountInfoCell
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8126`

```ts
   8122 |                             <AccountInfoCell
   8123 |                               icon={Database}
   8124 |                               label="Expected Domain"
   8125 |                               value={
>  8126 |                                 user.legacyRole
   8127 |                                   ? formatLegacyRole(user.legacyRole)
   8128 |                                   : "Unable to determine"
   8129 |                               }
   8130 |                             />
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8127`

```ts
   8123 |                               icon={Database}
   8124 |                               label="Expected Domain"
   8125 |                               value={
   8126 |                                 user.legacyRole
>  8127 |                                   ? formatLegacyRole(user.legacyRole)
   8128 |                                   : "Unable to determine"
   8129 |                               }
   8130 |                             />
   8131 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8214`

```ts
   8210 |                                   Declared Identity
   8211 |                                 </p>
   8212 | 
   8213 |                                 <p className="mt-2 truncate text-[11px] font-black text-slate-700">
>  8214 |                                   {user.legacyRole
   8215 |                                     ? formatLegacyRole(user.legacyRole)
   8216 |                                     : "Not assigned"}
   8217 |                                 </p>
   8218 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8215`

```ts
   8211 |                                 </p>
   8212 | 
   8213 |                                 <p className="mt-2 truncate text-[11px] font-black text-slate-700">
   8214 |                                   {user.legacyRole
>  8215 |                                     ? formatLegacyRole(user.legacyRole)
   8216 |                                     : "Not assigned"}
   8217 |                                 </p>
   8218 | 
   8219 |                                 <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8316`

```ts
   8312 |                           <LinkedIdentityStage
   8313 |                             icon={UserCog}
   8314 |                             eyebrow="Application Identity"
   8315 |                             title={
>  8316 |                               user.legacyRole
   8317 |                                 ? formatLegacyRole(user.legacyRole)
   8318 |                                 : "Unknown Role"
   8319 |                             }
   8320 |                             value={
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8317`

```ts
   8313 |                             icon={UserCog}
   8314 |                             eyebrow="Application Identity"
   8315 |                             title={
   8316 |                               user.legacyRole
>  8317 |                                 ? formatLegacyRole(user.legacyRole)
   8318 |                                 : "Unknown Role"
   8319 |                             }
   8320 |                             value={
   8321 |                               user.legacyRole
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8321`

```ts
   8317 |                                 ? formatLegacyRole(user.legacyRole)
   8318 |                                 : "Unknown Role"
   8319 |                             }
   8320 |                             value={
>  8321 |                               user.legacyRole
   8322 |                                 ? `Expected ${formatLegacyRole(user.legacyRole)} domain record`
   8323 |                                 : "No reliable domain type available"
   8324 |                             }
   8325 |                             healthy={Boolean(user.legacyRole)}
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8322`

```ts
   8318 |                                 : "Unknown Role"
   8319 |                             }
   8320 |                             value={
   8321 |                               user.legacyRole
>  8322 |                                 ? `Expected ${formatLegacyRole(user.legacyRole)} domain record`
   8323 |                                 : "No reliable domain type available"
   8324 |                             }
   8325 |                             healthy={Boolean(user.legacyRole)}
   8326 |                           />
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/[userId]/page.tsx:8325`

```ts
   8321 |                               user.legacyRole
   8322 |                                 ? `Expected ${formatLegacyRole(user.legacyRole)} domain record`
   8323 |                                 : "No reliable domain type available"
   8324 |                             }
>  8325 |                             healthy={Boolean(user.legacyRole)}
   8326 |                           />
   8327 | 
   8328 |                           <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-amber-300 lg:rotate-0" />
   8329 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/page.tsx:433`

```ts
    429 | 
    430 |       {/* LEGACY */}
    431 | 
    432 |       <td className="px-5 py-4">
>   433 |         {user.legacyRole ? (
    434 |           <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
    435 |             {
    436 |               user.legacyRole
    437 |             }
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/(dashboard)/list/access-control/users/page.tsx:436`

```ts
    432 |       <td className="px-5 py-4">
    433 |         {user.legacyRole ? (
    434 |           <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
    435 |             {
>   436 |               user.legacyRole
    437 |             }
    438 |           </span>
    439 |         ) : (
    440 |           <span className="text-xs font-bold text-slate-300">
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/assignments/page.tsx:36`

```ts
     32 |     { header: "Subject Name", accessor: "name" },
     33 |     { header: "Class", accessor: "class" },
     34 |     { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
     35 |     { header: "Due Date", accessor: "dueDate", className: "hidden md:table-cell" },
>    36 |     ...(role === "admin" || role === "teacher"
     37 |       ? [{ header: "Actions", accessor: "action" }]
     38 |       : []),
     39 |   ];
     40 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/assignments/page.tsx:56`

```ts
     52 |         {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
     53 |       </td>
     54 |       <td>
     55 |         <div className="flex items-center gap-2">
>    56 |           {(role === "admin" || role === "teacher") && (
     57 |             <>
     58 |               <FormModal table="assignment" type="update" data={item} />
     59 |               <FormModal table="assignment" type="delete" id={item.id} />
     60 |             </>
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/assignments/page.tsx:151`

```ts
    147 |             </button>
    148 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    149 |               <Image src="/sort.png" alt="" width={14} height={14} />
    150 |             </button>
>   151 |             {(role === "admin" || role === "teacher") && (
    152 |               <FormModal table="assignment" type="create" />
    153 |             )}
    154 |           </div>
    155 |         </div>
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/exams/page.tsx:37`

```ts
     33 |     { header: "Subject Name", accessor: "name" },
     34 |     { header: "Class", accessor: "class" },
     35 |     { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
     36 |     { header: "Date", accessor: "date", className: "hidden md:table-cell" },
>    37 |     ...(role === "admin" || role === "teacher"
     38 |       ? [{ header: "Actions", accessor: "action" }]
     39 |       : []),
     40 |   ];
     41 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/exams/page.tsx:58`

```ts
     54 |         {new Intl.DateTimeFormat("en-US").format(item.startTime)}
     55 |       </td>
     56 |       <td>
     57 |         <div className="flex items-center gap-2">
>    58 |           {(role === "admin" || role === "teacher") && (
     59 |             <>
     60 |               <FormContainer table="exam" type="update" data={item} />
     61 |               <FormContainer table="exam" type="delete" id={item.id} />
     62 |             </>
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/exams/page.tsx:146`

```ts
    142 |             </button>
    143 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    144 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    145 |             </button>
>   146 |             {(role === "admin" || role === "teacher") && (
    147 |               <FormContainer table="exam" type="create" />
    148 |             )}
    149 |           </div>
    150 |         </div>
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/report-cards/[reportCardId]/page.tsx:50`

```ts
     46 |       isAdmin={role === "admin"}
     47 |       backHref="/list/report-cards"
     48 |       printHref={`/list/report-cards/${reportCard.id}/print`}
     49 |       reviewHref={`/list/report-cards/${reportCard.id}/review`}
>    50 |       canReview={role === "admin" || role === "teacher"}
     51 |     />
     52 |   );
     53 | }
     54 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/results/legacy/page.tsx:89`

```ts
     85 |       className: "hidden md:table-cell",
     86 |     },
     87 |     { header: "Class", accessor: "class", className: "hidden md:table-cell" },
     88 |     { header: "Date", accessor: "date", className: "hidden md:table-cell" },
>    89 |     ...(role === "admin" || role === "teacher"
     90 |       ? [{ header: "Actions", accessor: "action" }]
     91 |       : []),
     92 |   ];
     93 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/results/legacy/page.tsx:133`

```ts
    129 |       <td className="hidden md:table-cell">{item.className}</td>
    130 |       <td className="hidden md:table-cell">
    131 |         {new Intl.DateTimeFormat("en-US").format(item.startTime)}
    132 |       </td>
>   133 |       {(role === "admin" || role === "teacher") && (
    134 |         <td>
    135 |           <div className="flex items-center gap-2">
    136 |             <FormContainer table="result" type="update" data={item} />
    137 |             <FormContainer table="result" type="delete" id={item.id} />
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/results/legacy/page.tsx:390`

```ts
    386 |             </button>
    387 |             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
    388 |               <Image src="/sort.png" alt="Sort" width={14} height={14} />
    389 |             </button>
>   390 |             {(role === "admin" || role === "teacher") && (
    391 |               <FormContainer table="result" type="create" />
    392 |             )}
    393 |           </div>
    394 |         </div>
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/app/(dashboard)/list/results/page.tsx:41`

```ts
     37 | 
     38 |   /*
     39 |    * Student results centre
     40 |    */
>    41 |   if (role === "student") {
     42 |     const [
     43 |       student,
     44 |       results,
     45 |       terms,
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/app/(dashboard)/list/results/page.tsx:94`

```ts
     90 | 
     91 |   /*
     92 |    * Dedicated parent results centre
     93 |    */
>    94 |   if (role === "parent") {
     95 |     redirect(
     96 |       "/parent/results",
     97 |     );
     98 |   }
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/list/results/page.tsx:104`

```ts
    100 |   /*
    101 |    * Teacher and administrator command centre
    102 |    */
    103 |   if (
>   104 |     role === "teacher" ||
    105 |     role === "admin"
    106 |   ) {
    107 |     redirect(
    108 |       "/list/results/manage",
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_PARENT_CHECK

`src/app/(dashboard)/parent/layout.tsx:31`

```ts
     27 |     );
     28 |   }
     29 | 
     30 |   if (
>    31 |     profile.role !==
     32 |     "parent"
     33 |   ) {
     34 |     redirect(
     35 |       "/dashboard",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/app/(dashboard)/parent/results/page.tsx:49`

```ts
     45 |     }
     46 |   )?.role;
     47 | 
     48 |   if (
>    49 |     role !== "parent"
     50 |   ) {
     51 |     redirect("/");
     52 |   }
     53 | 
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_STUDENT_CHECK

`src/app/(dashboard)/student/layout.tsx:31`

```ts
     27 |     );
     28 |   }
     29 | 
     30 |   if (
>    31 |     profile.role !==
     32 |     "student"
     33 |   ) {
     34 |     redirect(
     35 |       "/dashboard",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/teacher/classes/page.tsx:46`

```ts
     42 |     }
     43 |   )?.role;
     44 | 
     45 |   if (
>    46 |     role !== "teacher" &&
     47 |     role !== "admin"
     48 |   ) {
     49 |     redirect("/");
     50 |   }
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/teacher/classes/page.tsx:55`

```ts
     51 | 
     52 |   const classes =
     53 |     await prisma.class.findMany({
     54 |       where:
>    55 |         role === "teacher"
     56 |           ? {
     57 |               lessons: {
     58 |                 some: {
     59 |                   teacherId:
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/teacher/classes/page.tsx:86`

```ts
     82 |         },
     83 | 
     84 |         lessons: {
     85 |           where:
>    86 |             role === "teacher"
     87 |               ? {
     88 |                   teacherId:
     89 |                     userId,
     90 |                 }
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/(dashboard)/teacher/layout.tsx:31`

```ts
     27 |     );
     28 |   }
     29 | 
     30 |   if (
>    31 |     profile.role !==
     32 |     "teacher"
     33 |   ) {
     34 |     redirect(
     35 |       "/dashboard",
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/app/api/academic-period-options/route.ts:44`

```ts
     40 |     )?.role;
     41 | 
     42 |     if (
     43 |       role !== "admin" &&
>    44 |       role !== "teacher"
     45 |     ) {
     46 |       return NextResponse.json(
     47 |         {
     48 |           message:
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:509`

```ts
    505 |                 actor.email ??
    506 |                 "Super Administrator",
    507 | 
    508 |               actorRole:
>   509 |                 actor.legacyRole,
    510 | 
    511 |               targetUserId:
    512 |                 item.userId,
    513 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:643`

```ts
    639 |                   actor.email ??
    640 |                   "Super Administrator",
    641 | 
    642 |                 actorRole:
>   643 |                   actor.legacyRole,
    644 | 
    645 |                 targetUserId:
    646 |                   item.userId,
    647 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:762`

```ts
    758 | 
    759 |     const requiredRoleKey =
    760 |       resolveLegacyAccessRole(
    761 |         assignment.user
>   762 |           .legacyRole,
    763 |       );
    764 | 
    765 |     const requiredRole =
    766 |       Boolean(
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:915`

```ts
    911 |                 actor.email ??
    912 |                 "Super Administrator",
    913 | 
    914 |               actorRole:
>   915 |                 actor.legacyRole,
    916 | 
    917 |               targetUserId:
    918 |                 item.userId,
    919 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:971`

```ts
    967 |                 actor.email ??
    968 |                 "Super Administrator",
    969 | 
    970 |               actorRole:
>   971 |                 actor.legacyRole,
    972 | 
    973 |               targetUserId:
    974 |                 item.userId,
    975 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1196`

```ts
   1192 |               actor.email ??
   1193 |               "Super Administrator",
   1194 | 
   1195 |             actorRole:
>  1196 |               actor.legacyRole,
   1197 | 
   1198 |             targetUserId:
   1199 |               item.userId,
   1200 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/items/[itemId]/route.ts:1251`

```ts
   1247 |               actor.email ??
   1248 |               "Super Administrator",
   1249 | 
   1250 |             actorRole:
>  1251 |               actor.legacyRole,
   1252 | 
   1253 |             targetUserId:
   1254 |               item.userId,
   1255 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:284`

```ts
    280 |               actor.username ??
    281 |               actor.email ??
    282 |               "Super Administrator",
    283 | 
>   284 |             actorRole: actor.legacyRole,
    285 | 
    286 |             reason,
    287 | 
    288 |             metadata: {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:342`

```ts
    338 | 
    339 |           actor: {
    340 |             id: actor.id,
    341 | 
>   342 |             role: actor.legacyRole,
    343 | 
    344 |             name:
    345 |               actor.displayName ??
    346 |               actor.username ??
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:439`

```ts
    435 |             actor.username ??
    436 |             actor.email ??
    437 |             "Super Administrator",
    438 | 
>   439 |           actorRole: actor.legacyRole,
    440 | 
    441 |           reason,
    442 | 
    443 |           metadata: {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/lifecycle/route.ts:499`

```ts
    495 | 
    496 |         actor: {
    497 |           id: actor.id,
    498 | 
>   499 |           role: actor.legacyRole,
    500 | 
    501 |           name:
    502 |             actor.displayName ??
    503 |             actor.username ??
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/start/route.ts:196`

```ts
    192 |             actor.username ??
    193 |             actor.email ??
    194 |             "Super Administrator",
    195 | 
>   196 |           actorRole: actor.legacyRole,
    197 | 
    198 |           metadata: {
    199 |             source: "ACCESS_REVIEW_CAMPAIGN_WORKSPACE",
    200 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/campaigns/[campaignId]/start/route.ts:232`

```ts
    228 | 
    229 |         actor: {
    230 |           id: actor.id,
    231 | 
>   232 |           role: actor.legacyRole,
    233 | 
    234 |           name:
    235 |             actor.displayName ??
    236 |             actor.username ??
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/reports/route.ts:238`

```ts
    234 |           name:
    235 |             actorName,
    236 | 
    237 |           role:
>   238 |             actor.legacyRole,
    239 |         },
    240 |       });
    241 | 
    242 |     /* ---------------------------------------------------------------------- */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/reviews/reports/route.ts:257`

```ts
    253 | 
    254 |         actorName,
    255 | 
    256 |         actorRole:
>   257 |           actor.legacyRole,
    258 | 
    259 |         reason:
    260 |           "Access Review compliance report exported.",
    261 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/lifecycle/route.ts:312`

```ts
    308 |               actorAccount.email ??
    309 |               "Administrator",
    310 | 
    311 |             actorRole:
>   312 |               actorAccount.legacyRole,
    313 | 
    314 |             metadata: {
    315 |               source:
    316 |                 "USER_DETAIL_MORE_ACTIONS",
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/lifecycle/route.ts:347`

```ts
    343 | 
    344 |                 username:
    345 |                   targetUser.username,
    346 | 
>   347 |                 legacyRole:
    348 |                   targetUser.legacyRole,
    349 |               },
    350 |             },
    351 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/lifecycle/route.ts:348`

```ts
    344 |                 username:
    345 |                   targetUser.username,
    346 | 
    347 |                 legacyRole:
>   348 |                   targetUser.legacyRole,
    349 |               },
    350 |             },
    351 |           },
    352 |         });
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/password-reset/route.ts:238`

```ts
    234 |           actorAccount.username ??
    235 |           actorAccount.email ??
    236 |           "Administrator",
    237 | 
>   238 |         actorRole: actorAccount.legacyRole,
    239 | 
    240 |         targetUserId: targetUser.id,
    241 | 
    242 |         reason,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/password-reset/route.ts:262`

```ts
    258 |             displayName: targetUser.displayName,
    259 | 
    260 |             username: targetUser.username,
    261 | 
>   262 |             legacyRole: targetUser.legacyRole,
    263 | 
    264 |             localAccountStatus: targetUser.status,
    265 |           },
    266 |         },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/password-reset/route.ts:321`

```ts
    317 |             displayName: targetUser.displayName,
    318 | 
    319 |             username: targetUser.username,
    320 | 
>   321 |             legacyRole: targetUser.legacyRole,
    322 | 
    323 |             localAccountStatus: targetUser.status,
    324 |           },
    325 |         },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:129`

```ts
    125 |     const body = (await request.json()) as UpdateBody;
    126 | 
    127 |     const normalized = normalizeBody(body);
    128 | 
>   129 |     const validationError = validateUpdate(normalized, targetUser.legacyRole);
    130 | 
    131 |     if (validationError) {
    132 |       return NextResponse.json(
    133 |         {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:182`

```ts
    178 |     /* ---------------------------------------------------------------------- */
    179 |     /* DOMAIN TYPE                                                            */
    180 |     /* ---------------------------------------------------------------------- */
    181 | 
>   182 |     const legacyRole = targetUser.legacyRole?.trim().toLowerCase() ?? null;
    183 | 
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_STUDENT_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:185`

```ts
    181 | 
    182 |     const legacyRole = targetUser.legacyRole?.trim().toLowerCase() ?? null;
    183 | 
    184 |     const domainBacked =
>   185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:185`

```ts
    181 | 
    182 |     const legacyRole = targetUser.legacyRole?.trim().toLowerCase() ?? null;
    183 | 
    184 |     const domainBacked =
>   185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:186`

```ts
    182 |     const legacyRole = targetUser.legacyRole?.trim().toLowerCase() ?? null;
    183 | 
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
>   186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:186`

```ts
    182 |     const legacyRole = targetUser.legacyRole?.trim().toLowerCase() ?? null;
    183 | 
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
>   186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_PARENT_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:187`

```ts
    183 | 
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
>   187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
    191 |     /* TRANSACTION                                                            */
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:187`

```ts
    183 | 
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
>   187 |       legacyRole === "parent" ||
    188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
    191 |     /* TRANSACTION                                                            */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:188`

```ts
    184 |     const domainBacked =
    185 |       legacyRole === "student" ||
    186 |       legacyRole === "teacher" ||
    187 |       legacyRole === "parent" ||
>   188 |       legacyRole === "admin";
    189 | 
    190 |     /* ---------------------------------------------------------------------- */
    191 |     /* TRANSACTION                                                            */
    192 |     /* ---------------------------------------------------------------------- */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_STUDENT_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:219`

```ts
    215 |        * Student
    216 |        * ------------------------------------------------------------
    217 |        */
    218 | 
>   219 |       if (legacyRole === "student") {
    220 |         const domainUpdate = await tx.student.updateMany({
    221 |           where: {
    222 |             id: targetUser.id,
    223 |           },
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:219`

```ts
    215 |        * Student
    216 |        * ------------------------------------------------------------
    217 |        */
    218 | 
>   219 |       if (legacyRole === "student") {
    220 |         const domainUpdate = await tx.student.updateMany({
    221 |           where: {
    222 |             id: targetUser.id,
    223 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:243`

```ts
    239 |        * Teacher
    240 |        * ------------------------------------------------------------
    241 |        */
    242 | 
>   243 |       if (legacyRole === "teacher") {
    244 |         const domainUpdate = await tx.teacher.updateMany({
    245 |           where: {
    246 |             id: targetUser.id,
    247 |           },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:243`

```ts
    239 |        * Teacher
    240 |        * ------------------------------------------------------------
    241 |        */
    242 | 
>   243 |       if (legacyRole === "teacher") {
    244 |         const domainUpdate = await tx.teacher.updateMany({
    245 |           where: {
    246 |             id: targetUser.id,
    247 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_PARENT_CHECK

`src/app/api/access-control/users/[userId]/profile/route.ts:267`

```ts
    263 |        * Parent
    264 |        * ------------------------------------------------------------
    265 |        */
    266 | 
>   267 |       if (legacyRole === "parent") {
    268 |         const domainUpdate = await tx.parent.updateMany({
    269 |           where: {
    270 |             id: targetUser.id,
    271 |           },
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:267`

```ts
    263 |        * Parent
    264 |        * ------------------------------------------------------------
    265 |        */
    266 | 
>   267 |       if (legacyRole === "parent") {
    268 |         const domainUpdate = await tx.parent.updateMany({
    269 |           where: {
    270 |             id: targetUser.id,
    271 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:294`

```ts
    290 |        * Admin
    291 |        * ------------------------------------------------------------
    292 |        */
    293 | 
>   294 |       if (legacyRole === "admin") {
    295 |         const domainUpdate = await tx.admin.updateMany({
    296 |           where: {
    297 |             id: targetUser.id,
    298 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:324`

```ts
    320 |             actorAccount.username ??
    321 |             actorAccount.email ??
    322 |             "Administrator",
    323 | 
>   324 |           actorRole: actorAccount.legacyRole,
    325 | 
    326 |           targetUserId: targetUser.id,
    327 | 
    328 |           reason: "User identity information updated.",
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:342`

```ts
    338 | 
    339 |             domainSynchronization: {
    340 |               expected: domainBacked,
    341 | 
>   342 |               type: legacyRole,
    343 | 
    344 |               synchronized: domainSynchronized,
    345 |             },
    346 |           },
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:385`

```ts
    381 |         attempted: domainBacked,
    382 | 
    383 |         synchronized: result.domainSynchronized,
    384 | 
>   385 |         type: legacyRole,
    386 |       },
    387 |     });
    388 |   } catch (error) {
    389 |     /* ---------------------------------------------------------------------- */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:454`

```ts
    450 | /* ========================================================================== */
    451 | /* VALIDATION                                                                 */
    452 | /* ========================================================================== */
    453 | 
>   454 | function validateUpdate(value: NormalizedUpdate, legacyRole: string | null) {
    455 |   if (!value.displayName) {
    456 |     return "Display name is required.";
    457 |   }
    458 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/profile/route.ts:463`

```ts
    459 |   if (value.displayName.length < 2 || value.displayName.length > 100) {
    460 |     return "Display name must contain between 2 and 100 characters.";
    461 |   }
    462 | 
>   463 |   const normalizedRole = legacyRole?.trim().toLowerCase() ?? null;
    464 | 
    465 |   const domainBacked =
    466 |     normalizedRole === "student" ||
    467 |     normalizedRole === "teacher" ||
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/roles/route.ts:518`

```ts
    514 |             actorAccount.username ??
    515 |             actorAccount.email ??
    516 |             "Administrator",
    517 | 
>   518 |           actorRole: actorAccount.legacyRole,
    519 | 
    520 |           roleId: role.id,
    521 | 
    522 |           reason,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/roles/route.ts:714`

```ts
    710 |     /* ---------------------------------------------------------------------- */
    711 |     /* REQUIRED LEGACY-LINKED ROLE                                            */
    712 |     /* ---------------------------------------------------------------------- */
    713 | 
>   714 |     const requiredRoleKey = resolveLegacyAccessRole(targetUser.legacyRole);
    715 | 
    716 |     if (requiredRoleKey && role.key === requiredRoleKey) {
    717 |       return NextResponse.json(
    718 |         {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/roles/route.ts:843`

```ts
    839 |             actorAccount.username ??
    840 |             actorAccount.email ??
    841 |             "Administrator",
    842 | 
>   843 |           actorRole: actorAccount.legacyRole,
    844 | 
    845 |           roleId: role.id,
    846 | 
    847 |           reason,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/roles/route.ts:1113`

```ts
   1109 |     /* ---------------------------------------------------------------------- */
   1110 | 
   1111 |     const requiredRoleKey =
   1112 |       resolveLegacyAccessRole(
>  1113 |         targetUser.legacyRole,
   1114 |       );
   1115 | 
   1116 |     if (
   1117 |       requiredRoleKey &&
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/access-control/users/[userId]/roles/route.ts:1348`

```ts
   1344 |                 actorAccount.email ??
   1345 |                 "Administrator",
   1346 | 
   1347 |               actorRole:
>  1348 |                 actorAccount.legacyRole,
   1349 | 
   1350 |               roleId:
   1351 |                 role.id,
   1352 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/dev/access-check/route.ts:42`

```ts
     38 |     sessionClaims,
     39 |   } =
     40 |     await auth();
     41 | 
>    42 |   const legacyRole =
     43 |     (
     44 |       sessionClaims?.metadata as {
     45 |         role?:
     46 |           string;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/app/api/dev/access-check/route.ts:60`

```ts
     56 |       true,
     57 | 
     58 |     legacy: {
     59 |       role:
>    60 |         legacyRole,
     61 |     },
     62 | 
     63 |     rbac: {
     64 |       provisioned:
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/app/api/lessonsForUser/route.ts:17`

```ts
     13 |       // Admin: fetch all lessons
     14 |       lessons = await prisma.lesson.findMany({
     15 |         select: { id: true, name: true },
     16 |       });
>    17 |     } else if (role === "teacher") {
     18 |       // Teacher: fetch only lessons they teach
     19 |       lessons = await prisma.lesson.findMany({
     20 |         where: { teacherId: userId! },
     21 |         select: { id: true, name: true },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/components/access-control/EditUserDrawer.tsx:33`

```ts
     29 |     displayName: string | null;
     30 |     username: string | null;
     31 |     email: string | null;
     32 |     phone: string | null;
>    33 |     legacyRole: string | null;
     34 |     status: string;
     35 |   };
     36 | 
     37 |   assignedRoleCount: number;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/components/access-control/EditUserDrawer.tsx:443`

```ts
    439 | 
    440 |                 <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
    441 |                   <MiniIdentityValue
    442 |                     label="Application Role"
>   443 |                     value={formatRole(user.legacyRole)}
    444 |                   />
    445 | 
    446 |                   <MiniIdentityValue
    447 |                     label="Domain Profile"
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/components/access-control/EditUserDrawer.tsx:639`

```ts
    635 | 
    636 |                   <ProtectedField
    637 |                     icon={UserCog}
    638 |                     label="Application Identity"
>   639 |                     value={formatRole(user.legacyRole)}
    640 |                     description="Managed through identity provisioning"
    641 |                   />
    642 | 
    643 |                   <ProtectedField
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_STUDENT_CHECK

`src/components/AppSidebarClient.tsx:251`

```ts
    247 |       icon: <ClipboardList size={18} className="text-amber-500" />,
    248 |       label: "Assessments",
    249 | 
    250 |       href:
>   251 |         role === "student"
    252 |           ? "/student/assessments"
    253 |           : role === "parent"
    254 |             ? "/parent/assessments"
    255 |             : "/list/assessments",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/components/AppSidebarClient.tsx:253`

```ts
    249 | 
    250 |       href:
    251 |         role === "student"
    252 |           ? "/student/assessments"
>   253 |           : role === "parent"
    254 |             ? "/parent/assessments"
    255 |             : "/list/assessments",
    256 | 
    257 |       access: {
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_STUDENT_CHECK

`src/components/AppSidebarClient.tsx:305`

```ts
    301 |     {
    302 |       icon: <FileText size={18} className="text-blue-600" />,
    303 | 
    304 |       label:
>   305 |         role === "student"
    306 |           ? "My Report Cards"
    307 |           : role === "parent"
    308 |             ? "Children's Reports"
    309 |             : role === "teacher"
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/components/AppSidebarClient.tsx:307`

```ts
    303 | 
    304 |       label:
    305 |         role === "student"
    306 |           ? "My Report Cards"
>   307 |           : role === "parent"
    308 |             ? "Children's Reports"
    309 |             : role === "teacher"
    310 |               ? "Class Report Cards"
    311 |               : "Report Command Centre",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/components/AppSidebarClient.tsx:309`

```ts
    305 |         role === "student"
    306 |           ? "My Report Cards"
    307 |           : role === "parent"
    308 |             ? "Children's Reports"
>   309 |             : role === "teacher"
    310 |               ? "Class Report Cards"
    311 |               : "Report Command Centre",
    312 | 
    313 |       href:
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/components/AppSidebarClient.tsx:314`

```ts
    310 |               ? "Class Report Cards"
    311 |               : "Report Command Centre",
    312 | 
    313 |       href:
>   314 |         role === "student"
    315 |           ? "/student/report-cards"
    316 |           : role === "parent"
    317 |             ? "/parent/children"
    318 |             : role === "teacher"
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/components/AppSidebarClient.tsx:316`

```ts
    312 | 
    313 |       href:
    314 |         role === "student"
    315 |           ? "/student/report-cards"
>   316 |           : role === "parent"
    317 |             ? "/parent/children"
    318 |             : role === "teacher"
    319 |               ? "/teacher/classes"
    320 |               : "/list/report-cards",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/components/AppSidebarClient.tsx:318`

```ts
    314 |         role === "student"
    315 |           ? "/student/report-cards"
    316 |           : role === "parent"
    317 |             ? "/parent/children"
>   318 |             : role === "teacher"
    319 |               ? "/teacher/classes"
    320 |               : "/list/report-cards",
    321 | 
    322 |       access: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/components/FormContainer.tsx:82`

```ts
     78 |         const [examLessons, examTerms, examYearRows] =
     79 |           await prisma.$transaction([
     80 |             prisma.lesson.findMany({
     81 |               where: {
>    82 |                 ...(role === "teacher"
     83 |                   ? {
     84 |                       teacherId: currentUserId!,
     85 |                     }
     86 |                   : {}),
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/components/FormContainer.tsx:173`

```ts
    169 |           select: { id: true, name: true },
    170 |         });
    171 |         const resultExams = await prisma.exam.findMany({
    172 |           where: {
>   173 |             ...(role === "teacher"
    174 |               ? {
    175 |                   lesson: {
    176 |                     teacherId: currentUserId!,
    177 |                   },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/components/FormContainer.tsx:215`

```ts
    211 |         });
    212 | 
    213 |         const resultAssignments = await prisma.assignment.findMany({
    214 |           where: {
>   215 |             ...(role === "teacher"
    216 |               ? {
    217 |                   lesson: {
    218 |                     teacherId: currentUserId!,
    219 |                   },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/components/FormContainer.tsx:283`

```ts
    279 |         const [assignmentLessons, assignmentTerms, assignmentYearRows] =
    280 |           await prisma.$transaction([
    281 |             prisma.lesson.findMany({
    282 |               where: {
>   283 |                 ...(role === "teacher"
    284 |                   ? {
    285 |                       teacherId: currentUserId!,
    286 |                     }
    287 |                   : {}),
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/access-review-campaigns.ts:397`

```ts
    393 |           actor.username ??
    394 |           actor.email ??
    395 |           "Super Administrator",
    396 | 
>   397 |         actorRole: actor.legacyRole,
    398 | 
    399 |         reason: description,
    400 | 
    401 |         metadata: {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/account-hierarchy.ts:16`

```ts
     12 | };
     13 | 
     14 | export type AccountHierarchyUser = {
     15 |   id: string;
>    16 |   legacyRole: string | null;
     17 | 
     18 |   roles: AssignmentLike[];
     19 | };
     20 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/account-hierarchy.ts:98`

```ts
     94 | 
     95 |   /*
     96 |    * Transitional fallback for legacy identities.
     97 |    */
>    98 |   if (roleLevels.length === 0 && user.legacyRole) {
     99 |     roleLevels.push(getRoleTrustLevel(user.legacyRole));
    100 |   }
    101 | 
    102 |   return Math.max(0, ...roleLevels);
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/account-hierarchy.ts:99`

```ts
     95 |   /*
     96 |    * Transitional fallback for legacy identities.
     97 |    */
     98 |   if (roleLevels.length === 0 && user.legacyRole) {
>    99 |     roleLevels.push(getRoleTrustLevel(user.legacyRole));
    100 |   }
    101 | 
    102 |   return Math.max(0, ...roleLevels);
    103 | }
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:41`

```ts
     37 |             .toLowerCase(),
     38 |       ),
     39 |     );
     40 | 
>    41 |   const legacyRole =
     42 |     actor.legacyRole
     43 |       ?.trim()
     44 |       .toLowerCase() ??
     45 |     null;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:42`

```ts
     38 |       ),
     39 |     );
     40 | 
     41 |   const legacyRole =
>    42 |     actor.legacyRole
     43 |       ?.trim()
     44 |       .toLowerCase() ??
     45 |     null;
     46 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:64`

```ts
     60 |    * This means a properly provisioned super_admin works
     61 |    * even though it is not literally "admin".
     62 |    */
     63 |   const administrativeIdentity =
>    64 |     legacyRole ===
     65 |       "admin" ||
     66 |     legacyRole ===
     67 |       "super_admin" ||
     68 |     roleKeys.has(
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:66`

```ts
     62 |    */
     63 |   const administrativeIdentity =
     64 |     legacyRole ===
     65 |       "admin" ||
>    66 |     legacyRole ===
     67 |       "super_admin" ||
     68 |     roleKeys.has(
     69 |       "admin",
     70 |     ) ||
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:219`

```ts
    215 |         username: true,
    216 | 
    217 |         imageUrl: true,
    218 | 
>   219 |         legacyRole: true,
    220 | 
    221 |         status: true,
    222 | 
    223 |         createdAt: true,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/admin-dashboard.ts:456`

```ts
    452 |         imageUrl: true,
    453 | 
    454 |         status: true,
    455 | 
>   456 |         legacyRole: true,
    457 | 
    458 |         createdAt: true,
    459 | 
    460 |         updatedAt: true,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/context.ts:28`

```ts
     24 | 
     25 |     userId:
     26 |       null,
     27 | 
>    28 |     legacyRole:
     29 |       null,
     30 | 
     31 |     accountStatus:
     32 |       null,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/context.ts:87`

```ts
     83 | 
     84 |         status:
     85 |           true,
     86 | 
>    87 |         legacyRole:
     88 |           true,
     89 | 
     90 |         roles: {
     91 |           where: {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/context.ts:250`

```ts
    246 | 
    247 |     userId:
    248 |       account.id,
    249 | 
>   250 |     legacyRole:
    251 |       account.legacyRole,
    252 | 
    253 |     accountStatus:
    254 |       account.status,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/context.ts:251`

```ts
    247 |     userId:
    248 |       account.id,
    249 | 
    250 |     legacyRole:
>   251 |       account.legacyRole,
    252 | 
    253 |     accountStatus:
    254 |       account.status,
    255 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/delegated-access.ts:391`

```ts
    387 | 
    388 |             status:
    389 |               true,
    390 | 
>   391 |             legacyRole:
    392 |               true,
    393 | 
    394 |             roles: {
    395 |               select: {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/provisioning-service.ts:266`

```ts
    262 |           imageUrl: identity.imageUrl,
    263 | 
    264 |           status: "ACTIVE",
    265 | 
>   266 |           legacyRole: access.primaryRole,
    267 |         },
    268 |       });
    269 | 
    270 |       /* SCHOOL PROFILE */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:22`

```ts
     18 | export type SyncedAccessIdentity = {
     19 |   userId:
     20 |     string;
     21 | 
>    22 |   legacyRole:
     23 |     string | null;
     24 | 
     25 |   accessRoleKey:
     26 |     string | null;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:51`

```ts
     47 |   ) {
     48 |     return null;
     49 |   }
     50 | 
>    51 |   const legacyRole =
     52 |     typeof user.publicMetadata.role ===
     53 |     "string"
     54 |       ? user.publicMetadata.role
     55 |           .trim()
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:61`

```ts
     57 |       : null;
     58 | 
     59 |   const accessRoleKey =
     60 |     resolveLegacyAccessRole(
>    61 |       legacyRole,
     62 |     );
     63 | 
     64 |   const displayName =
     65 |     user.firstName
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:141`

```ts
    137 |       /*
    138 |        * This remains merely a migration /
    139 |        * compatibility hint.
    140 |        */
>   141 |       legacyRole,
    142 |     },
    143 | 
    144 |     create: {
    145 |       id:
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:167`

```ts
    163 | 
    164 |       status:
    165 |         "ACTIVE",
    166 | 
>   167 |       legacyRole,
    168 |     },
    169 |   });
    170 | 
    171 |   /*
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:183`

```ts
    179 |     return {
    180 |       userId:
    181 |         user.id,
    182 | 
>   183 |       legacyRole,
    184 | 
    185 |       accessRoleKey:
    186 |         null,
    187 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:228`

```ts
    224 |     return {
    225 |       userId:
    226 |         user.id,
    227 | 
>   228 |       legacyRole,
    229 | 
    230 |       accessRoleKey,
    231 | 
    232 |       accountCreated:
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/sync-current-user.ts:286`

```ts
    282 |   return {
    283 |     userId:
    284 |       user.id,
    285 | 
>   286 |     legacyRole,
    287 | 
    288 |     accessRoleKey,
    289 | 
    290 |     accountCreated:
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/types.ts:33`

```ts
     29 | 
     30 |   userId:
     31 |     string | null;
     32 | 
>    33 |   legacyRole:
     34 |     string | null;
     35 | 
     36 |   accountStatus:
     37 |     UserAccountStatus | null;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:583`

```ts
    579 | 
    580 |   try {
    581 |     const academicYear = data.academicYear.trim();
    582 | 
>   583 |     if (role === "teacher") {
    584 |       const teacherLesson = await prisma.lesson.findFirst({
    585 |         where: {
    586 |           teacherId: userId!,
    587 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:683`

```ts
    679 |         error: true,
    680 |       };
    681 |     }
    682 | 
>   683 |     if (role === "teacher") {
    684 |       const teacherLesson = await prisma.lesson.findFirst({
    685 |         where: {
    686 |           teacherId: userId!,
    687 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:762`

```ts
    758 |   try {
    759 |     await prisma.exam.delete({
    760 |       where: {
    761 |         id: parseInt(id),
>   762 |         ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
    763 |       },
    764 |     });
    765 | 
    766 |     // revalidatePath("/list/subjects");
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:782`

```ts
    778 |   const { userId, sessionClaims } = await auth();
    779 |   const role = (sessionClaims?.metadata as { role?: string })?.role;
    780 | 
    781 |   try {
>   782 |     if (role === "teacher" && userId !== data.teacherId) {
    783 |       return { success: false, error: true };
    784 |     }
    785 | 
    786 |     // Convert "08:30" → Date object (using arbitrary base date)
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:820`

```ts
    816 |   try {
    817 |     if (!data.id) return { success: false, error: true };
    818 | 
    819 |     // Teachers can only update their own lessons
>   820 |     if (role === "teacher") {
    821 |       const existingLesson = await prisma.lesson.findUnique({
    822 |         where: { id: data.id },
    823 |       });
    824 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/actions.ts:870`

```ts
    866 | 
    867 |     if (!lesson) return { success: false, error: true };
    868 | 
    869 |     // Teachers can only delete their own lessons
>   870 |     if (role === "teacher" && lesson.teacherId !== userId) {
    871 |       return { success: false, error: true };
    872 |     }
    873 | 
    874 |     await prisma.lesson.delete({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:166`

```ts
    162 | 
    163 |     if (!resolvedLessonId) {
    164 |       const firstAvailableLesson = await prisma.lesson.findFirst({
    165 |         where:
>   166 |           role === "teacher"
    167 |             ? {
    168 |                 teacherId: userId,
    169 |               }
    170 |             : undefined,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:183`

```ts
    179 |       });
    180 | 
    181 |       if (!firstAvailableLesson) {
    182 |         return assessmentFailure(
>   183 |           role === "teacher"
    184 |             ? "You do not have a lesson available for assessment creation."
    185 |             : "Create a lesson before creating an assessment.",
    186 |         );
    187 |       }
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:2650`

```ts
   2646 |             assessmentId,
   2647 |             studentId,
   2648 | 
   2649 |             assessment: {
>  2650 |               ...(role === "teacher"
   2651 |                 ? {
   2652 |                     lesson: {
   2653 |                       teacherId: userId,
   2654 |                     },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:2726`

```ts
   2722 |             /*
   2723 |              * Administrators may not have a Teacher row
   2724 |              * matching their Clerk ID.
   2725 |              */
>  2726 |             reviewedById: role === "teacher" ? userId : null,
   2727 |           },
   2728 | 
   2729 |           select: {
   2730 |             id: true,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/assessments/auth.ts:76`

```ts
     72 |    * account
     73 |    *
     74 |    * It is NOT being used as the authorization decision.
     75 |    */
>    76 |   const legacyRole =
     77 |     accessActor.actor
     78 |       .legacyRole
     79 |       ?.trim()
     80 |       .toLowerCase();
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/assessments/auth.ts:78`

```ts
     74 |    * It is NOT being used as the authorization decision.
     75 |    */
     76 |   const legacyRole =
     77 |     accessActor.actor
>    78 |       .legacyRole
     79 |       ?.trim()
     80 |       .toLowerCase();
     81 | 
     82 |   if (
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/assessments/auth.ts:83`

```ts
     79 |       ?.trim()
     80 |       .toLowerCase();
     81 | 
     82 |   if (
>    83 |     legacyRole
     84 |   ) {
     85 |     return legacyRole;
     86 |   }
     87 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/assessments/auth.ts:85`

```ts
     81 | 
     82 |   if (
     83 |     legacyRole
     84 |   ) {
>    85 |     return legacyRole;
     86 |   }
     87 | 
     88 |   /*
     89 |    * For identities without a legacy persona,
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/auth.ts:144`

```ts
    140 |    * scope model says otherwise.
    141 |    */
    142 |   const scope:
    143 |     AssessmentAccessScope =
>   144 |     role === "teacher"
    145 |       ? "OWN_LESSONS"
    146 |       : "GLOBAL";
    147 | 
    148 |   return {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/auth.ts:208`

```ts
    204 | 
    205 |     roleKey,
    206 | 
    207 |     scope:
>   208 |       role === "teacher"
    209 |         ? "OWN_LESSONS"
    210 |         : "GLOBAL",
    211 | 
    212 |     permissions:
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/assessments/auth.ts:263`

```ts
    259 |    * Student assessment routes operate on the
    260 |    * authenticated student's own records.
    261 |    */
    262 |   if (
>   263 |     user.role !==
    264 |     "student"
    265 |   ) {
    266 |     throw new Error(
    267 |       "UNAUTHORIZED",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/assessments/auth.ts:292`

```ts
    288 |    * Parent-specific endpoints use this persona only
    289 |    * to establish parent -> child ownership.
    290 |    */
    291 |   if (
>   292 |     user.role !==
    293 |     "parent"
    294 |   ) {
    295 |     throw new Error(
    296 |       "UNAUTHORIZED",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_STUDENT_CHECK

`src/lib/events/visibility.ts:31`

```ts
     27 |     return {};
     28 |   }
     29 | 
     30 |   if (
>    31 |     role ===
     32 |     "student"
     33 |   ) {
     34 |     return {
     35 |       OR: [
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/events/visibility.ts:56`

```ts
     52 |     };
     53 |   }
     54 | 
     55 |   if (
>    56 |     role ===
     57 |     "parent"
     58 |   ) {
     59 |     return {
     60 |       OR: [
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/finance/notification-actions.ts:55`

```ts
     51 | 
     52 |   const userId = accessActor.actor.id;
     53 | 
     54 |   const actorRole =
>    55 |     accessActor.actor.legacyRole ??
     56 |     accessActor.activeAssignments[0]?.role.key ??
     57 |     null;
     58 | 
     59 |   const normalisedTerm = term.trim();
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/finance/notification-actions.ts:280`

```ts
    276 | 
    277 |   const userId = accessActor.actor.id;
    278 | 
    279 |   const actorRole =
>   280 |     accessActor.actor.legacyRole ??
    281 |     accessActor.activeAssignments[0]?.role.key ??
    282 |     null;
    283 | 
    284 |   if (!Number.isInteger(feeMasterId) || feeMasterId <= 0) {
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/notifications/recipients.ts:150`

```ts
    146 |           /*
    147 |            * Transitional Admin fallback.
    148 |            */
    149 |           {
>   150 |             legacyRole:
    151 |               "admin",
    152 |           },
    153 | 
    154 |           /*
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/notifications/recipients.ts:210`

```ts
    206 |       select: {
    207 |         id:
    208 |           true,
    209 | 
>   210 |         legacyRole:
    211 |           true,
    212 |       },
    213 |     });
    214 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/notifications/recipients.ts:224`

```ts
    220 |         recipientId:
    221 |           account.id,
    222 | 
    223 |         recipientRole:
>   224 |           account.legacyRole ??
    225 |           "access-control",
    226 |       }),
    227 |     ),
    228 |   );
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/notifications/recipients.ts:304`

```ts
    300 |       select: {
    301 |         id:
    302 |           true,
    303 | 
>   304 |         legacyRole:
    305 |           true,
    306 |       },
    307 |     });
    308 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/access.ts:212`

```ts
    208 |    * report-card review state.
    209 |    */
    210 |   if (
    211 |     role !== "admin" &&
>   212 |     role !== "teacher"
    213 |   ) {
    214 |     return null;
    215 |   }
    216 | 
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/report-cards/auth.ts:260`

```ts
    256 |       reportCardAuthority: false,
    257 |     };
    258 |   }
    259 | 
>   260 |   const legacyRole = accessActor.actor.legacyRole?.trim().toLowerCase();
    261 | 
    262 |   const administrator = legacyRole === "admin" || legacyRole === "super_admin";
    263 | 
    264 |   /*
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/report-cards/auth.ts:262`

```ts
    258 |   }
    259 | 
    260 |   const legacyRole = accessActor.actor.legacyRole?.trim().toLowerCase();
    261 | 
>   262 |   const administrator = legacyRole === "admin" || legacyRole === "super_admin";
    263 | 
    264 |   /*
    265 |    * Transitional workspace-level RBAC check.
    266 |    *
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### PERMISSION_PREFIX

`src/lib/report-cards/auth.ts:276`

```ts
    272 |    * should continue to be enforced at the action/API
    273 |    * level as we finish the authorization audit.
    274 |    */
    275 |   const reportCardAuthority = Array.from(accessActor.permissions).some(
>   276 |     (permission) => permission.trim().toLowerCase().startsWith("report_cards."),
    277 |   );
    278 | 
    279 |   return {
    280 |     accessActor,
```

Recommendation: Good for workspace/navigation visibility; sensitive actions should use exact permissions.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/auth.ts:308`

```ts
    304 |    *
    305 |    * to scope data to classes/subjects assigned to the
    306 |    * authenticated teacher.
    307 |    */
>   308 |   if (user.role === "teacher") {
    309 |     return {
    310 |       ...user,
    311 | 
    312 |       role: "teacher",
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/generation-validator.ts:160`

```ts
    156 |   } = await requireReportCardUser();
    157 | 
    158 |   if (
    159 |     role !== "admin" &&
>   160 |     role !== "teacher"
    161 |   ) {
    162 |     throw new Error(
    163 |       "UNAUTHORISED",
    164 |     );
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/generation-validator.ts:239`

```ts
    235 |     prisma.class.findFirst({
    236 |       where: {
    237 |         id: classId,
    238 | 
>   239 |         ...(role === "teacher"
    240 |           ? {
    241 |               lessons: {
    242 |                 some: {
    243 |                   teacherId:
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:319`

```ts
    315 |             status,
    316 |           }
    317 |         : {}),
    318 | 
>   319 |       ...(role === "teacher"
    320 |         ? {
    321 |             class: {
    322 |               lessons: {
    323 |                 some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/report-cards/queries.ts:416`

```ts
    412 | 
    413 | export async function getStudentReportCards() {
    414 |   const { userId, role } = await requireReportCardUser();
    415 | 
>   416 |   if (role !== "student") {
    417 |     throw new Error("UNAUTHORISED");
    418 |   }
    419 | 
    420 |   return prisma.reportCard.findMany({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:464`

```ts
    460 | 
    461 | export async function getParentChildReportCards(childId: string) {
    462 |   const { userId, role } = await requireReportCardUser();
    463 | 
>   464 |   if (role !== "parent") {
    465 |     throw new Error("UNAUTHORISED");
    466 |   }
    467 | 
    468 |   if (!childId.trim()) {
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:791`

```ts
    787 | 
    788 |   const academicYear = filters.academicYear?.trim();
    789 | 
    790 |   const ownershipWhere: Prisma.ReportCardWhereInput =
>   791 |     role === "teacher"
    792 |       ? {
    793 |           class: {
    794 |             lessons: {
    795 |               some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1061`

```ts
   1057 |     }),
   1058 | 
   1059 |     prisma.class.findMany({
   1060 |       where:
>  1061 |         role === "teacher"
   1062 |           ? {
   1063 |               lessons: {
   1064 |                 some: {
   1065 |                   teacherId: userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:1229`

```ts
   1225 | 
   1226 | export async function getParentChildrenForReportCards() {
   1227 |   const { userId, role } = await requireReportCardUser();
   1228 | 
>  1229 |   if (role !== "parent") {
   1230 |     throw new Error("UNAUTHORISED");
   1231 |   }
   1232 | 
   1233 |   const children = await prisma.student.findMany({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_STUDENT_CHECK

`src/lib/report-cards/queries.ts:1329`

```ts
   1325 |    * to view this report elsewhere, but they should
   1326 |    * not enter through a student-owned route.
   1327 |    */
   1328 |   if (
>  1329 |     role !==
   1330 |     "student"
   1331 |   ) {
   1332 |     return null;
   1333 |   }
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:1391`

```ts
   1387 |   } =
   1388 |     await requireReportCardUser();
   1389 | 
   1390 |   if (
>  1391 |     role !==
   1392 |     "parent"
   1393 |   ) {
   1394 |     return null;
   1395 |   }
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1441`

```ts
   1437 | 
   1438 | export async function getTeacherManageableClass(classId: number) {
   1439 |   const { userId, role } = await requireReportCardUser();
   1440 | 
>  1441 |   if (role !== "teacher" || !Number.isInteger(classId) || classId <= 0) {
   1442 |     return null;
   1443 |   }
   1444 | 
   1445 |   return prisma.class.findFirst({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1570`

```ts
   1566 |   pageSize?: number;
   1567 | }) {
   1568 |   const { userId, role } = await requireReportCardUser();
   1569 | 
>  1570 |   if (role !== "teacher") {
   1571 |     throw new Error("UNAUTHORISED");
   1572 |   }
   1573 | 
   1574 |   const manageableClass = await prisma.class.findFirst({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2007`

```ts
   2003 |   } =
   2004 |     await requireReportCardUser();
   2005 | 
   2006 |   if (
>  2007 |     role !==
   2008 |     "teacher"
   2009 |   ) {
   2010 |     return null;
   2011 |   }
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2064`

```ts
   2060 | 
   2061 |   const [classes, terms, weightingYears] = await prisma.$transaction([
   2062 |     prisma.class.findMany({
   2063 |       where:
>  2064 |         role === "teacher"
   2065 |           ? {
   2066 |               lessons: {
   2067 |                 some: {
   2068 |                   teacherId: userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2125`

```ts
   2121 |     prisma.academicWeighting.findMany({
   2122 |       where: {
   2123 |         isActive: true,
   2124 | 
>  2125 |         ...(role === "teacher"
   2126 |           ? {
   2127 |               grade: {
   2128 |                 classess: {
   2129 |                   some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2220`

```ts
   2216 |   const reportCard = await prisma.reportCard.findFirst({
   2217 |     where: {
   2218 |       id: reportCardId,
   2219 | 
>  2220 |       ...(role === "teacher"
   2221 |         ? {
   2222 |             class: {
   2223 |               lessons: {
   2224 |                 some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/review-permissions.ts:164`

```ts
    160 |     role ===
    161 |       "custom";
    162 | 
    163 |   const isTeacher =
>   164 |     role ===
    165 |     "teacher";
    166 | 
    167 |   /* ------------------------------------------------------------------------ */
    168 |   /* REPORT STATE                                                             */
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/command-centre-queries.ts:35`

```ts
     31 |       role?: string;
     32 |     }
     33 |   )?.role;
     34 | 
>    35 |   if (role !== "admin" && role !== "teacher") {
     36 |     throw new Error("UNAUTHORISED");
     37 |   }
     38 | 
     39 |   return {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/command-centre-queries.ts:734`

```ts
    730 |     }),
    731 | 
    732 |     prisma.class.findMany({
    733 |       where:
>   734 |         manager.role === "teacher"
    735 |           ? {
    736 |               lessons: {
    737 |                 some: {
    738 |                   teacherId: manager.userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/command-centre-queries.ts:756`

```ts
    752 |     }),
    753 | 
    754 |     prisma.subject.findMany({
    755 |       where:
>   756 |         manager.role === "teacher"
    757 |           ? {
    758 |               lessons: {
    759 |                 some: {
    760 |                   teacherId: manager.userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/command-centre-queries.ts:778`

```ts
    774 |     }),
    775 | 
    776 |     prisma.student.findMany({
    777 |       where:
>   778 |         manager.role === "teacher"
    779 |           ? {
    780 |               class: {
    781 |                 lessons: {
    782 |                   some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/results/queries.ts:1047`

```ts
   1043 |   } =
   1044 |     await getCurrentResultUser();
   1045 | 
   1046 |   if (
>  1047 |     role !==
   1048 |     "student"
   1049 |   ) {
   1050 |     throw new Error(
   1051 |       "UNAUTHORISED",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/results/queries.ts:1087`

```ts
   1083 |   } =
   1084 |     await getCurrentResultUser();
   1085 | 
   1086 |   if (
>  1087 |     role !==
   1088 |     "parent"
   1089 |   ) {
   1090 |     return null;
   1091 |   }
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/student-profile-queries.ts:46`

```ts
     42 |   )?.role;
     43 | 
     44 |   if (
     45 |     role !== "admin" &&
>    46 |     role !== "teacher"
     47 |   ) {
     48 |     throw new Error(
     49 |       "UNAUTHORISED",
     50 |     );
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/student-profile-queries.ts:356`

```ts
    352 |     await prisma.student.findFirst({
    353 |       where: {
    354 |         id: studentId,
    355 | 
>   356 |         ...(manager.role ===
    357 |         "teacher"
    358 |           ? {
    359 |               class: {
    360 |                 lessons: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/results/student-profile-queries.ts:670`

```ts
    666 |           some: {
    667 |             classId:
    668 |               student.class.id,
    669 | 
>   670 |             ...(manager.role ===
    671 |             "teacher"
    672 |               ? {
    673 |                   teacherId:
    674 |                     manager.userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/users/current-school-profile.ts:411`

```ts
    407 | 
    408 |         imageUrl:
    409 |           string | null;
    410 | 
>   411 |         legacyRole:
    412 |           string | null;
    413 |       }
    414 |     | null =
    415 |     null;
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/users/current-school-profile.ts:435`

```ts
    431 | 
    432 |           imageUrl:
    433 |             true,
    434 | 
>   435 |           legacyRole:
    436 |             true,
    437 |         },
    438 |       });
    439 |   } catch (
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/users/current-school-profile.ts:691`

```ts
    687 |    */
    688 |   const roleKey =
    689 |     rawRole ||
    690 |     account
>   691 |       ?.legacyRole ||
    692 |     "account";
    693 | 
    694 |   return {
    695 |     id:
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.
