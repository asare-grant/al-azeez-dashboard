-- AlterTable
ALTER TABLE "ReportCard" ADD COLUMN     "isStale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "staleAt" TIMESTAMP(3),
ADD COLUMN     "staleReason" TEXT;

-- CreateIndex
CREATE INDEX "ReportCard_isStale_idx" ON "ReportCard"("isStale");

-- CreateIndex
CREATE INDEX "ReportCard_classId_academicYear_termId_isStale_idx" ON "ReportCard"("classId", "academicYear", "termId", "isStale");
