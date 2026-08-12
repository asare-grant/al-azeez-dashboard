/*
  Warnings:

  - The `quietHoursEndMinute` column on the `NotificationUserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `quietHoursStartMinute` column on the `NotificationUserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "NotificationUserSettings" DROP COLUMN "quietHoursEndMinute",
ADD COLUMN     "quietHoursEndMinute" INTEGER,
DROP COLUMN "quietHoursStartMinute",
ADD COLUMN     "quietHoursStartMinute" INTEGER;
