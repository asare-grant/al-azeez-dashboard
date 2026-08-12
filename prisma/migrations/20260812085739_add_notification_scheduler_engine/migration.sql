-- CreateEnum
CREATE TYPE "NotificationSchedulerRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationSchedulerScannerStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "NotificationSchedulerRun" (
    "id" SERIAL NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" "NotificationSchedulerRunStatus" NOT NULL DEFAULT 'RUNNING',
    "scannerCount" INTEGER NOT NULL DEFAULT 0,
    "succeededCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationSchedulerRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedulerScannerRun" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "scannerKey" TEXT NOT NULL,
    "status" "NotificationSchedulerScannerStatus" NOT NULL DEFAULT 'RUNNING',
    "result" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,

    CONSTRAINT "NotificationSchedulerScannerRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedulerLock" (
    "key" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSchedulerLock_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "NotificationSchedulerRun_startedAt_idx" ON "NotificationSchedulerRun"("startedAt");

-- CreateIndex
CREATE INDEX "NotificationSchedulerRun_status_startedAt_idx" ON "NotificationSchedulerRun"("status", "startedAt");

-- CreateIndex
CREATE INDEX "NotificationSchedulerScannerRun_runId_idx" ON "NotificationSchedulerScannerRun"("runId");

-- CreateIndex
CREATE INDEX "NotificationSchedulerScannerRun_scannerKey_startedAt_idx" ON "NotificationSchedulerScannerRun"("scannerKey", "startedAt");

-- CreateIndex
CREATE INDEX "NotificationSchedulerScannerRun_status_startedAt_idx" ON "NotificationSchedulerScannerRun"("status", "startedAt");

-- CreateIndex
CREATE INDEX "NotificationSchedulerLock_lockedUntil_idx" ON "NotificationSchedulerLock"("lockedUntil");

-- AddForeignKey
ALTER TABLE "NotificationSchedulerScannerRun" ADD CONSTRAINT "NotificationSchedulerScannerRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "NotificationSchedulerRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
