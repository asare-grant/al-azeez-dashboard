-- AlterEnum
ALTER TYPE "NotificationEntityType" ADD VALUE 'EVENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'EVENT_UPCOMING';
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_STARTING_SOON';

-- CreateIndex
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");

-- CreateIndex
CREATE INDEX "Event_classId_startTime_idx" ON "Event"("classId", "startTime");
