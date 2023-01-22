/*
  Warnings:

  - You are about to drop the column `body` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `english_body` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `english_title` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hindi_body` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hindi_title` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marathi_body` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marathi_title` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "body",
DROP COLUMN "title",
ADD COLUMN     "english_body" TEXT NOT NULL,
ADD COLUMN     "english_title" VARCHAR(255) NOT NULL,
ADD COLUMN     "hindi_body" TEXT NOT NULL,
ADD COLUMN     "hindi_title" VARCHAR(255) NOT NULL,
ADD COLUMN     "marathi_body" TEXT NOT NULL,
ADD COLUMN     "marathi_title" VARCHAR(255) NOT NULL;
