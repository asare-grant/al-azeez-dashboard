-- CreateEnum
CREATE TYPE "WhatsAppDeliveryStatus" AS ENUM ('QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "WhatsAppDelivery" (
    "id" SERIAL NOT NULL,
    "recipientId" TEXT,
    "recipientRole" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "status" "WhatsAppDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "providerMessageId" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "notificationEventId" INTEGER,
    "feeMasterId" INTEGER,
    "studentId" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppDelivery_providerMessageId_key" ON "WhatsAppDelivery"("providerMessageId");

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_status_queuedAt_idx" ON "WhatsAppDelivery"("status", "queuedAt");

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_recipientId_createdAt_idx" ON "WhatsAppDelivery"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_feeMasterId_idx" ON "WhatsAppDelivery"("feeMasterId");

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_studentId_idx" ON "WhatsAppDelivery"("studentId");

-- CreateIndex
CREATE INDEX "WhatsAppDelivery_notificationEventId_idx" ON "WhatsAppDelivery"("notificationEventId");

-- AddForeignKey
ALTER TABLE "WhatsAppDelivery" ADD CONSTRAINT "WhatsAppDelivery_notificationEventId_fkey" FOREIGN KEY ("notificationEventId") REFERENCES "NotificationEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppDelivery" ADD CONSTRAINT "WhatsAppDelivery_feeMasterId_fkey" FOREIGN KEY ("feeMasterId") REFERENCES "FeeMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppDelivery" ADD CONSTRAINT "WhatsAppDelivery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
