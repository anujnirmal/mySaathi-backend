/*
  Warnings:

  - You are about to drop the column `news_link` on the `news` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "news" DROP COLUMN "news_link",
ADD COLUMN     "news_url" TEXT;
