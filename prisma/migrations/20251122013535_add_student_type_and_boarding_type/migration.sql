/*
  Warnings:

  - Added the required column `boardingType` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentType` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "boardingType" TEXT NOT NULL,
ADD COLUMN     "studentType" TEXT NOT NULL;
