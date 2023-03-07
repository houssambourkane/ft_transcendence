import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getAllGames() {
    return await this.prisma.game.findMany({
      select: {
        id: true,
        background: true,
        player1_score: true,
        player2_score: true,
        state: true,
        player1: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      where: {
        state: 'live',
      },
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        background: true,
        player1_score: true,
        player2_score: true,
        state: true,
        player1: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    if (!game) throw new HttpException('Game not found', 404);
    return game;
  }
}
