-- CreateTable
CREATE TABLE "exam_schedule" (
    "schedule_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "registration_starting_date" TIMESTAMP(3) NOT NULL,
    "registration_closing_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateIndex
CREATE INDEX "exam_schedule_course_id_idx" ON "exam_schedule"("course_id");
