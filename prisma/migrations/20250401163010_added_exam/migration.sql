/*
  Warnings:

  - Added the required column `creator_id` to the `exam_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passing_marks` to the `exam_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reg_id` to the `exam_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_by` to the `exam_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exam_result" ADD COLUMN     "creator_id" INTEGER NOT NULL,
ADD COLUMN     "passing_marks" INTEGER NOT NULL,
ADD COLUMN     "reg_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "exam_schedule" ADD COLUMN     "scheduled_by" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "exam_schedule" ADD CONSTRAINT "exam_schedule_scheduled_by_fkey" FOREIGN KEY ("scheduled_by") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_result" ADD CONSTRAINT "exam_result_reg_id_fkey" FOREIGN KEY ("reg_id") REFERENCES "student_apply_exam"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_result" ADD CONSTRAINT "exam_result_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;
