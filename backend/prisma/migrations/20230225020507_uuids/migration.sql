/*
  Warnings:

  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RoomUser` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_room_id_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_room_id_fkey";

-- DropIndex
DROP INDEX "Friend_from_id_key";

-- DropIndex
DROP INDEX "Friend_to_id_key";

-- DropIndex
DROP INDEX "Game_id_key";

-- DropIndex
DROP INDEX "Room_id_key";

-- AlterTable
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_pkey" PRIMARY KEY ("from_id", "to_id");

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "room_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Room_id_seq";

-- AlterTable
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_pkey",
ALTER COLUMN "room_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("user_id", "room_id");

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
