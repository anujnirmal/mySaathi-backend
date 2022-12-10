-- AlterTable
ALTER TABLE "dashboard_users" ALTER COLUMN "token" DROP NOT NULL,
ALTER COLUMN "expiryDate" DROP NOT NULL;
