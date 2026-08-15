-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "AccessRoleType" AS ENUM ('SYSTEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AccessAssignmentSource" AS ENUM ('MIGRATION', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AccessAuditAction" AS ENUM ('USER_CREATED', 'USER_UPDATED', 'USER_ACTIVATED', 'USER_SUSPENDED', 'USER_DISABLED', 'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED', 'ROLE_ASSIGNED', 'ROLE_REMOVED', 'PERMISSION_ADDED', 'PERMISSION_REMOVED');

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "displayName" TEXT,
    "imageUrl" TEXT,
    "status" "UserAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "legacyRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRole" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AccessRoleType" NOT NULL DEFAULT 'CUSTOM',
    "isProtected" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedBy" TEXT,
    "source" "AccessAssignmentSource" NOT NULL DEFAULT 'ADMIN',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessAuditLog" (
    "id" SERIAL NOT NULL,
    "action" "AccessAuditAction" NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "actorName" TEXT,
    "targetUserId" TEXT,
    "roleId" INTEGER,
    "permissionId" INTEGER,
    "metadata" JSONB,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_username_key" ON "UserAccount"("username");

-- CreateIndex
CREATE INDEX "UserAccount_status_idx" ON "UserAccount"("status");

-- CreateIndex
CREATE INDEX "UserAccount_legacyRole_idx" ON "UserAccount"("legacyRole");

-- CreateIndex
CREATE INDEX "UserAccount_createdAt_idx" ON "UserAccount"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRole_key_key" ON "AccessRole"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AccessRole_name_key" ON "AccessRole"("name");

-- CreateIndex
CREATE INDEX "AccessRole_type_idx" ON "AccessRole"("type");

-- CreateIndex
CREATE INDEX "AccessRole_isActive_idx" ON "AccessRole"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "Permission_group_idx" ON "Permission"("group");

-- CreateIndex
CREATE INDEX "Permission_isActive_idx" ON "Permission"("isActive");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_expiresAt_idx" ON "UserRoleAssignment"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_key" ON "UserRoleAssignment"("userId", "roleId");

-- CreateIndex
CREATE INDEX "AccessAuditLog_actorId_idx" ON "AccessAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AccessAuditLog_targetUserId_idx" ON "AccessAuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "AccessAuditLog_action_idx" ON "AccessAuditLog"("action");

-- CreateIndex
CREATE INDEX "AccessAuditLog_createdAt_idx" ON "AccessAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AccessRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessAuditLog" ADD CONSTRAINT "AccessAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessAuditLog" ADD CONSTRAINT "AccessAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
