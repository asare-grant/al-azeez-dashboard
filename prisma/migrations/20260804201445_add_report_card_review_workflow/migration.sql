-- CreateEnum
CREATE TYPE "ReportCardReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED');

-- AlterTable
ALTER TABLE "ReportCard" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "attitude" TEXT,
ADD COLUMN     "changesRequestedAt" TIMESTAMP(3),
ADD COLUMN     "changesRequestedBy" TEXT,
ADD COLUMN     "classTeacherNameSnapshot" TEXT,
ADD COLUMN     "classTeacherSignatureUrl" TEXT,
ADD COLUMN     "headTeacherNameSnapshot" TEXT,
ADD COLUMN     "headTeacherSignatureUrl" TEXT,
ADD COLUMN     "interest" TEXT,
ADD COLUMN     "publishedBy" TEXT,
ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewStatus" "ReportCardReviewStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "schoolStampUrl" TEXT,
ADD COLUMN     "submittedForReviewAt" TIMESTAMP(3),
ADD COLUMN     "submittedForReviewBy" TEXT,
ADD COLUMN     "termClosedOn" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ReportCard_reviewStatus_idx" ON "ReportCard"("reviewStatus");

-- CreateIndex
CREATE INDEX "ReportCard_status_reviewStatus_idx" ON "ReportCard"("status", "reviewStatus");
