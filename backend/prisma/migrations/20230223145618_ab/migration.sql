/*
  Warnings:

  - You are about to drop the column `tfa_authenticated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tfa_enabled` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tfa_authenticated",
DROP COLUMN "tfa_enabled";
