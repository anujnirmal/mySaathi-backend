/*
  Warnings:

  - You are about to drop the `members_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "members_notifications" DROP CONSTRAINT "members_notifications_member_id_fkey";

-- DropForeignKey
ALTER TABLE "members_notifications" DROP CONSTRAINT "members_notifications_notification_id_fkey";

-- AlterTable
ALTER TABLE "news" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE "members_notifications";

-- CreateTable
CREATE TABLE "_membersTonotifications" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_membersTonotifications_AB_unique" ON "_membersTonotifications"("A", "B");

-- CreateIndex
CREATE INDEX "_membersTonotifications_B_index" ON "_membersTonotifications"("B");

-- AddForeignKey
ALTER TABLE "_membersTonotifications" ADD CONSTRAINT "_membersTonotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_membersTonotifications" ADD CONSTRAINT "_membersTonotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
