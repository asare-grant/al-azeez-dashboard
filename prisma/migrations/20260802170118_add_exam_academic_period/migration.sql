-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "termId" INTEGER;

-- CreateIndex
CREATE INDEX "Exam_lessonId_idx" ON "Exam"("lessonId");

-- CreateIndex
CREATE INDEX "Exam_academicYear_idx" ON "Exam"("academicYear");

-- CreateIndex
CREATE INDEX "Exam_termId_idx" ON "Exam"("termId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_termId_fkey" FOREIGN KEY ("termId") REFERENCES "SchoolTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
