-- AlterEnum
ALTER TYPE "NotificationCategory" ADD VALUE 'ACCESS_CONTROL';

-- AlterEnum
ALTER TYPE "NotificationEntityType" ADD VALUE 'USER_ROLE_ASSIGNMENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'DELEGATED_ACCESS_EXPIRING';
ALTER TYPE "NotificationType" ADD VALUE 'DELEGATED_ACCESS_EXPIRES_SOON';
ALTER TYPE "NotificationType" ADD VALUE 'DELEGATED_ACCESS_EXPIRING_URGENT';
ALTER TYPE "NotificationType" ADD VALUE 'DELEGATED_ACCESS_EXPIRED';
