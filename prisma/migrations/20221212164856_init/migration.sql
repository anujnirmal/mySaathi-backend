/*
  Warnings:

  - You are about to drop the column `token` on the `dashboard_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dashboard_users" DROP COLUMN "token",
ADD COLUMN     "refresh_token" TEXT;
