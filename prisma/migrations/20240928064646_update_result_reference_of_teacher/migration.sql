-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_creator_id_fkey";

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "teacher"("teacher_id") ON DELETE CASCADE ON UPDATE CASCADE;
