-- CreateEnum
CREATE TYPE "ExamScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "exam_schedule" ADD COLUMN     "status" "ExamScheduleStatus" NOT NULL DEFAULT 'SCHEDULED';
