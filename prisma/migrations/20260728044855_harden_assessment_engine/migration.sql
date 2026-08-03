/*
  Warnings:

  - A unique constraint covering the columns `[submissionToken]` on the table `AssessmentAttempt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AssessmentAuditAction" AS ENUM ('ASSESSMENT_CREATED', 'ASSESSMENT_UPDATED', 'ASSESSMENT_PUBLISHED', 'ASSESSMENT_CLOSED', 'ASSESSMENT_ARCHIVED', 'ASSESSMENT_DUPLICATED', 'ASSESSMENT_DELETED', 'ATTEMPT_STARTED', 'ATTEMPT_RESUMED', 'ATTEMPT_EXPIRED', 'ATTEMPT_AUTO_SUBMITTED', 'ATTEMPT_SUBMITTED', 'ATTEMPT_CANCELLED', 'ANSWER_SAVED', 'ANSWER_SAVE_REJECTED', 'NAVIGATION_UPDATED', 'RESULT_CREATED', 'RESULT_VIEWED', 'FEEDBACK_CREATED', 'FEEDBACK_UPDATED', 'FEEDBACK_REMOVED', 'SECURITY_REJECTION');

-- AlterTable
ALTER TABLE "AssessmentAnswer" ADD COLUMN     "clientMutationId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "AssessmentAttempt" ADD COLUMN     "activeSessionId" TEXT,
ADD COLUMN     "activeSessionSeenAt" TIMESTAMP(3),
ADD COLUMN     "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "highestQuestionIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submissionStartedAt" TIMESTAMP(3),
ADD COLUMN     "submissionToken" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "AssessmentAuditLog" (
    "id" SERIAL NOT NULL,
    "action" "AssessmentAuditAction" NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "assessmentId" INTEGER,
    "attemptId" INTEGER,
    "studentId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentJobLock" (
    "id" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentJobLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentAuditLog_assessmentId_createdAt_idx" ON "AssessmentAuditLog"("assessmentId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentAuditLog_attemptId_createdAt_idx" ON "AssessmentAuditLog"("attemptId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentAuditLog_studentId_createdAt_idx" ON "AssessmentAuditLog"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentAuditLog_action_createdAt_idx" ON "AssessmentAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentJobLock_expiresAt_idx" ON "AssessmentJobLock"("expiresAt");

-- CreateIndex
CREATE INDEX "AssessmentAnswer_attemptId_updatedAt_idx" ON "AssessmentAnswer"("attemptId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_submissionToken_key" ON "AssessmentAttempt"("submissionToken");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_assessmentId_studentId_idx" ON "AssessmentAttempt"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_status_expiresAt_idx" ON "AssessmentAttempt"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_activeSessionSeenAt_idx" ON "AssessmentAttempt"("activeSessionSeenAt");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_submittedAt_idx" ON "AssessmentAttempt"("submittedAt");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_reviewedById_idx" ON "AssessmentAttempt"("reviewedById");

-- AddForeignKey
ALTER TABLE "AssessmentAuditLog" ADD CONSTRAINT "AssessmentAuditLog_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAuditLog" ADD CONSTRAINT "AssessmentAuditLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
