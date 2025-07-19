/*
  Warnings:

  - Added the required column `schedule_id` to the `student_apply_course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `student_apply_course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "examStatus" AS ENUM ('M', 'F');

-- AlterTable
ALTER TABLE "student_apply_course" ADD COLUMN     "schedule_id" INTEGER NOT NULL,
ADD COLUMN     "status" "examStatus" NOT NULL;

-- AddForeignKey
ALTER TABLE "student_apply_course" ADD CONSTRAINT "student_apply_course_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "exam_schedule"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedule" ADD CONSTRAINT "exam_schedule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;
