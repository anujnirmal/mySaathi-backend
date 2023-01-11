/*
  Warnings:

  - You are about to drop the `news_english` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_hindi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_marathi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "news_english";

-- DropTable
DROP TABLE "news_hindi";

-- DropTable
DROP TABLE "news_marathi";

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "plain_text_body" TEXT,
    "image_url" TEXT,
    "language" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);
