/*
  Warnings:

  - You are about to drop the column `studentStudent_id` on the `course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_studentStudent_id_fkey";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "studentStudent_id";
