-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "termId" INTEGER;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_termId_fkey" FOREIGN KEY ("termId") REFERENCES "SchoolTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
