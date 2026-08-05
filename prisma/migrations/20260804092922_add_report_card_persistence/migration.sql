-- CreateEnum
CREATE TYPE "ReportCardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportCardCalculationStatus" AS ENUM ('READY', 'PARTIAL', 'BLOCKED');

-- CreateTable
CREATE TABLE "ReportCard" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "termId" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "status" "ReportCardStatus" NOT NULL DEFAULT 'DRAFT',
    "calculationStatus" "ReportCardCalculationStatus" NOT NULL DEFAULT 'BLOCKED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceWeightingId" INTEGER,
    "sourceGradingScaleId" INTEGER,
    "subjectCount" INTEGER NOT NULL DEFAULT 0,
    "completedSubjectCount" INTEGER NOT NULL DEFAULT 0,
    "incompleteSubjectCount" INTEGER NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION,
    "highestSubjectScore" DOUBLE PRECISION,
    "lowestSubjectScore" DOUBLE PRECISION,
    "passedSubjectCount" INTEGER NOT NULL DEFAULT 0,
    "failedSubjectCount" INTEGER NOT NULL DEFAULT 0,
    "passRate" DOUBLE PRECISION,
    "totalGradePoints" DOUBLE PRECISION,
    "averageGradePoint" DOUBLE PRECISION,
    "overallGrade" TEXT,
    "overallRemark" TEXT,
    "overallGradePoint" DOUBLE PRECISION,
    "overallPosition" INTEGER,
    "classStudentCount" INTEGER,
    "daysSchoolOpened" INTEGER,
    "daysPresent" INTEGER,
    "daysAbsent" INTEGER,
    "attendancePercentage" DOUBLE PRECISION,
    "conduct" TEXT,
    "classTeacherRemark" TEXT,
    "headTeacherRemark" TEXT,
    "promotionStatus" TEXT,
    "nextTermBegins" TIMESTAMP(3),
    "weightingSnapshot" JSONB NOT NULL,
    "gradingScaleSnapshot" JSONB NOT NULL,
    "reportSnapshot" JSONB NOT NULL,
    "calculationIssues" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regeneratedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "generatedById" TEXT,
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCardSubject" (
    "id" SERIAL NOT NULL,
    "reportCardId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "subjectName" TEXT NOT NULL,
    "teacherId" TEXT,
    "teacherName" TEXT,
    "assignmentPercentage" DOUBLE PRECISION,
    "assignmentWeight" DOUBLE PRECISION NOT NULL,
    "assignmentScore" DOUBLE PRECISION NOT NULL,
    "assessmentPercentage" DOUBLE PRECISION,
    "assessmentWeight" DOUBLE PRECISION NOT NULL,
    "assessmentScore" DOUBLE PRECISION NOT NULL,
    "examinationPercentage" DOUBLE PRECISION,
    "examinationWeight" DOUBLE PRECISION NOT NULL,
    "examinationScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "gradePoint" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL,
    "calculationStatus" "ReportCardCalculationStatus" NOT NULL,
    "subjectPosition" INTEGER,
    "classAverage" DOUBLE PRECISION,
    "highestScore" DOUBLE PRECISION,
    "lowestScore" DOUBLE PRECISION,
    "categorySnapshot" JSONB NOT NULL,
    "weightedSnapshot" JSONB NOT NULL,
    "gradingSnapshot" JSONB NOT NULL,
    "calculationIssues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportCardSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportCard_academicYear_termId_classId_idx" ON "ReportCard"("academicYear", "termId", "classId");

-- CreateIndex
CREATE INDEX "ReportCard_studentId_status_idx" ON "ReportCard"("studentId", "status");

-- CreateIndex
CREATE INDEX "ReportCard_classId_academicYear_termId_status_idx" ON "ReportCard"("classId", "academicYear", "termId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCard_studentId_academicYear_termId_classId_key" ON "ReportCard"("studentId", "academicYear", "termId", "classId");

-- CreateIndex
CREATE INDEX "ReportCardSubject_subjectId_reportCardId_idx" ON "ReportCardSubject"("subjectId", "reportCardId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCardSubject_reportCardId_subjectId_key" ON "ReportCardSubject"("reportCardId", "subjectId");

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCard" ADD CONSTRAINT "ReportCard_termId_fkey" FOREIGN KEY ("termId") REFERENCES "SchoolTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardSubject" ADD CONSTRAINT "ReportCardSubject_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCardSubject" ADD CONSTRAINT "ReportCardSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
