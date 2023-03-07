/*
  Warnings:

  - The `mute` column on the `RoomUser` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RoomUser" DROP COLUMN "mute",
ADD COLUMN     "mute" TIMESTAMP(3);
