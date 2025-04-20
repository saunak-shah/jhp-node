/*
  Warnings:

  - Added the required column `created_by` to the `exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exam" ADD COLUMN     "created_by" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;
