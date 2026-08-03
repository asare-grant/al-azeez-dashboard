-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ASSESSMENT_PUBLISHED', 'ASSESSMENT_DUE_SOON', 'ASSESSMENT_RESULT_READY', 'ASSESSMENT_FEEDBACK_ADDED', 'GENERAL');

-- CreateEnum
CREATE TYPE "AssessmentScoreStrategy" AS ENUM ('HIGHEST', 'LATEST', 'FIRST', 'AVERAGE');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "actionUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "assessmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicWeighting" (
    "id" SERIAL NOT NULL,
    "academicYear" TEXT NOT NULL,
    "termId" INTEGER NOT NULL,
    "gradeId" INTEGER,
    "assessmentWeight" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "examWeight" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "assignmentWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assessmentScoreStrategy" "AssessmentScoreStrategy" NOT NULL DEFAULT 'AVERAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicWeighting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_idx" ON "Notification"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_assessmentId_idx" ON "Notification"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicWeighting_academicYear_termId_gradeId_key" ON "AcademicWeighting"("academicYear", "termId", "gradeId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicWeighting" ADD CONSTRAINT "AcademicWeighting_termId_fkey" FOREIGN KEY ("termId") REFERENCES "SchoolTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicWeighting" ADD CONSTRAINT "AcademicWeighting_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
