-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "rejectionStage" TEXT;
