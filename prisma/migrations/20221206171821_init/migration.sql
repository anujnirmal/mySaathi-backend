/*
  Warnings:

  - Added the required column `expiryDate` to the `dashboard_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `dashboard_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dashboard_users" ADD COLUMN     "expiryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token" TEXT NOT NULL;
