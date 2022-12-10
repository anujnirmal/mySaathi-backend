-- AlterTable
ALTER TABLE "dashboard_users" ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "token" TEXT;
