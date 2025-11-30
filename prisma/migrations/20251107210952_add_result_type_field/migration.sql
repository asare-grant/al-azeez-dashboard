/*
  Warnings:

  - Added the required column `type` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('EXAM', 'ASSIGNMENT');

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "type" "ResultType" NOT NULL;
