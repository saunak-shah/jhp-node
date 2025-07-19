-- CreateTable
CREATE TABLE "program" (
    "program_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "program_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "program_starting_date" TIMESTAMP(3) NOT NULL,
    "program_ending_date" TIMESTAMP(3) NOT NULL,
    "program_description" TEXT NOT NULL,
    "program_location" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "registration_starting_date" TIMESTAMP(3) NOT NULL,
    "registration_closing_date" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "program_pkey" PRIMARY KEY ("program_id")
);

-- CreateTable
CREATE TABLE "student_apply_program" (
    "student_apply_program_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reg_id" TEXT NOT NULL,
    "program_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "student_apply_program_pkey" PRIMARY KEY ("student_apply_program_id")
);

-- CreateIndex
CREATE INDEX "program_program_name_program_starting_date_idx" ON "program"("program_name", "program_starting_date");

-- CreateIndex
CREATE UNIQUE INDEX "student_apply_program_reg_id_key" ON "student_apply_program"("reg_id");

-- CreateIndex
CREATE INDEX "student_apply_program_student_id_program_id_idx" ON "student_apply_program"("student_id", "program_id");

-- CreateIndex
CREATE INDEX "student_apply_program_student_id_idx" ON "student_apply_program"("student_id");

-- CreateIndex
CREATE INDEX "student_apply_program_program_id_idx" ON "student_apply_program"("program_id");

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program" ADD CONSTRAINT "program_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_program" ADD CONSTRAINT "student_apply_program_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("program_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_apply_program" ADD CONSTRAINT "student_apply_program_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
