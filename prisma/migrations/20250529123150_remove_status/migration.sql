/*
  Warnings:

  - You are about to drop the column `status` on the `student_apply_course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_apply_course" DROP COLUMN "status";

-- DropEnum
DROP TYPE "examStatus";
