-- CreateEnum
CREATE TYPE "ReportCardActivityType" AS ENUM ('GENERATED', 'REGENERATED', 'MARKED_STALE', 'DETAILS_UPDATED', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'REOPENED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "ReportCardActivity" (
    "id" SERIAL NOT NULL,
    "reportCardId" INTEGER NOT NULL,
    "type" "ReportCardActivityType" NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportCardActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportCardActivity_reportCardId_createdAt_idx" ON "ReportCardActivity"("reportCardId", "createdAt");

-- CreateIndex
CREATE INDEX "ReportCardActivity_type_idx" ON "ReportCardActivity"("type");

-- CreateIndex
CREATE INDEX "ReportCardActivity_actorId_idx" ON "ReportCardActivity"("actorId");

-- AddForeignKey
ALTER TABLE "ReportCardActivity" ADD CONSTRAINT "ReportCardActivity_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
