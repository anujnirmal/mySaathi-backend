/*
  Warnings:

  - Added the required column `error_logs` to the `seeding_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "seeding_data" ADD COLUMN     "error_logs" TEXT NOT NULL,
ALTER COLUMN "admin_id" DROP NOT NULL;
