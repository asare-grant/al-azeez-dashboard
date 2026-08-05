/*
  Warnings:

  - Added the required column `gradingScaleId` to the `AcademicWeighting` table without a default value. This is not possible if the table is not empty.
  - Made the column `gradeId` on table `AcademicWeighting` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GradingScaleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "AcademicWeighting" ADD COLUMN     "gradingScaleId" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passMark" DOUBLE PRECISION NOT NULL DEFAULT 50,
ALTER COLUMN "gradeId" SET NOT NULL;

-- CreateTable
CREATE TABLE "GradingScale" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "GradingScaleStatus" NOT NULL DEFAULT 'DRAFT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeBoundary" (
    "id" SERIAL NOT NULL,
    "gradingScaleId" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "minimumScore" DOUBLE PRECISION NOT NULL,
    "maximumScore" DOUBLE PRECISION NOT NULL,
    "remark" TEXT NOT NULL,
    "gradePoint" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeBoundary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GradingScale_status_idx" ON "GradingScale"("status");

-- CreateIndex
CREATE INDEX "GradingScale_isDefault_idx" ON "GradingScale"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "GradingScale_name_key" ON "GradingScale"("name");

-- CreateIndex
CREATE INDEX "GradeBoundary_gradingScaleId_idx" ON "GradeBoundary"("gradingScaleId");

-- CreateIndex
CREATE INDEX "GradeBoundary_minimumScore_maximumScore_idx" ON "GradeBoundary"("minimumScore", "maximumScore");

-- CreateIndex
CREATE INDEX "GradeBoundary_position_idx" ON "GradeBoundary"("position");

-- CreateIndex
CREATE UNIQUE INDEX "GradeBoundary_gradingScaleId_grade_key" ON "GradeBoundary"("gradingScaleId", "grade");

-- CreateIndex
CREATE INDEX "AcademicWeighting_termId_idx" ON "AcademicWeighting"("termId");

-- CreateIndex
CREATE INDEX "AcademicWeighting_gradeId_idx" ON "AcademicWeighting"("gradeId");

-- CreateIndex
CREATE INDEX "AcademicWeighting_gradingScaleId_idx" ON "AcademicWeighting"("gradingScaleId");

-- CreateIndex
CREATE INDEX "AcademicWeighting_academicYear_idx" ON "AcademicWeighting"("academicYear");

-- CreateIndex
CREATE INDEX "AcademicWeighting_isActive_idx" ON "AcademicWeighting"("isActive");

-- AddForeignKey
ALTER TABLE "AcademicWeighting" ADD CONSTRAINT "AcademicWeighting_gradingScaleId_fkey" FOREIGN KEY ("gradingScaleId") REFERENCES "GradingScale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeBoundary" ADD CONSTRAINT "GradeBoundary_gradingScaleId_fkey" FOREIGN KEY ("gradingScaleId") REFERENCES "GradingScale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
