/*
  Warnings:

  - You are about to drop the column `active_saathi_member_till_2022` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `disability` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_salary_range` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `registered_member_of_film_union` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `retired_person` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "active_saathi_member_till_2022",
DROP COLUMN "disability",
DROP COLUMN "disabled",
DROP COLUMN "monthly_salary_range",
DROP COLUMN "registered_member_of_film_union",
DROP COLUMN "retired_person",
ALTER COLUMN "trashed" SET DEFAULT false;

-- CreateTable
CREATE TABLE "member_other_details" (
    "id" SERIAL NOT NULL,
    "registered_member_of_film_union" BOOLEAN NOT NULL,
    "active_saathi_member_till_2022" BOOLEAN NOT NULL,
    "monthly_salary_range" TEXT NOT NULL,
    "retired_person" BOOLEAN NOT NULL,
    "disabled" BOOLEAN NOT NULL,
    "disability" TEXT,
    "member_id" INTEGER NOT NULL,

    CONSTRAINT "member_other_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_other_details" ADD CONSTRAINT "member_other_details_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
