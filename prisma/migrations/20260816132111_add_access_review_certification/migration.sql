-- CreateEnum
CREATE TYPE "AccessReviewCampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccessReviewScope" AS ENUM ('PRIVILEGED', 'TEMPORARY', 'PRIVILEGED_AND_TEMPORARY', 'ALL_ASSIGNMENTS');

-- CreateEnum
CREATE TYPE "AccessReviewDecision" AS ENUM ('PENDING', 'CERTIFIED', 'MODIFIED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_CREATED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_STARTED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_COMPLETED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_CANCELLED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_CERTIFIED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_MODIFIED';
ALTER TYPE "AccessAuditAction" ADD VALUE 'ACCESS_REVIEW_REVOKED';

-- CreateTable
CREATE TABLE "AccessReviewCampaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AccessReviewCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" "AccessReviewScope" NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessReviewCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessReviewItem" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "assignmentId" INTEGER,
    "userId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userDisplayName" TEXT,
    "username" TEXT,
    "roleName" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "roleType" "AccessRoleType" NOT NULL,
    "roleProtected" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "source" "AccessAssignmentSource" NOT NULL,
    "decision" "AccessReviewDecision" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "decisionMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessReviewItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_status_idx" ON "AccessReviewCampaign"("status");

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_scope_idx" ON "AccessReviewCampaign"("scope");

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_dueAt_idx" ON "AccessReviewCampaign"("dueAt");

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_createdAt_idx" ON "AccessReviewCampaign"("createdAt");

-- CreateIndex
CREATE INDEX "AccessReviewItem_campaignId_idx" ON "AccessReviewItem"("campaignId");

-- CreateIndex
CREATE INDEX "AccessReviewItem_assignmentId_idx" ON "AccessReviewItem"("assignmentId");

-- CreateIndex
CREATE INDEX "AccessReviewItem_userId_idx" ON "AccessReviewItem"("userId");

-- CreateIndex
CREATE INDEX "AccessReviewItem_roleId_idx" ON "AccessReviewItem"("roleId");

-- CreateIndex
CREATE INDEX "AccessReviewItem_decision_idx" ON "AccessReviewItem"("decision");

-- CreateIndex
CREATE INDEX "AccessReviewItem_expiresAt_idx" ON "AccessReviewItem"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessReviewItem_campaignId_assignmentId_key" ON "AccessReviewItem"("campaignId", "assignmentId");

-- AddForeignKey
ALTER TABLE "AccessReviewItem" ADD CONSTRAINT "AccessReviewItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AccessReviewCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessReviewItem" ADD CONSTRAINT "AccessReviewItem_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "UserRoleAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
