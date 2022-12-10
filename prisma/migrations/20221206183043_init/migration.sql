-- AlterTable
ALTER TABLE "dashboard_users" ALTER COLUMN "expiryDate" DROP NOT NULL,
ALTER COLUMN "token" DROP NOT NULL;
