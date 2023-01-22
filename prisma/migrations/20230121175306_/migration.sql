/*
  Warnings:

  - You are about to drop the column `admin_id` on the `seeding_data` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "seeding_data" DROP CONSTRAINT "seeding_data_id_fkey";

-- AlterTable
ALTER TABLE "seeding_data" DROP COLUMN "admin_id";
