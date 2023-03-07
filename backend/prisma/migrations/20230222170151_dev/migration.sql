/*
  Warnings:

  - The `xp` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "loses" SET DEFAULT 0,
ALTER COLUMN "wins" SET DEFAULT 0,
DROP COLUMN "xp",
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;
