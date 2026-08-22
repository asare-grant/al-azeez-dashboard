# Authorization Migration Audit

Generated: 2026-08-20T23:37:12.281Z

## Executive Summary

- Files scanned: **734**
- Total findings: **729**
- Migration risk score: **3295**
- Good RBAC signals: **144**

## Severity Summary

| Severity | Count |
|---|---:|
| CRITICAL | 285 |
| HIGH | 41 |
| MEDIUM | 22 |
| REVIEW | 196 |
| INFO | 41 |
| GOOD | 144 |

## Migration Classes

| Class | Count |
|---|---:|
| MUTATION_RISK | 285 |
| LEGACY_ROLE | 142 |
| CENTRALIZED | 134 |
| ROLE_SCOPE_REVIEW | 54 |
| LEGACY_ROLE_GUARD | 41 |
| AUTH_ONLY_REVIEW | 41 |
| CLAIMS | 17 |
| MUTATION_PROTECTED | 10 |
| LEGACY_ROUTE_GUARD | 4 |
| REDIRECT | 1 |

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

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/attendance/update/[id]/route.ts:167`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    163 |     /* UPDATE                                                                 */
    164 |     /* ---------------------------------------------------------------------- */
    165 | 
    166 |     const updated =
>   167 |       await prisma.attendance.update({
    168 |         where: {
    169 |           id:
    170 |             attendanceId,
    171 |         },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/app/api/attendance/upsert/route.ts:303`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
    299 |               },
    300 |             });
    301 | 
    302 |           const attendance =
