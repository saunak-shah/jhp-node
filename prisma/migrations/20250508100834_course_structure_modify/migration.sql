/*
  Warnings:

  - You are about to drop the column `category` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_date` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_duration_in_hours` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_location` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_max_attempts` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_passing_score` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `course_score` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `registration_closing_date` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `registration_starting_date` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `result_date` on the `course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "course" DROP CONSTRAINT "course_created_by_fkey";

-- DropIndex
DROP INDEX "course_category_idx";

-- DropIndex
DROP INDEX "course_course_name_course_date_category_idx";

-- DropIndex
DROP INDEX "course_course_name_course_date_idx";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "category",
DROP COLUMN "course_date",
DROP COLUMN "course_duration_in_hours",
DROP COLUMN "course_location",
DROP COLUMN "course_max_attempts",
DROP COLUMN "course_passing_score",
DROP COLUMN "course_score",
DROP COLUMN "registration_closing_date",
DROP COLUMN "registration_starting_date",
DROP COLUMN "result_date";

-- AlterTable
ALTER TABLE "student" ALTER COLUMN "status" SET DEFAULT 2;
