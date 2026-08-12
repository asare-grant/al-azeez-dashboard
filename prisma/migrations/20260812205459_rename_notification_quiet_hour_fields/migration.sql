/*
  Warnings:

  - You are about to drop the column `quietHoursEnd` on the `NotificationUserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `quietHoursStart` on the `NotificationUserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationUserSettings" DROP COLUMN "quietHoursEnd",
DROP COLUMN "quietHoursStart",
ADD COLUMN     "quietHoursEndMinute" TEXT,
ADD COLUMN     "quietHoursStartMinute" TEXT;
