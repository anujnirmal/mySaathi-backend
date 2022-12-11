-- AlterTable
ALTER TABLE "news" ALTER COLUMN "image_url" DROP NOT NULL;

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" SERIAL NOT NULL,
    "ycf_id" VARCHAR(255) NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile_number" INTEGER NOT NULL,
    "aadhaar_number" BIGINT NOT NULL,
    "pancard_number" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members_notifications" (
    "member_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,

    CONSTRAINT "members_notifications_pkey" PRIMARY KEY ("member_id","notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_ycf_id_key" ON "members"("ycf_id");

-- AddForeignKey
ALTER TABLE "members_notifications" ADD CONSTRAINT "members_notifications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members_notifications" ADD CONSTRAINT "members_notifications_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
