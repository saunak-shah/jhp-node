/*
  Warnings:

  - You are about to drop the column `is_program_active` on the `student_apply_program` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "program_schedule" ADD COLUMN     "is_program_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "student_apply_program" DROP COLUMN "is_program_active";
