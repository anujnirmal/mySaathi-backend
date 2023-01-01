/*
  Warnings:

  - You are about to drop the column `news_url` on the `news` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MODULES_ACCESS" AS ENUM ('EDUCATION', 'INSURANCE', 'HOUSEHOLD');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "modules" "MODULES_ACCESS"[];

-- AlterTable
ALTER TABLE "news" DROP COLUMN "news_url";
