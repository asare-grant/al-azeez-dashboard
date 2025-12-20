/*
  Warnings:

  - You are about to drop the column `lessonId` on the `Attendance` table. All the data in the column will be lost.
  - Added the required column `day` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "lessonId",
ADD COLUMN     "day" "Day" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "parentId" DROP NOT NULL;
