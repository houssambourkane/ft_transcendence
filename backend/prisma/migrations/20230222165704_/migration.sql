/*
  Warnings:

  - You are about to drop the column `Fa_2` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Intraid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gammes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Romms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Romms_user` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[intra_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `intra_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_From_id_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_To_id_fkey";

-- DropForeignKey
ALTER TABLE "Gammes" DROP CONSTRAINT "Gammes_playerone_id_fkey";

-- DropForeignKey
ALTER TABLE "Gammes" DROP CONSTRAINT "Gammes_playertwo_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_from_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_room_id_fkey";

-- DropForeignKey
ALTER TABLE "Romms" DROP CONSTRAINT "Romms_id_user_owner_fkey";

-- DropForeignKey
ALTER TABLE "Romms_user" DROP CONSTRAINT "Romms_user_room_id_fkey";

-- DropForeignKey
ALTER TABLE "Romms_user" DROP CONSTRAINT "Romms_user_user_id_fkey";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Fa_2",
DROP COLUMN "Intraid",
ADD COLUMN     "intra_id" INTEGER NOT NULL,
ADD COLUMN     "tfa" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Friends";

-- DropTable
DROP TABLE "Gammes";

-- DropTable
DROP TABLE "Messages";

-- DropTable
DROP TABLE "Romms";

-- DropTable
DROP TABLE "Romms_user";

-- CreateTable
CREATE TABLE "Friend" (
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL,
    "background" TEXT NOT NULL,
    "player1_id" TEXT NOT NULL,
    "player2_id" TEXT NOT NULL,
    "player1_score" INTEGER NOT NULL,
    "plyaer2_score" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "password" TEXT,
    "type" TEXT NOT NULL DEFAULT 'public',
    "id_user_owner" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomUser" (
    "user_id" TEXT NOT NULL,
    "room_id" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "ban" BOOLEAN NOT NULL,
    "mute" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "room_id" INTEGER NOT NULL,
    "from_id" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friend_from_id_key" ON "Friend"("from_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_to_id_key" ON "Friend"("to_id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_player1_id_key" ON "Game"("player1_id");

-- CreateIndex
CREATE UNIQUE INDEX "Game_player2_id_key" ON "Game"("player2_id");

-- CreateIndex
CREATE UNIQUE INDEX "Room_id_key" ON "Room"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_user_id_key" ON "RoomUser"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomUser_room_id_key" ON "RoomUser"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_key" ON "Message"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_intra_id_key" ON "User"("intra_id");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player1_id_fkey" FOREIGN KEY ("player1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player2_id_fkey" FOREIGN KEY ("player2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_id_user_owner_fkey" FOREIGN KEY ("id_user_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
