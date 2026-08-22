-- AlterEnum
ALTER TYPE "NotificationEntityType" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_DUE_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_DUE_URGENT';
ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_OVERDUE';
ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'ACCESS_REVIEW_CAMPAIGN_CANCELLED';
