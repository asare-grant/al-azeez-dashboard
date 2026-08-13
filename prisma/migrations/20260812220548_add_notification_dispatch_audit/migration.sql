-- CreateEnum
CREATE TYPE "NotificationDispatchSource" AS ENUM ('USER_ACTION', 'SCHEDULED', 'SYSTEM', 'ADMIN_ACTION', 'UNKNOWN');

-- AlterTable
ALTER TABLE "NotificationEvent" ADD COLUMN     "source" "NotificationDispatchSource" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "sourceKey" TEXT;

-- CreateTable
CREATE TABLE "NotificationDispatchAudit" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "source" "NotificationDispatchSource" NOT NULL DEFAULT 'UNKNOWN',
    "sourceKey" TEXT,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "intendedRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "eligibleRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "suppressedRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "suppressedByPreferenceCount" INTEGER NOT NULL DEFAULT 0,
    "suppressedBySystemPolicyCount" INTEGER NOT NULL DEFAULT 0,
    "reusedExistingEvent" BOOLEAN NOT NULL DEFAULT false,
    "actorId" TEXT,
    "actorRole" TEXT,
    "actorName" TEXT,
    "entityType" "NotificationEntityType",
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationDispatchAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_createdAt_idx" ON "NotificationDispatchAudit"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_category_createdAt_idx" ON "NotificationDispatchAudit"("category", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_type_createdAt_idx" ON "NotificationDispatchAudit"("type", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_source_createdAt_idx" ON "NotificationDispatchAudit"("source", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_mandatory_createdAt_idx" ON "NotificationDispatchAudit"("mandatory", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDispatchAudit_eventId_idx" ON "NotificationDispatchAudit"("eventId");

-- CreateIndex
CREATE INDEX "NotificationEvent_source_createdAt_idx" ON "NotificationEvent"("source", "createdAt");

-- AddForeignKey
ALTER TABLE "NotificationDispatchAudit" ADD CONSTRAINT "NotificationDispatchAudit_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "NotificationEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
