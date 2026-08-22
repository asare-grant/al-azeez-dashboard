-- AlterTable
ALTER TABLE "AccessReviewCampaign" ADD COLUMN     "academicYearSnapshot" TEXT,
ADD COLUMN     "termSnapshot" TEXT;

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_academicYearSnapshot_idx" ON "AccessReviewCampaign"("academicYearSnapshot");

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_termSnapshot_idx" ON "AccessReviewCampaign"("termSnapshot");

-- CreateIndex
CREATE INDEX "AccessReviewCampaign_academicYearSnapshot_termSnapshot_idx" ON "AccessReviewCampaign"("academicYearSnapshot", "termSnapshot");