>   303 |             await tx.attendance.upsert({
    304 |               where: {
    305 |                 studentId_date: {
    306 |                   studentId,
    307 | 
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

**File:** `src/app/api/generate-invoices/route.ts:331`

**File type:** API_ROUTE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    327 |             );
    328 |           }
    329 | 
    330 |           const feeMaster =
>   331 |             await tx.feeMaster.create({
    332 |               data: {
    333 |                 studentId:
    334 |                   student.id,
    335 | 
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

**File:** `src/components/NavbarClient.tsx:214`

**File type:** COMPONENT

**Migration class:** REDIRECT

**Match:** `\`/${role}\``

```ts
    210 | 
    211 |                 {/* ACCOUNT BUTTON */}
    212 | 
    213 |                 <Link
>   214 |                   href={`/${role}`}
    215 |                   className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-black text-slate-700 transition-all duration-200 hover:bg-slate-200 hover:text-slate-950"
    216 |                 >
    217 |                   <UserRound className="h-4 w-4" />
    218 |                   View your dashboard
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

**File:** `src/lib/access-control/provisioning-service.ts:374`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    370 |       const displayName = `${identity.firstName} ${identity.lastName}`.trim();
    371 | 
    372 |       /* USER ACCOUNT */
    373 | 
>   374 |       await tx.userAccount.create({
    375 |         data: {
    376 |           id: clerkUser.id,
    377 | 
    378 |           username: identity.username,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:427`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    423 |       });
    424 | 
    425 |       /* ROLE ASSIGNMENTS */
    426 | 
>   427 |       await tx.userRoleAssignment.createMany({
    428 |         data: roles.map((role) => ({
    429 |           userId: clerkUser.id,
    430 | 
    431 |           roleId: role.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:443`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    439 |       });
    440 | 
    441 |       /* USER CREATED AUDIT */
    442 | 
>   443 |       await tx.accessAuditLog.create({
    444 |         data: {
    445 |           action: "USER_CREATED",
    446 | 
    447 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/provisioning-service.ts:468`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    464 | 
    465 |       /* ROLE ASSIGNMENT AUDITS */
    466 | 
    467 |       if (roles.length > 0) {
>   468 |         await tx.accessAuditLog.createMany({
    469 |           data: roles.map((role) => ({
    470 |             action: "ROLE_ASSIGNED" as const,
    471 | 
    472 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:182`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    178 |       /* -------------------------------------------------------------- */
    179 |       /* ROLE                                                           */
    180 |       /* -------------------------------------------------------------- */
    181 | 
>   182 |       const createdRole = await tx.accessRole.create({
    183 |         data: {
    184 |           key,
    185 | 
    186 |           name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:211`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    207 |       /* PERMISSIONS                                                    */
    208 |       /* -------------------------------------------------------------- */
    209 | 
    210 |       if (validPermissions.length > 0) {
>   211 |         await tx.rolePermission.createMany({
    212 |           data: validPermissions.map((permission) => ({
    213 |             roleId: createdRole.id,
    214 | 
    215 |             permissionId: permission.id,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:228`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    224 |       /* -------------------------------------------------------------- */
    225 |       /* AUDIT                                                          */
    226 |       /* -------------------------------------------------------------- */
    227 | 
>   228 |       await tx.accessAuditLog.create({
    229 |         data: {
    230 |           action: "ROLE_CREATED",
    231 | 
    232 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:370`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    366 |       if (duplicate) {
    367 |         throw new Error("ROLE_ALREADY_EXISTS");
    368 |       }
    369 | 
>   370 |       const clonedRole = await tx.accessRole.create({
    371 |         data: {
    372 |           key,
    373 | 
    374 |           name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:397`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    393 |         },
    394 |       });
    395 | 
    396 |       if (sourceRole.permissions.length > 0) {
>   397 |         await tx.rolePermission.createMany({
    398 |           data: sourceRole.permissions.map((item) => ({
    399 |             roleId: clonedRole.id,
    400 | 
    401 |             permissionId: item.permissionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:408`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    404 |           })),
    405 |         });
    406 |       }
    407 | 
>   408 |       await tx.accessAuditLog.create({
    409 |         data: {
    410 |           action: "ROLE_CREATED",
    411 | 
    412 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/role-service.ts:532`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    528 |       if (duplicateName) {
    529 |         throw new Error("ROLE_NAME_EXISTS");
    530 |       }
    531 | 
>   532 |       await tx.accessRole.update({
    533 |         where: {
    534 |           id: roleId,
    535 |         },
    536 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:544`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    540 |           description: normalizeDescription(description),
    541 |         },
    542 |       });
    543 | 
>   544 |       await tx.accessAuditLog.create({
    545 |         data: {
    546 |           action: "ROLE_UPDATED",
    547 | 
    548 |           actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/access-control/role-service.ts:680`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    676 | 
    677 |       const toRemove = Array.from(existing).filter((id) => !requested.has(id));
    678 | 
    679 |       if (toRemove.length > 0) {
>   680 |         await tx.rolePermission.deleteMany({
    681 |           where: {
    682 |             roleId,
    683 | 
    684 |             permissionId: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:692`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    688 |         });
    689 |       }
    690 | 
    691 |       if (toAdd.length > 0) {
>   692 |         await tx.rolePermission.createMany({
    693 |           data: toAdd.map((permissionId) => ({
    694 |             roleId,
    695 | 
    696 |             permissionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:709`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    705 |       /*
    706 |        * Write individual audit entries.
    707 |        */
    708 |       if (toAdd.length > 0) {
>   709 |         await tx.accessAuditLog.createMany({
    710 |           data: toAdd.map((permissionId) => ({
    711 |             action: "PERMISSION_ADDED" as const,
    712 | 
    713 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:727`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `createMany(`

```ts
    723 |         });
    724 |       }
    725 | 
    726 |       if (toRemove.length > 0) {
>   727 |         await tx.accessAuditLog.createMany({
    728 |           data: toRemove.map((permissionId) => ({
    729 |             action: "PERMISSION_REMOVED" as const,
    730 | 
    731 |             actorId: actor.userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/access-control/role-service.ts:833`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    829 |        * We allow historical assignments to remain.
    830 |        * Once isActive=false, the authorization context
    831 |        * already ignores this role.
    832 |        */
>   833 |       await tx.accessRole.update({
    834 |         where: {
    835 |           id: role.id,
    836 |         },
    837 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/access-control/role-service.ts:843`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    839 |           isActive: false,
    840 |         },
    841 |       });
    842 | 
>   843 |       await tx.accessAuditLog.create({
    844 |         data: {
    845 |           action: "ROLE_UPDATED",
    846 | 
    847 |           actorId: actor.userId,
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

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:501`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    497 |     /* ---------------------------------------------------------------------- */
    498 |     /* DOMAIN RECORD                                                          */
    499 |     /* ---------------------------------------------------------------------- */
    500 | 
>   501 |     await prisma.teacher.update({
    502 |       where: {
    503 |         id: data.id,
    504 |       },
    505 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:720`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    716 |     /* DATABASE                                                               */
    717 |     /* ---------------------------------------------------------------------- */
    718 | 
    719 |     try {
>   720 |       await prisma.student.create({
    721 |         data: {
    722 |           id: user.id,
    723 | 
    724 |           username: data.username,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:897`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    893 |     /* ---------------------------------------------------------------------- */
    894 |     /* DATABASE                                                               */
    895 |     /* ---------------------------------------------------------------------- */
    896 | 
>   897 |     await prisma.student.update({
    898 |       where: {
    899 |         id: data.id,
    900 |       },
    901 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:1068`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1064 |       publicMetadata: { role: "parent" },
   1065 |     });
   1066 | 
   1067 |     // Create parent in Prisma
>  1068 |     await prisma.parent.create({
   1069 |       data: {
   1070 |         id: user.id, // Clerk user id as parent id
   1071 |         username: data.username,
   1072 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:1110`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1106 |       lastName: data.surname,
   1107 |     });
   1108 | 
   1109 |     // Update Prisma parent record
>  1110 |     await prisma.parent.update({
   1111 |       where: { id: data.id },
   1112 |       data: {
   1113 |         username: data.username,
   1114 |         name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1150`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
   1146 |   try {
   1147 |     const client = await clerkClient();
   1148 | 
   1149 |     // 1️⃣ Delete associated students first (if any)
>  1150 |     await prisma.student.deleteMany({
   1151 |       where: { parentId: id },
   1152 |     });
   1153 | 
   1154 |     // 2️⃣ Delete parent from Prisma
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1155`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1151 |       where: { parentId: id },
   1152 |     });
   1153 | 
   1154 |     // 2️⃣ Delete parent from Prisma
>  1155 |     await prisma.parent.delete({
   1156 |       where: { id },
   1157 |     });
   1158 | 
   1159 |     // 3️⃣ Delete parent from Clerk
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1173`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1169 |       console.warn(
   1170 |         "⚠️ Parent not found in Clerk. Continuing with Prisma deletion.",
   1171 |       );
   1172 |       try {
>  1173 |         await prisma.parent.delete({ where: { id } });
   1174 |         return { success: true, error: false };
   1175 |       } catch (prismaErr) {
   1176 |         console.error("❌ Error deleting parent from Prisma:", prismaErr);
   1177 |       }
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:1268`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1264 |     /* ---------------------------------------------------------------------- */
   1265 |     /* CREATE                                                                 */
   1266 |     /* ---------------------------------------------------------------------- */
   1267 | 
>  1268 |     await prisma.exam.create({
   1269 |       data: {
   1270 |         title: data.title,
   1271 | 
   1272 |         startTime: data.startTime,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:1437`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1433 |     /* ---------------------------------------------------------------------- */
   1434 |     /* UPDATE                                                                 */
   1435 |     /* ---------------------------------------------------------------------- */
   1436 | 
>  1437 |     await prisma.exam.update({
   1438 |       where: {
   1439 |         id: data.id,
   1440 |       },
   1441 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1542`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1538 |         };
   1539 |       }
   1540 |     }
   1541 | 
>  1542 |     await prisma.exam.delete({
   1543 |       where: {
   1544 |         id: examId,
   1545 |       },
   1546 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:1619`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1615 |     /* ---------------------------------------------------------------------- */
   1616 |     /* CREATE                                                                 */
   1617 |     /* ---------------------------------------------------------------------- */
   1618 | 
>  1619 |     await prisma.lesson.create({
   1620 |       data: {
   1621 |         name: data.name,
   1622 | 
   1623 |         day: data.day,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:1728`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1724 |     const startTime = new Date(`1970-01-01T${data.startTime}:00Z`);
   1725 | 
   1726 |     const endTime = new Date(`1970-01-01T${data.endTime}:00Z`);
   1727 | 
>  1728 |     await prisma.lesson.update({
   1729 |       where: {
   1730 |         id: data.id,
   1731 |       },
   1732 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:1821`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1817 |         };
   1818 |       }
   1819 |     }
   1820 | 
>  1821 |     await prisma.lesson.delete({
   1822 |       where: {
   1823 |         id: lessonId,
   1824 |       },
   1825 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:1960`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1956 |     /* -------------------------------------------------------------------- */
   1957 |     /* CREATE                                                               */
   1958 |     /* -------------------------------------------------------------------- */
   1959 | 
>  1960 |     await prisma.assignment.create({
   1961 |       data: {
   1962 |         title: data.title,
   1963 | 
   1964 |         startDate: data.startDate,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2136`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2132 |     /* -------------------------------------------------------------------- */
   2133 |     /* UPDATE                                                               */
   2134 |     /* -------------------------------------------------------------------- */
   2135 | 
>  2136 |     await prisma.assignment.update({
   2137 |       where: {
   2138 |         id: data.id,
   2139 |       },
   2140 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:2260`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   2256 |     /* -------------------------------------------------------------------- */
   2257 |     /* DELETE                                                               */
   2258 |     /* -------------------------------------------------------------------- */
   2259 | 
>  2260 |     await prisma.assignment.delete({
   2261 |       where: {
   2262 |         id: assignmentId,
   2263 |       },
   2264 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:2741`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   2737 |    * Keep NotificationEvent as historical/audit data,
   2738 |    * but hide deliveries that describe an obsolete
   2739 |    * event schedule.
   2740 |    */
>  2741 |   await tx.notification.updateMany({
   2742 |     where: {
   2743 |       archivedAt: null,
   2744 | 
   2745 |       event: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:2839`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2835 |     /* ---------------------------------------------------------------------- */
   2836 | 
   2837 |     const event = await prisma.$transaction(
   2838 |       async (tx) => {
>  2839 |         const created = await tx.event.create({
   2840 |           data: {
   2841 |             title: values.title,
   2842 | 
   2843 |             description: values.description,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3074`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3070 |         /* -------------------------------------------------------------- */
   3071 |         /* UPDATE                                                         */
   3072 |         /* -------------------------------------------------------------- */
   3073 | 
>  3074 |         const updated = await tx.event.update({
   3075 |           where: {
   3076 |             id: eventId,
   3077 |           },
   3078 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3324`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3320 | 
   3321 |           actorName,
   3322 |         });
   3323 | 
>  3324 |         await tx.event.delete({
   3325 |           where: {
   3326 |             id: eventId,
   3327 |           },
   3328 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3427`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3423 |     /* ---------------------------------------------------------------------- */
   3424 |     /* CREATE                                                                 */
   3425 |     /* ---------------------------------------------------------------------- */
   3426 | 
>  3427 |     const announcement = await prisma.announcement.create({
   3428 |       data: {
   3429 |         title: data.title,
   3430 | 
   3431 |         description: data.description,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3551`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3547 |         message: "The announcement could not be found.",
   3548 |       };
   3549 |     }
   3550 | 
>  3551 |     await prisma.announcement.update({
   3552 |       where: {
   3553 |         id: announcementId,
   3554 |       },
   3555 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3642`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3638 |         message: "The announcement could not be found.",
   3639 |       };
   3640 |     }
   3641 | 
>  3642 |     await prisma.announcement.delete({
   3643 |       where: {
   3644 |         id: announcementId,
   3645 |       },
   3646 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3696`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3692 | ) => {
   3693 |   try {
   3694 |     await requireFinancePermission("finance.structure.manage");
   3695 | 
>  3696 |     await prisma.feeCategory.create({
   3697 |       data: {
   3698 |         name: data.name,
   3699 |       },
   3700 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3727`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3723 | 
   3724 |   try {
   3725 |     await requireFinancePermission("finance.structure.manage");
   3726 | 
>  3727 |     await prisma.feeCategory.update({
   3728 |       where: { id: data.id },
   3729 |       data: { name: data.name },
   3730 |     });
   3731 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3746`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3742 | 
   3743 |   try {
   3744 |     await requireFinancePermission("finance.structure.manage");
   3745 | 
>  3746 |     await prisma.feeCategory.delete({ where: { id: parseInt(id) } });
   3747 |     return { success: true, error: false };
   3748 |   } catch (err) {
   3749 |     console.log("DELETE FEE CATEGORY ERROR:", err);
   3750 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3758`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3754 | export const createFeeType = async (currentState: any, data: FeeTypeSchema) => {
   3755 |   try {
   3756 |     await requireFinancePermission("finance.structure.manage");
   3757 | 
>  3758 |     await prisma.feeType.create({
   3759 |       data: {
   3760 |         name: data.name,
   3761 |         categoryId: data.categoryId,
   3762 |       },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3778`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3774 | 
   3775 |   try {
   3776 |     await requireFinancePermission("finance.structure.manage");
   3777 | 
>  3778 |     await prisma.feeType.update({
   3779 |       where: { id: data.id },
   3780 |       data: {
   3781 |         name: data.name,
   3782 |         categoryId: data.categoryId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3800`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3796 | 
   3797 |   try {
   3798 |     await requireFinancePermission("finance.structure.manage");
   3799 | 
>  3800 |     await prisma.feeType.delete({ where: { id: parseInt(id) } });
   3801 |     return { success: true, error: false };
   3802 |   } catch (err) {
   3803 |     console.log("DELETE FEE TYPE ERROR:", err);
   3804 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3815`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3811 | ) => {
   3812 |   try {
   3813 |     await requireFinancePermission("finance.structure.manage");
   3814 | 
>  3815 |     await prisma.feeStructure.create({
   3816 |       data: {
   3817 |         amount: data.amount,
   3818 |         studentType: data.studentType,
   3819 |         boardingType: data.boardingType,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3842`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3838 | 
   3839 |   try {
   3840 |     await requireFinancePermission("finance.structure.manage");
   3841 | 
>  3842 |     await prisma.feeStructure.update({
   3843 |       where: { id: data.id },
   3844 |       data: {
   3845 |         amount: data.amount,
   3846 |         studentType: data.studentType,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3868`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3864 | 
   3865 |   try {
   3866 |     await requireFinancePermission("finance.structure.manage");
   3867 | 
>  3868 |     await prisma.feeStructure.delete({ where: { id: parseInt(id) } });
   3869 |     return { success: true, error: false };
   3870 |   } catch (err) {
   3871 |     console.log("DELETE FEE STRUCTURE ERROR:", err);
   3872 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3883`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3879 | ) => {
   3880 |   try {
   3881 |     await requireFinancePermission("finance.invoices.manage");
   3882 | 
>  3883 |     await prisma.feeMaster.create({
   3884 |       data: {
   3885 |         studentId: data.studentId,
   3886 |         term: data.term,
   3887 |         academicYear: data.academicYear,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3909`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3905 | 
   3906 |   try {
   3907 |     await requireFinancePermission("finance.invoices.manage");
   3908 | 
>  3909 |     await prisma.feeMaster.update({
   3910 |       where: { id: data.id },
   3911 |       data: {
   3912 |         studentId: data.studentId,
   3913 |         term: data.term,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3934`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3930 | 
   3931 |   try {
   3932 |     await requireFinancePermission("finance.invoices.manage");
   3933 | 
>  3934 |     await prisma.feeMaster.delete({ where: { id: parseInt(id) } });
   3935 |     return { success: true, error: false };
   3936 |   } catch (err) {
   3937 |     console.log("DELETE FEE MASTER ERROR:", err);
   3938 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:3946`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   3942 | export const createFee = async (currentState: any, data: FeeSchema) => {
   3943 |   try {
   3944 |     await requireFinancePermission("finance.invoices.manage");
   3945 | 
>  3946 |     await prisma.fee.create({
   3947 |       data: {
   3948 |         masterId: data.masterId,
   3949 |         structureId: data.structureId,
   3950 |         amount: data.amount,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:3967`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   3963 | 
   3964 |   try {
   3965 |     await requireFinancePermission("finance.invoices.manage");
   3966 | 
>  3967 |     await prisma.fee.update({
   3968 |       where: { id: data.id },
   3969 |       data: {
   3970 |         masterId: data.masterId,
   3971 |         structureId: data.structureId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:3990`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   3986 | 
   3987 |   try {
   3988 |     await requireFinancePermission("finance.invoices.manage");
   3989 | 
>  3990 |     await prisma.fee.delete({ where: { id: parseInt(id) } });
   3991 |     return { success: true, error: false };
   3992 |   } catch (err) {
   3993 |     console.log("DELETE FEE ERROR:", err);
   3994 |     return { success: false, error: true };
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:4129`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   4125 |             )}.`,
   4126 |           );
   4127 |         }
   4128 | 
>  4129 |         const payment = await tx.feePayment.create({
   4130 |           data: {
   4131 |             masterId: data.masterId,
   4132 | 
   4133 |             amount: data.amount,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4288`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   4284 |         /* ------------------------------------------------------------------ */
   4285 |         /* UPDATE PAYMENT                                                     */
   4286 |         /* ------------------------------------------------------------------ */
   4287 | 
>  4288 |         await tx.feePayment.update({
   4289 |           where: {
   4290 |             id: data.id!,
   4291 |           },
   4292 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/actions.ts:4413`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   4409 |       };
   4410 |     }
   4411 | 
   4412 |     await prisma.$transaction(async (tx) => {
>  4413 |       await tx.feePayment.delete({
   4414 |         where: {
   4415 |           id: payment.id,
   4416 |         },
   4417 |       });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:4529`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   4525 |   /* ------------------------------------------------------------------------ */
   4526 |   /* CREATE INVOICE                                                           */
   4527 |   /* ------------------------------------------------------------------------ */
   4528 | 
>  4529 |   return prisma.feeMaster.create({
   4530 |     data: {
   4531 |       studentId,
   4532 | 
   4533 |       term,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:4561`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   4557 |   currentState: CurrentState,
   4558 |   data: AttendanceSchema,
   4559 | ) => {
   4560 |   try {
>  4561 |     await prisma.attendance.create({
   4562 |       data: {
   4563 |         date: data.date,
   4564 |         present: data.present,
   4565 |         day: data.day,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4584`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   4580 | ) => {
   4581 |   if (!data.id) return { success: false, error: true };
   4582 | 
   4583 |   try {
>  4584 |     await prisma.attendance.update({
   4585 |       where: { id: data.id },
   4586 |       data: {
   4587 |         date: data.date,
   4588 |         present: data.present,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4805`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   4801 |          * The school has one current active
   4802 |          * term across the application.
   4803 |          */
   4804 |         if (data.isActive) {
>  4805 |           await tx.schoolTerm.updateMany({
   4806 |             where: {
   4807 |               isActive: true,
   4808 | 
   4809 |               ...(data.id
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:4870`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   4866 |           const termDateRangeChanged =
   4867 |             existing.startDate.getTime() !== startDate.getTime() ||
   4868 |             existing.endDate.getTime() !== endDate.getTime();
   4869 | 
>  4870 |           const updated = await tx.schoolTerm.update({
   4871 |             where: {
   4872 |               id: data.id,
   4873 |             },
   4874 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:4968`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   4964 |         /* ------------------------------------------------------------ */
   4965 |         /*                         CREATE                               */
   4966 |         /* ------------------------------------------------------------ */
   4967 | 
>  4968 |         const created = await tx.schoolTerm.create({
   4969 |           data: {
   4970 |             academicYearId: data.academicYearId,
   4971 | 
   4972 |             name: data.name,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/actions.ts:5110`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   5106 |           },
   5107 |         });
   5108 |       }
   5109 | 
>  5110 |       return tx.schoolAcademicYear.create({
   5111 |         data: {
   5112 |           name,
   5113 | 
   5114 |           startDate: data.startDate,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:5213`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   5209 |         throw new Error("The academic year could not be found.");
   5210 |       }
   5211 | 
   5212 |       if (data.isActive) {
>  5213 |         await tx.schoolAcademicYear.updateMany({
   5214 |           where: {
   5215 |             isActive: true,
   5216 | 
   5217 |             NOT: {
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/actions.ts:5228`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   5224 |           },
   5225 |         });
   5226 |       }
   5227 | 
>  5228 |       return tx.schoolAcademicYear.update({
   5229 |         where: {
   5230 |           id: data.id,
   5231 |         },
   5232 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:219`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
    215 |     const currentYear = now.getFullYear();
    216 | 
    217 |     const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;
    218 | 
>   219 |     const assessment = await prisma.assessment.create({
    220 |       data: {
    221 |         title: "Untitled Assessment",
    222 |         instructions: "",
    223 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:351`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    347 |         return assessmentFailure("You cannot use the selected lesson.");
    348 |       }
    349 |     }
    350 | 
>   351 |     const assessment = await prisma.assessment.update({
    352 |       where: {
    353 |         id: data.id,
    354 |       },
    355 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:536`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
    532 |          *
    533 |          * AssessmentQuestion -> AssessmentOption cascades through
    534 |          * the Prisma relations defined in the schema.
    535 |          */
>   536 |         await tx.assessmentQuestion.deleteMany({
    537 |           where: {
    538 |             assessmentId: data.id,
    539 |           },
    540 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:542`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    538 |             assessmentId: data.id,
    539 |           },
    540 |         });
    541 | 
>   542 |         return tx.assessment.update({
    543 |           where: {
    544 |             id: data.id,
    545 |           },
    546 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:781`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    777 |     console.log("PUBLISH: updating status", nextStatus);
    778 | 
    779 |     const published = await prisma.$transaction(
    780 |       async (tx) => {
>   781 |         const updated = await tx.assessment.update({
    782 |           where: {
    783 |             id: assessment.id,
    784 |           },
    785 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:948`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
    944 |         "This assessment cannot return to draft because students have already started it.",
    945 |       );
    946 |     }
    947 | 
>   948 |     await prisma.assessment.update({
    949 |       where: {
    950 |         id: assessmentId,
    951 |       },
    952 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1014`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1010 |     if (assessment.status === "ARCHIVED") {
   1011 |       return assessmentFailure("Archived assessments cannot be closed.");
   1012 |     }
   1013 | 
>  1014 |     await prisma.assessment.update({
   1015 |       where: {
   1016 |         id: assessmentId,
   1017 |       },
   1018 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1098`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1094 |     if (!assessment) {
   1095 |       return assessmentFailure("The assessment could not be found.");
   1096 |     }
   1097 | 
>  1098 |     await prisma.assessment.update({
   1099 |       where: {
   1100 |         id: assessmentId,
   1101 |       },
   1102 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:1186`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1182 |     const now = new Date();
   1183 | 
   1184 |     const newDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
   1185 | 
>  1186 |     const duplicate = await prisma.assessment.create({
   1187 |       data: {
   1188 |         title: `${source.title} â€” Copy`,
   1189 |         instructions: source.instructions,
   1190 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:1327`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `delete(`

```ts
   1323 |         "This assessment has student records and cannot be permanently deleted.",
   1324 |       );
   1325 |     }
   1326 | 
>  1327 |     await prisma.assessment.delete({
   1328 |       where: {
   1329 |         id: assessmentId,
   1330 |       },
   1331 |     });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_DELETE

**File:** `src/lib/assessments/actions.ts:1416`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `deleteMany(`

```ts
   1412 |         if (existing.status !== "DRAFT" || existing._count.attempts > 0) {
   1413 |           throw new Error("PUBLISHED_ASSESSMENT_LOCKED");
   1414 |         }
   1415 | 
>  1416 |         await tx.assessmentQuestion.deleteMany({
   1417 |           where: {
   1418 |             assessmentId: input.id,
   1419 |           },
   1420 |         });
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1422`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1418 |             assessmentId: input.id,
   1419 |           },
   1420 |         });
   1421 | 
>  1422 |         return tx.assessment.update({
   1423 |           where: {
   1424 |             id: input.id,
   1425 |           },
   1426 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1671`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1667 |           )
   1668 |           .map((attempt) => attempt.id);
   1669 | 
   1670 |         if (staleAttemptIds.length > 0) {
>  1671 |           await tx.assessmentAttempt.updateMany({
   1672 |             where: {
   1673 |               id: {
   1674 |                 in: staleAttemptIds,
   1675 |               },
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:1704`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   1700 | 
   1701 |           durationMinutes: assessment.durationMinutes,
   1702 |         });
   1703 | 
>  1704 |         const attempt = await tx.assessmentAttempt.create({
   1705 |           data: {
   1706 |             assessmentId,
   1707 |             studentId: userId,
   1708 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1914`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `upsert(`

```ts
   1910 |           );
   1911 |         }
   1912 |       }
   1913 | 
>  1914 |       const answer = await tx.assessmentAnswer.upsert({
   1915 |         where: {
   1916 |           attemptId_questionId: {
   1917 |             attemptId,
   1918 |             questionId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:1963`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   1959 |           updatedAt: true,
   1960 |         },
   1961 |       });
   1962 | 
>  1963 |       await tx.assessmentAttempt.update({
   1964 |         where: {
   1965 |           id: attemptId,
   1966 |         },
   1967 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2236`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   2232 |         /*
   2233 |          * Atomically claim the attempt for grading.
   2234 |          * Only an IN_PROGRESS attempt can be claimed.
   2235 |          */
>  2236 |         const lockResult = await tx.assessmentAttempt.updateMany({
   2237 |           where: {
   2238 |             id: attemptId,
   2239 |             assessmentId,
   2240 |             studentId: userId,
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2363`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2359 |           /*
   2360 |            * Return the attempt to active because
   2361 |            * validation failed before grading.
   2362 |            */
>  2363 |           await tx.assessmentAttempt.update({
   2364 |             where: {
   2365 |               id: attemptId,
   2366 |             },
   2367 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2389`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2385 |          * Update existing answer rows with marking.
   2386 |          */
   2387 |         for (const gradedAnswer of grading.gradedAnswers) {
   2388 |           if (gradedAnswer.answerId) {
>  2389 |             await tx.assessmentAnswer.update({
   2390 |               where: {
   2391 |                 id: gradedAnswer.answerId,
   2392 |               },
   2393 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_CREATE

**File:** `src/lib/assessments/actions.ts:2405`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `create(`

```ts
   2401 |             /*
   2402 |              * Create an explicit unanswered record.
   2403 |              * This makes review and analytics easier.
   2404 |              */
>  2405 |             await tx.assessmentAnswer.create({
   2406 |               data: {
   2407 |                 attemptId,
   2408 |                 questionId: gradedAnswer.questionId,
   2409 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2439`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2435 | 
   2436 |         const finalStatus: AssessmentAttemptStatus =
   2437 |           submissionMode === "AUTO" ? "AUTO_SUBMITTED" : "SUBMITTED";
   2438 | 
>  2439 |         await tx.assessmentAttempt.update({
   2440 |           where: {
   2441 |             id: attemptId,
   2442 |           },
   2443 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2736`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2732 |         }
   2733 | 
   2734 |         const reviewedAt = new Date();
   2735 | 
>  2736 |         const updatedAttempt = await tx.assessmentAttempt.update({
   2737 |           where: {
   2738 |             id: attemptId,
   2739 |           },
   2740 | 
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/assessments/actions.ts:2926`

**File type:** SERVER_ACTION

**Migration class:** MUTATION_RISK

**Match:** `update(`

```ts
   2922 |           "Backtracking is disabled.",
   2923 |         );
   2924 |       }
   2925 | 
>  2926 |       const updated = await tx.assessmentAttempt.update({
   2927 |         where: {
   2928 |           id: attemptId,
   2929 |         },
   2930 | 
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

**File:** `src/lib/report-cards/bulk-review-actions.ts:205`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    201 | 
    202 |           continue;
    203 |         }
    204 | 
>   205 |         const updateResult = await tx.reportCard.updateMany({
    206 |           where: {
    207 |             id: reportCardId,
    208 | 
    209 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/bulk-review-actions.ts:407`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    403 |           });
    404 | 
    405 |           continue;
    406 |         }
>   407 |         const updateResult = await tx.reportCard.updateMany({
    408 |           where: {
    409 |             id: reportCardId,
    410 | 
    411 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/bulk-review-actions.ts:611`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    607 | 
    608 |           continue;
    609 |         }
    610 | 
>   611 |         const updateResult = await tx.reportCard.updateMany({
    612 |           where: {
    613 |             id: reportCardId,
    614 | 
    615 |             status: "DRAFT",
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

**File:** `src/lib/report-cards/review-actions.ts:289`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    285 |         /*
    286 |          * Repeat authorization, lifecycle state
    287 |          * and version in the actual write.
    288 |          */
>   289 |         const updated = await tx.reportCard.updateMany({
    290 |           where: {
    291 |             ...managerWhere,
    292 | 
    293 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:514`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    510 |         }
    511 | 
    512 |         const now = new Date();
    513 | 
>   514 |         const updated = await tx.reportCard.updateMany({
    515 |           where: {
    516 |             ...managerWhere,
    517 | 
    518 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:700`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    696 |               "Changes cannot be requested for this report card.",
    697 |           );
    698 |         }
    699 | 
>   700 |         const updated = await tx.reportCard.updateMany({
    701 |           where: {
    702 |             id: reportCard.id,
    703 | 
    704 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:883`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
    879 |         }
    880 | 
    881 |         const now = new Date();
    882 | 
>   883 |         const updated = await tx.reportCard.updateMany({
    884 |           where: {
    885 |             id: reportCard.id,
    886 | 
    887 |             status: "DRAFT",
```

**Recommendation:** Inspect immediately and add exact server-side RBAC protection if missing.

### CRITICAL — MUTATION_UPDATE

**File:** `src/lib/report-cards/review-actions.ts:1081`

**File type:** SERVICE

**Migration class:** MUTATION_RISK

**Match:** `updateMany(`

```ts
   1077 |         if (!reportCard) {
   1078 |           throw new Error("REPORT_NOT_APPROVED");
   1079 |         }
   1080 | 
>  1081 |         const updated = await tx.reportCard.updateMany({
   1082 |           where: {
   1083 |             id: reportCard.id,
   1084 | 
   1085 |             status: "DRAFT",
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

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:461`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role === "admin"`

```ts
    457 |     ReportCardManagerRole =
    458 |     scope ===
    459 |     "TEACHER_OWNED"
    460 |       ? "teacher"
>   461 |       : user.role ===
    462 |             "admin" ||
    463 |           user.role ===
    464 |             "super_admin"
    465 |         ? user.role
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:599`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role === "admin"`

```ts
    595 |   return {
    596 |     ...user,
    597 | 
    598 |     role:
>   599 |       user.role ===
    600 |         "admin" ||
    601 |       user.role ===
    602 |         "super_admin"
    603 |         ? user.role
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/generation-validator.ts:135`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role !== "admin"`

```ts
    131 |   termId: number;
    132 | }): Promise<ReportCardGenerationValidation> {
    133 |   const { userId, role } = await requireReportCardUser();
    134 | 
>   135 |   if (role !== "admin" && role !== "teacher") {
    136 |     throw new Error("UNAUTHORISED");
    137 |   }
    138 | 
    139 |   const normalizedAcademicYear = academicYear.trim();
```

**Recommendation:** Classify as ownership or authorization. Workspace/action authorization should move to RBAC.

### HIGH — DIRECT_ADMIN_CHECK

**File:** `src/lib/report-cards/review-actions.ts:316`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `role === "admin"`

```ts
    312 |              * Teachers cannot overwrite
    313 |              * the head-teacher remark.
    314 |              */
    315 |             headTeacherRemark:
>   316 |               role === "admin"
    317 |                 ? normalizeNullableText(data.headTeacherRemark)
    318 |                 : reportCard.headTeacherRemark,
    319 | 
    320 |             promotionStatus: normalizeNullableText(data.promotionStatus),
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

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:463`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role === "super_admin"`

```ts
    459 |     "TEACHER_OWNED"
    460 |       ? "teacher"
    461 |       : user.role ===
    462 |             "admin" ||
>   463 |           user.role ===
    464 |             "super_admin"
    465 |         ? user.role
    466 |         : "custom";
    467 | 
```

**Recommendation:** Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.

### MEDIUM — DIRECT_SUPER_ADMIN_CHECK

**File:** `src/lib/report-cards/auth.ts:601`

**File type:** SERVICE

**Migration class:** LEGACY_ROLE_GUARD

**Match:** `user.role === "super_admin"`

```ts
    597 | 
    598 |     role:
    599 |       user.role ===
    600 |         "admin" ||
>   601 |       user.role ===
    602 |         "super_admin"
    603 |         ? user.role
    604 |         : "custom",
    605 | 
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

There are **196** findings requiring human classification.

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

### LEGACY_ROLE_REFERENCE

`src/lib/academic-weightings/auth.ts:71`

```ts
     67 |       ?.role.key
     68 |       ?.trim()
     69 |       .toLowerCase() ??
     70 |     accessActor.actor
>    71 |       .legacyRole
     72 |       ?.trim()
     73 |       .toLowerCase() ??
     74 |     null;
     75 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/academics/options-auth.ts:173`

```ts
    169 |       ?.role.key
    170 |       ?.trim()
    171 |       .toLowerCase() ??
    172 |     accessActor.actor
>   173 |       .legacyRole
    174 |       ?.trim()
    175 |       .toLowerCase() ??
    176 |     null;
    177 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

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

`src/lib/access-control/account-hierarchy.ts:17`

```ts
     13 | };
     14 | 
     15 | export type AccountHierarchyUser = {
     16 |   id: string;
>    17 |   legacyRole: string | null;
     18 | 
     19 |   roles: AssignmentLike[];
     20 | };
     21 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/account-hierarchy.ts:99`

```ts
     95 | 
     96 |   /*
     97 |    * Transitional fallback for legacy identities.
     98 |    */
>    99 |   if (roleLevels.length === 0 && user.legacyRole) {
    100 |     roleLevels.push(getRoleTrustLevel(user.legacyRole));
    101 |   }
    102 | 
    103 |   return Math.max(0, ...roleLevels);
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/account-hierarchy.ts:100`

```ts
     96 |   /*
     97 |    * Transitional fallback for legacy identities.
     98 |    */
     99 |   if (roleLevels.length === 0 && user.legacyRole) {
>   100 |     roleLevels.push(getRoleTrustLevel(user.legacyRole));
    101 |   }
    102 | 
    103 |   return Math.max(0, ...roleLevels);
    104 | }
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

`src/lib/access-control/provisioning-service.ts:85`

```ts
     81 |   const actorAccount =
     82 |     accessActor.actor;
     83 | 
     84 |   const actorRole =
>    85 |     actorAccount.legacyRole
     86 |       ?.trim()
     87 |       .toLowerCase() ??
     88 |     accessActor.activeAssignments[0]
     89 |       ?.role.key
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/provisioning-service.ts:395`

```ts
    391 |           imageUrl: identity.imageUrl,
    392 | 
    393 |           status: "ACTIVE",
    394 | 
>   395 |           legacyRole: access.primaryRole,
    396 |         },
    397 |       });
    398 | 
    399 |       /* SCHOOL PROFILE */
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/access-control/role-service.ts:60`

```ts
     56 |   const actorAccount =
     57 |     accessActor.actor;
     58 | 
     59 |   const actorRole =
>    60 |     actorAccount.legacyRole
     61 |       ?.trim()
     62 |       .toLowerCase() ??
     63 |     accessActor.activeAssignments[0]
     64 |       ?.role.key
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

### LEGACY_ROLE_REFERENCE

`src/lib/actions.ts:4046`

```ts
   4042 |   const userId = accessActor.actor.id;
   4043 | 
   4044 |   const actorRole =
   4045 |     grantingAssignment?.role.key?.trim().toLowerCase() ??
>  4046 |     accessActor.actor.legacyRole?.trim().toLowerCase() ??
   4047 |     null;
   4048 | 
   4049 |   const actorName =
   4050 |     accessActor.actor.displayName?.trim() ||
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/actions.ts:4662`

```ts
   4658 |     const userId = accessActor.actor.id;
   4659 | 
   4660 |     const actorRole =
   4661 |       grantingAssignment?.role.key?.trim().toLowerCase() ??
>  4662 |       accessActor.actor.legacyRole?.trim().toLowerCase() ??
   4663 |       null;
   4664 | 
   4665 |     const actorName =
   4666 |       accessActor.actor.displayName?.trim() ||
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/announcements/auth.ts:79`

```ts
     75 |       ?.role.key
     76 |       ?.trim()
     77 |       .toLowerCase() ??
     78 |     accessActor.actor
>    79 |       .legacyRole
     80 |       ?.trim()
     81 |       .toLowerCase() ??
     82 |     null;
     83 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/announcements/visibility.ts:74`

```ts
     70 |       "UNAUTHORIZED",
     71 |     );
     72 |   }
     73 | 
>    74 |   const legacyRole =
     75 |     accessActor.actor
     76 |       .legacyRole
     77 |       ?.trim()
     78 |       .toLowerCase();
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/announcements/visibility.ts:76`

```ts
     72 |   }
     73 | 
     74 |   const legacyRole =
     75 |     accessActor.actor
>    76 |       .legacyRole
     77 |       ?.trim()
     78 |       .toLowerCase();
     79 | 
     80 |   /*
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/announcements/visibility.ts:111`

```ts
    107 |       .toLowerCase();
    108 | 
    109 |   const role =
    110 |     normalizeAppRole(
>   111 |       legacyRole ||
    112 |         activeRoleKey ||
    113 |         "custom",
    114 |     );
    115 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/announcements/visibility.ts:135`

```ts
    131 |   ) {
    132 |     scope =
    133 |       "GLOBAL";
    134 |   } else if (
>   135 |     role ===
    136 |     "teacher"
    137 |   ) {
    138 |     scope =
    139 |       "TEACHER";
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/announcements/visibility.ts:141`

```ts
    137 |   ) {
    138 |     scope =
    139 |       "TEACHER";
    140 |   } else if (
>   141 |     role ===
    142 |     "student"
    143 |   ) {
    144 |     scope =
    145 |       "STUDENT";
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/announcements/visibility.ts:147`

```ts
    143 |   ) {
    144 |     scope =
    145 |       "STUDENT";
    146 |   } else if (
>   147 |     role ===
    148 |     "parent"
    149 |   ) {
    150 |     scope =
    151 |       "PARENT";
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:170`

```ts
    166 | 
    167 |     if (!resolvedLessonId) {
    168 |       const firstAvailableLesson = await prisma.lesson.findFirst({
    169 |         where:
>   170 |           role === "teacher"
    171 |             ? {
    172 |                 teacherId: userId,
    173 |               }
    174 |             : undefined,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:187`

```ts
    183 |       });
    184 | 
    185 |       if (!firstAvailableLesson) {
    186 |         return assessmentFailure(
>   187 |           role === "teacher"
    188 |             ? "You do not have a lesson available for assessment creation."
    189 |             : "Create a lesson before creating an assessment.",
    190 |         );
    191 |       }
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:2674`

```ts
   2670 |             assessmentId,
   2671 |             studentId,
   2672 | 
   2673 |             assessment: {
>  2674 |               ...(role === "teacher"
   2675 |                 ? {
   2676 |                     lesson: {
   2677 |                       teacherId: userId,
   2678 |                     },
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assessments/actions.ts:2750`

```ts
   2746 |             /*
   2747 |              * Administrators may not have a Teacher row
   2748 |              * matching their Clerk ID.
   2749 |              */
>  2750 |             reviewedById: role === "teacher" ? userId : null,
   2751 |           },
   2752 | 
   2753 |           select: {
   2754 |             id: true,
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

### DIRECT_STUDENT_CHECK

`src/lib/assessments/auth.ts:314`

```ts
    310 |    * Student assessment routes operate on the
    311 |    * authenticated student's own records.
    312 |    */
    313 |   if (
>   314 |     user.role !==
    315 |     "student"
    316 |   ) {
    317 |     throw new Error(
    318 |       "UNAUTHORIZED",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/assessments/auth.ts:343`

```ts
    339 |    * Parent-specific endpoints use this persona only
    340 |    * to establish parent -> child ownership.
    341 |    */
    342 |   if (
>   343 |     user.role !==
    344 |     "parent"
    345 |   ) {
    346 |     throw new Error(
    347 |       "UNAUTHORIZED",
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/assignments/auth.ts:251`

```ts
    247 |     ).some(
    248 |       (
    249 |         roleKey,
    250 |       ) =>
>   251 |         roleKey !==
    252 |           "teacher" &&
    253 |         roleKey !==
    254 |           "student" &&
    255 |         roleKey !==
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/assignments/auth.ts:253`

```ts
    249 |         roleKey,
    250 |       ) =>
    251 |         roleKey !==
    252 |           "teacher" &&
>   253 |         roleKey !==
    254 |           "student" &&
    255 |         roleKey !==
    256 |           "parent",
    257 |     );
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/assignments/auth.ts:255`

```ts
    251 |         roleKey !==
    252 |           "teacher" &&
    253 |         roleKey !==
    254 |           "student" &&
>   255 |         roleKey !==
    256 |           "parent",
    257 |     );
    258 | 
    259 |   if (
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/attendance/auth.ts:118`

```ts
    114 |       ?.role.key
    115 |       ?.trim()
    116 |       .toLowerCase() ??
    117 |     accessActor.actor
>   118 |       .legacyRole
    119 |       ?.trim()
    120 |       .toLowerCase() ??
    121 |     null;
    122 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/events/auth.ts:90`

```ts
     86 |       ?.role.key
     87 |       ?.trim()
     88 |       .toLowerCase() ??
     89 |     accessActor.actor
>    90 |       .legacyRole
     91 |       ?.trim()
     92 |       .toLowerCase() ??
     93 |     null;
     94 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/events/visibility.ts:74`

```ts
     70 |       "UNAUTHORIZED",
     71 |     );
     72 |   }
     73 | 
>    74 |   const legacyRole =
     75 |     accessActor.actor
     76 |       .legacyRole
     77 |       ?.trim()
     78 |       .toLowerCase();
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/events/visibility.ts:76`

```ts
     72 |   }
     73 | 
     74 |   const legacyRole =
     75 |     accessActor.actor
>    76 |       .legacyRole
     77 |       ?.trim()
     78 |       .toLowerCase();
     79 | 
     80 |   const activeRoleKey =
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/events/visibility.ts:89`

```ts
     85 |       .toLowerCase();
     86 | 
     87 |   const role =
     88 |     normalizeAppRole(
>    89 |       legacyRole ||
     90 |       activeRoleKey ||
     91 |       "custom",
     92 |     );
     93 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/events/visibility.ts:108`

```ts
    104 |   ) {
    105 |     scope =
    106 |       "GLOBAL";
    107 |   } else if (
>   108 |     role ===
    109 |     "teacher"
    110 |   ) {
    111 |     scope =
    112 |       "TEACHER";
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/events/visibility.ts:114`

```ts
    110 |   ) {
    111 |     scope =
    112 |       "TEACHER";
    113 |   } else if (
>   114 |     role ===
    115 |     "student"
    116 |   ) {
    117 |     scope =
    118 |       "STUDENT";
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/events/visibility.ts:120`

```ts
    116 |   ) {
    117 |     scope =
    118 |       "STUDENT";
    119 |   } else if (
>   120 |     role ===
    121 |     "parent"
    122 |   ) {
    123 |     scope =
    124 |       "PARENT";
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/exams/auth.ts:233`

```ts
    229 |     ).some(
    230 |       (
    231 |         roleKey,
    232 |       ) =>
>   233 |         roleKey !==
    234 |           "teacher" &&
    235 |         roleKey !==
    236 |           "student" &&
    237 |         roleKey !==
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/exams/auth.ts:235`

```ts
    231 |         roleKey,
    232 |       ) =>
    233 |         roleKey !==
    234 |           "teacher" &&
>   235 |         roleKey !==
    236 |           "student" &&
    237 |         roleKey !==
    238 |           "parent",
    239 |     );
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/exams/auth.ts:237`

```ts
    233 |         roleKey !==
    234 |           "teacher" &&
    235 |         roleKey !==
    236 |           "student" &&
>   237 |         roleKey !==
    238 |           "parent",
    239 |     );
    240 | 
    241 |   if (
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### LEGACY_ROLE_REFERENCE

`src/lib/finance/auth.ts:99`

```ts
     95 |       ?.role.key
     96 |       ?.trim()
     97 |       .toLowerCase() ??
     98 |     accessActor.actor
>    99 |       .legacyRole
    100 |       ?.trim()
    101 |       .toLowerCase() ??
    102 |     null;
    103 | 
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

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

`src/lib/report-cards/auth.ts:306`

```ts
    302 |    */
    303 |   const legacyRoleKey =
    304 |     normalizeRoleKey(
    305 |       accessActor.actor
>   306 |         .legacyRole,
    307 |     );
    308 | 
    309 |   const activeRoleKeys =
    310 |     accessActor.activeAssignments
```

Recommendation: Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/generation-validator.ts:135`

```ts
    131 |   termId: number;
    132 | }): Promise<ReportCardGenerationValidation> {
    133 |   const { userId, role } = await requireReportCardUser();
    134 | 
>   135 |   if (role !== "admin" && role !== "teacher") {
    136 |     throw new Error("UNAUTHORISED");
    137 |   }
    138 | 
    139 |   const normalizedAcademicYear = academicYear.trim();
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/generation-validator.ts:202`

```ts
    198 |     prisma.class.findFirst({
    199 |       where: {
    200 |         id: classId,
    201 | 
>   202 |         ...(role === "teacher"
    203 |           ? {
    204 |               lessons: {
    205 |                 some: {
    206 |                   teacherId: userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:240`

```ts
    236 |             status,
    237 |           }
    238 |         : {}),
    239 | 
>   240 |       ...(role === "teacher"
    241 |         ? {
    242 |             class: {
    243 |               lessons: {
    244 |                 some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_STUDENT_CHECK

`src/lib/report-cards/queries.ts:337`

```ts
    333 | 
    334 | export async function getStudentReportCards() {
    335 |   const { userId, role } = await requireReportCardUser();
    336 | 
>   337 |   if (role !== "student") {
    338 |     throw new Error("UNAUTHORISED");
    339 |   }
    340 | 
    341 |   return prisma.reportCard.findMany({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:385`

```ts
    381 | 
    382 | export async function getParentChildReportCards(childId: string) {
    383 |   const { userId, role } = await requireReportCardUser();
    384 | 
>   385 |   if (role !== "parent") {
    386 |     throw new Error("UNAUTHORISED");
    387 |   }
    388 | 
    389 |   if (!childId.trim()) {
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:696`

```ts
    692 | 
    693 |   const academicYear = filters.academicYear?.trim();
    694 | 
    695 |   const ownershipWhere: Prisma.ReportCardWhereInput =
>   696 |     role === "teacher"
    697 |       ? {
    698 |           class: {
    699 |             lessons: {
    700 |               some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:935`

```ts
    931 |     }),
    932 | 
    933 |     prisma.class.findMany({
    934 |       where:
>   935 |         role === "teacher"
    936 |           ? {
    937 |               lessons: {
    938 |                 some: {
    939 |                   teacherId: userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:1147`

```ts
   1143 | 
   1144 | export async function getParentChildrenForReportCards() {
   1145 |   const { userId, role } = await requireReportCardUser();
   1146 | 
>  1147 |   if (role !== "parent") {
   1148 |     throw new Error("UNAUTHORISED");
   1149 |   }
   1150 | 
   1151 |   const children = await prisma.student.findMany({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_STUDENT_CHECK

`src/lib/report-cards/queries.ts:1238`

```ts
   1234 |    * Administrators and teachers may have permission
   1235 |    * to view this report elsewhere, but they should
   1236 |    * not enter through a student-owned route.
   1237 |    */
>  1238 |   if (role !== "student") {
   1239 |     return null;
   1240 |   }
   1241 | 
   1242 |   const where = buildReportCardReadWhere({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_PARENT_CHECK

`src/lib/report-cards/queries.ts:1285`

```ts
   1281 |   reportCardId: number;
   1282 | }) {
   1283 |   const { userId, role } = await requireReportCardUser();
   1284 | 
>  1285 |   if (role !== "parent") {
   1286 |     return null;
   1287 |   }
   1288 | 
   1289 |   const where = buildReportCardReadWhere({
```

Recommendation: Usually identity/ownership. Preserve unless it is being used as general authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1327`

```ts
   1323 | 
   1324 | export async function getTeacherManageableClass(classId: number) {
   1325 |   const { userId, role } = await requireReportCardUser();
   1326 | 
>  1327 |   if (role !== "teacher" || !Number.isInteger(classId) || classId <= 0) {
   1328 |     return null;
   1329 |   }
   1330 | 
   1331 |   return prisma.class.findFirst({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1456`

```ts
   1452 |   pageSize?: number;
   1453 | }) {
   1454 |   const { userId, role } = await requireReportCardUser();
   1455 | 
>  1456 |   if (role !== "teacher") {
   1457 |     throw new Error("UNAUTHORISED");
   1458 |   }
   1459 | 
   1460 |   const manageableClass = await prisma.class.findFirst({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1898`

```ts
   1894 |   reportCardId: number;
   1895 | }) {
   1896 |   const { userId, role } = await requireReportCardUser();
   1897 | 
>  1898 |   if (role !== "teacher") {
   1899 |     return null;
   1900 |   }
   1901 | 
   1902 |   const where = buildReportCardReadWhere({
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:1943`

```ts
   1939 | 
   1940 |   const [classes, terms, weightingYears] = await prisma.$transaction([
   1941 |     prisma.class.findMany({
   1942 |       where:
>  1943 |         role === "teacher"
   1944 |           ? {
   1945 |               lessons: {
   1946 |                 some: {
   1947 |                   teacherId: userId,
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2004`

```ts
   2000 |     prisma.academicWeighting.findMany({
   2001 |       where: {
   2002 |         isActive: true,
   2003 | 
>  2004 |         ...(role === "teacher"
   2005 |           ? {
   2006 |               grade: {
   2007 |                 classess: {
   2008 |                   some: {
```

Recommendation: Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.

### DIRECT_TEACHER_CHECK

`src/lib/report-cards/queries.ts:2095`

```ts
   2091 |   const reportCard = await prisma.reportCard.findFirst({
   2092 |     where: {
   2093 |       id: reportCardId,
   2094 | 
>  2095 |       ...(role === "teacher"
   2096 |         ? {
   2097 |             class: {
   2098 |               lessons: {
   2099 |                 some: {
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
