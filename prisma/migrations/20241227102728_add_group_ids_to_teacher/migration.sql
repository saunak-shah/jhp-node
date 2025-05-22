-- DropIndex
DROP INDEX IF EXISTS "teacher_teacher_email_key";

-- DropIndex
DROP INDEX IF EXISTS "teacher_teacher_phone_number_key";

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN  IF NOT EXISTS  "group_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateTable
CREATE TABLE IF NOT EXISTS"groups" (
    "group_id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "teacher_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id")
);
