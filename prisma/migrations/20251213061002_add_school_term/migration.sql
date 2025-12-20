/*
  Warnings:

  - Changed the type of `day` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TermName" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "day",
ADD COLUMN     "day" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SchoolTerm" (
    "id" SERIAL NOT NULL,
    "name" "TermName" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolTerm_pkey" PRIMARY KEY ("id")
);
