/*
  Warnings:

  - You are about to drop the column `schedule_id` on the `student_apply_program` table. All the data in the column will be lost.
  - You are about to drop the `program_schedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `program_ending_date` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_location` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_starting_date` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_closing_date` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registration_starting_date` to the `program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `program_id` to the `student_apply_program` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "program_schedule" DROP CONSTRAINT "program_schedule_program_id_fkey";

-- DropForeignKey
ALTER TABLE "student_apply_program" DROP CONSTRAINT "student_apply_program_schedule_id_fkey";

-- AlterTable
ALTER TABLE "program" ADD COLUMN     "is_program_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "program_ending_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "program_location" TEXT NOT NULL,
ADD COLUMN     "program_starting_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_closing_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "registration_starting_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_apply_program" DROP COLUMN "schedule_id",
ADD COLUMN     "program_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "program_schedule";

-- AddForeignKey
ALTER TABLE "student_apply_program" ADD CONSTRAINT "student_apply_program_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("program_id") ON DELETE CASCADE ON UPDATE CASCADE;
