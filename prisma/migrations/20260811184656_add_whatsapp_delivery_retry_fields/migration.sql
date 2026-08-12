-- AlterTable
ALTER TABLE "WhatsAppDelivery" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "nextAttemptAt" TIMESTAMP(3);
