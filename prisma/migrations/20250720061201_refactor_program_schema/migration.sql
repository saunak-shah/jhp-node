/*
  Warnings:

  - You are about to drop the column `is_active` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `program_ending_date` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `program_location` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `program_starting_date` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `registration_closing_date` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `registration_starting_date` on the `program` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `program_schedule` table. All the data in the column will be lost.
  - You are about to drop the column `program_name` on the `program_schedule` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `program_schedule` table. All the data in the column will be lost.
  - You are about to drop the column `program_id` on the `student_apply_program` table. All the data in the column will be lost.
  - Added the required column `program_ending_date` to the `program_schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_location` to the `program_schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_starting_date` to the `program_schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "student_apply_program" DROP CONSTRAINT "student_apply_program_program_id_fkey";

-- DropIndex
DROP INDEX "program_program_name_program_starting_date_idx";

-- DropIndex
DROP INDEX "student_apply_program_program_id_idx";

-- DropIndex
DROP INDEX "student_apply_program_student_id_program_id_idx";

-- AlterTable
ALTER TABLE "program" DROP COLUMN "is_active",
DROP COLUMN "program_ending_date",
DROP COLUMN "program_location",
DROP COLUMN "program_starting_date",
DROP COLUMN "registration_closing_date",
DROP COLUMN "registration_starting_date";

-- AlterTable
ALTER TABLE "program_schedule" DROP COLUMN "location",
DROP COLUMN "program_name",
DROP COLUMN "status",
ADD COLUMN     "program_ending_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "program_location" TEXT NOT NULL,
ADD COLUMN     "program_starting_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_apply_program" DROP COLUMN "program_id";

-- CreateIndex
CREATE INDEX "program_program_name_idx" ON "program"("program_name");
