/*
  Warnings:

  - Added the required column `role` to the `dashboard_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dashboard_users" ADD COLUMN     "role" TEXT NOT NULL;
