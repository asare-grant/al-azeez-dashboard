/*
  Warnings:

  - You are about to drop the column `actionUrl` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,recipientId]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('ASSESSMENT', 'REPORT_CARD', 'ATTENDANCE', 'ACADEMIC', 'FINANCE', 'ANNOUNCEMENT', 'SYSTEM', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM ('ASSESSMENT', 'REPORT_CARD', 'ATTENDANCE', 'RESULT', 'ASSIGNMENT', 'EXAM', 'SCHOOL_TERM', 'ACADEMIC_WEIGHTING', 'GRADING_SCALE', 'FEE', 'PAYMENT', 'ANNOUNCEMENT', 'STUDENT', 'CLASS', 'SYSTEM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ASSESSMENT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'ASSESSMENT_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_GENERATED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_REGENERATED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_CHANGES_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_REOPENED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_PUBLISHED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_ARCHIVED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CARD_STALE';
ALTER TYPE "NotificationType" ADD VALUE 'ATTENDANCE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'ATTENDANCE_INCOMPLETE';
ALTER TYPE "NotificationType" ADD VALUE 'ATTENDANCE_REPORT_STALE';
ALTER TYPE "NotificationType" ADD VALUE 'ACADEMIC_TERM_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'ACADEMIC_WEIGHTING_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'GRADING_SCALE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'FEE_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'FEE_PAYMENT_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'FEE_PAYMENT_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'FEE_BALANCE_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'ANNOUNCEMENT_PUBLISHED';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM_ALERT';

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_assessmentId_fkey";

-- DropIndex
DROP INDEX "public"."Notification_assessmentId_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "actionUrl",
DROP COLUMN "assessmentId",
DROP COLUMN "message",
DROP COLUMN "title",
DROP COLUMN "type",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "eventId" INTEGER NOT NULL,
ADD COLUMN     "seenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "entityType" "NotificationEntityType",
    "entityId" TEXT,
    "dedupeKey" TEXT,
    "actorId" TEXT,
    "actorRole" TEXT,
    "actorName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "inAppEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEvent_dedupeKey_key" ON "NotificationEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "NotificationEvent_type_createdAt_idx" ON "NotificationEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_category_createdAt_idx" ON "NotificationEvent"("category", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationEvent_entityType_entityId_idx" ON "NotificationEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "NotificationEvent_actorId_idx" ON "NotificationEvent"("actorId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_category_key" ON "NotificationPreference"("userId", "category");

-- CreateIndex
CREATE INDEX "Notification_recipientId_archivedAt_idx" ON "Notification"("recipientId", "archivedAt");

-- CreateIndex
CREATE INDEX "Notification_recipientRole_idx" ON "Notification"("recipientRole");

-- CreateIndex
CREATE INDEX "Notification_eventId_idx" ON "Notification"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventId_recipientId_key" ON "Notification"("eventId", "recipientId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NotificationEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
