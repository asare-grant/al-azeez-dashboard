/*
  Warnings:

  - You are about to drop the column `bloodType` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherID]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherID` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "bloodType",
ADD COLUMN     "teacherID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacherID_key" ON "Teacher"("teacherID");
