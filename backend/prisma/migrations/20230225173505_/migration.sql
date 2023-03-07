/*
  Warnings:

  - You are about to drop the column `plyaer2_score` on the `Game` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Game_player1_id_key";

-- DropIndex
DROP INDEX "Game_player2_id_key";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "plyaer2_score",
ADD COLUMN     "player2_score" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "player1_score" SET DEFAULT 0;
