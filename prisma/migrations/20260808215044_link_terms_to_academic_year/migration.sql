/*
  Warnings:

  - A unique constraint covering the columns `[academicYearId,name]` on the table `SchoolTerm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SchoolTerm" ADD COLUMN     "academicYearId" INTEGER,
ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "SchoolTerm_academicYearId_idx" ON "SchoolTerm"("academicYearId");

-- CreateIndex
CREATE INDEX "SchoolTerm_isActive_idx" ON "SchoolTerm"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolTerm_academicYearId_name_key" ON "SchoolTerm"("academicYearId", "name");

-- AddForeignKey
ALTER TABLE "SchoolTerm" ADD CONSTRAINT "SchoolTerm_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "SchoolAcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
