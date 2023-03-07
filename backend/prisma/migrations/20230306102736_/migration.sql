/*
  Warnings:

  - You are about to drop the column `loses` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "loses",
DROP COLUMN "wins",
DROP COLUMN "xp";
