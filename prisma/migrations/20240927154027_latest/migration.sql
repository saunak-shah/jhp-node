-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_created_by_fkey";

-- AlterTable
ALTER TABLE "course" ADD COLUMN  IF NOT EXISTS "studentStudent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT IF NOT EXISTS "course_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT IF NOT EXISTS "course_studentStudent_id_fkey" FOREIGN KEY ("studentStudent_id") REFERENCES "student"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;
