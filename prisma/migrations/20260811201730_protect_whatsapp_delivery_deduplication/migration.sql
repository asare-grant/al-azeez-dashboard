/*
  Warnings:

  - A unique constraint covering the columns `[notificationEventId,recipientId]` on the table `WhatsAppDelivery` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."WhatsAppDelivery_status_queuedAt_idx";

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_status_nextAttemptAt_queuedAt_idx" ON "WhatsAppDelivery"("status", "nextAttemptAt", "queuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppDelivery_notificationEventId_recipientId_key" ON "WhatsAppDelivery"("notificationEventId", "recipientId");
