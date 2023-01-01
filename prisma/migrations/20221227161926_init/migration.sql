/*
  Warnings:

  - You are about to drop the column `first_name` on the `dashboard_users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `dashboard_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "first_name",
DROP COLUMN "last_name";

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "trashed" BOOLEAN;
