/*
  Warnings:

  - Added the required column `attendance_by` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "attendance_by" INTEGER;
