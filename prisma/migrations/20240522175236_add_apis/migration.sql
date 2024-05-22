-- CreateEnum
CREATE TYPE "gender" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('1', '2', '3', '4');

-- CreateTable
CREATE TABLE "master_role" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "org_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "master_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "org_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_whatsapp_number" BOOLEAN NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" "gender" NOT NULL,
    "unique_id" TEXT NOT NULL,
    "reset_password_token" TEXT NOT NULL DEFAULT '',
    "reset_password_token_expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_email_token" TEXT NOT NULL DEFAULT '',
    "reset_email_token_expiration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "course_date" TIMESTAMP(3) NOT NULL,
    "course_duration_in_hours" INTEGER NOT NULL,
    "course_description" TEXT NOT NULL,
    "course_score" INTEGER NOT NULL,
    "course_location" TEXT NOT NULL,
    "course_passing_score" INTEGER NOT NULL,
    "course_max_attempts" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "registration_starting_date" TIMESTAMP(3) NOT NULL,
    "registration_closing_date" TIMESTAMP(3) NOT NULL,
    "result_date" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "category" "category" NOT NULL,

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_apply_course" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "user_apply_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registration_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "course_passing_score" TEXT NOT NULL,
    "course_score" INTEGER NOT NULL,
    "creator_id" TEXT NOT NULL,

    CONSTRAINT "result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_unique_id_key" ON "users"("unique_id");

-- CreateIndex
CREATE INDEX "users_org_id_idx" ON "users"("org_id");

-- CreateIndex
CREATE INDEX "users_first_name_middle_name_last_name_idx" ON "users"("first_name", "middle_name", "last_name");

-- CreateIndex
CREATE INDEX "users_first_name_middle_name_last_name_phone_number_idx" ON "users"("first_name", "middle_name", "last_name", "phone_number");

-- CreateIndex
CREATE INDEX "users_first_name_middle_name_last_name_whatsapp_number_idx" ON "users"("first_name", "middle_name", "last_name", "whatsapp_number");

-- CreateIndex
CREATE INDEX "users_first_name_middle_name_last_name_phone_number_whatsap_idx" ON "users"("first_name", "middle_name", "last_name", "phone_number", "whatsapp_number");

-- CreateIndex
CREATE INDEX "users_reset_email_token_idx" ON "users"("reset_email_token");

-- CreateIndex
CREATE INDEX "users_reset_email_token_reset_email_token_expiration_idx" ON "users"("reset_email_token", "reset_email_token_expiration");

-- CreateIndex
CREATE INDEX "users_reset_password_token_idx" ON "users"("reset_password_token");

-- CreateIndex
CREATE INDEX "users_reset_password_token_reset_password_token_expiration_idx" ON "users"("reset_password_token", "reset_password_token_expiration");

-- CreateIndex
CREATE INDEX "course_category_idx" ON "course"("category");

-- CreateIndex
CREATE INDEX "course_course_name_course_date_idx" ON "course"("course_name", "course_date");

-- CreateIndex
CREATE INDEX "course_course_name_course_date_category_idx" ON "course"("course_name", "course_date", "category");

-- CreateIndex
CREATE INDEX "user_apply_course_user_id_course_id_idx" ON "user_apply_course"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "user_apply_course_user_id_idx" ON "user_apply_course"("user_id");

-- CreateIndex
CREATE INDEX "user_apply_course_course_id_idx" ON "user_apply_course"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "result_registration_id_key" ON "result"("registration_id");

-- CreateIndex
CREATE INDEX "result_id_idx" ON "result"("id");

-- CreateIndex
CREATE INDEX "result_creator_id_idx" ON "result"("creator_id");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("unique_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_apply_course" ADD CONSTRAINT "user_apply_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_apply_course" ADD CONSTRAINT "user_apply_course_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "user_apply_course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
