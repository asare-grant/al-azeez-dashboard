-- CreateTable
CREATE TABLE "SchoolAcademicYear" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolAcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAcademicYear_name_key" ON "SchoolAcademicYear"("name");

-- CreateIndex
CREATE INDEX "SchoolAcademicYear_isActive_idx" ON "SchoolAcademicYear"("isActive");

-- CreateIndex
CREATE INDEX "SchoolAcademicYear_startDate_idx" ON "SchoolAcademicYear"("startDate");
