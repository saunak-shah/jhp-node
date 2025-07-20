/*
  Warnings:

  - Added the required column `schedule_id` to the `student_apply_program` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course" ADD COLUMN     "studentStudent_id" INTEGER;

-- AlterTable
ALTER TABLE "student_apply_program" ADD COLUMN     "is_program_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "schedule_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "program_schedule" (
    "schedule_id" SERIAL NOT NULL,
    "program_id" INTEGER NOT NULL,
    "program_name" TEXT NOT NULL DEFAULT 'Program Name Pending',
    "registration_starting_date" TIMESTAMP(3) NOT NULL,
    "registration_closing_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "status" "ExamScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateIndex
CREATE INDEX "program_schedule_program_id_idx" ON "program_schedule"("program_id");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_studentStudent_id_fkey" FOREIGN KEY ("studentStudent_id") REFERENCES "student"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_program" ADD CONSTRAINT "student_apply_program_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "program_schedule"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_schedule" ADD CONSTRAINT "program_schedule_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("program_id") ON DELETE CASCADE ON UPDATE CASCADE;
