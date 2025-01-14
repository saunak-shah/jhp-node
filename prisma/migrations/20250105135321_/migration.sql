/*
  Warnings:

  - You are about to drop the column `student_apply_course_id` on the `result` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reg_id]` on the table `result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reg_id]` on the table `student_apply_course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reg_id` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reg_id` to the `student_apply_course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_student_apply_course_id_fkey";

-- DropIndex
DROP INDEX "result_student_apply_course_id_key";

-- AlterTable
ALTER TABLE "result" DROP COLUMN "student_apply_course_id",
ADD COLUMN     "reg_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_apply_course" ADD COLUMN     "reg_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "result_reg_id_key" ON "result"("reg_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_apply_course_reg_id_key" ON "student_apply_course"("reg_id");

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_reg_id_fkey" FOREIGN KEY ("reg_id") REFERENCES "student_apply_course"("reg_id") ON DELETE CASCADE ON UPDATE CASCADE;
