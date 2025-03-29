-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('1', '2', '3', '4');

-- CreateEnum
CREATE TYPE "result_status" AS ENUM ('1', '2', '3');

-- CreateTable
CREATE TABLE "exam" (
    "exam_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exam_name" TEXT NOT NULL,
    "exam_description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "exam_course_url" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "exam_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "exam_schedule" (
    "schedule_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exam_id" INTEGER NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "registration_starting_date" TIMESTAMP(3) NOT NULL,
    "registration_closing_date" TIMESTAMP(3) NOT NULL,
    "seats_available" INTEGER NOT NULL,
    "exam_location" TEXT NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "passing_marks" INTEGER NOT NULL,
    "is_retake" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exam_schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "student_apply_exam" (
    "application_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" INTEGER NOT NULL,
    "schedule_id" INTEGER NOT NULL,
    "status" "application_status" NOT NULL DEFAULT '1',
    "exam_attempt" INTEGER NOT NULL,
    "reg_id" TEXT NOT NULL,

    CONSTRAINT "student_apply_exam_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "exam_result" (
    "result_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marks_obtained" INTEGER NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "result_status" "result_status" NOT NULL,

    CONSTRAINT "exam_result_pkey" PRIMARY KEY ("result_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_apply_exam_reg_id_key" ON "student_apply_exam"("reg_id");

-- AddForeignKey
ALTER TABLE "exam" ADD CONSTRAINT "exam_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedule" ADD CONSTRAINT "exam_schedule_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_exam" ADD CONSTRAINT "student_apply_exam_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_exam" ADD CONSTRAINT "student_apply_exam_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "exam_schedule"("schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;
