/*
  Warnings:

  - You are about to drop the column `email` on the `master_role` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `master_role` table. All the data in the column will be lost.
  - Added the required column `role_access` to the `master_role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `master_role` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('1', '2', '3');

-- AlterTable
ALTER TABLE "master_role" DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "role_access" TEXT NOT NULL,
ADD COLUMN     "role_name" "Role" NOT NULL;

INSERT INTO "master_role"("created_at","updated_at","master_role_id","organization_id","role_access","role_name") VALUES('2024-08-10 00:00:00','2024-08-10 00:00:00',1,1,'[1]','1');
