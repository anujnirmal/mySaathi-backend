/*
  Warnings:

  - You are about to drop the `clinics` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "news" ADD COLUMN     "plain_text_body" TEXT;

-- DropTable
DROP TABLE "clinics";

-- CreateTable
CREATE TABLE "chemists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "longitute" TEXT NOT NULL,
    "latitute" TEXT NOT NULL,

    CONSTRAINT "chemists_pkey" PRIMARY KEY ("id")
);
