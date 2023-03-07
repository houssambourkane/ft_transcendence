-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tfa_authenticated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tfa_enabled" BOOLEAN NOT NULL DEFAULT false;
