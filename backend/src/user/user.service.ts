import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async fetchAlluser(search: string) {
    return await this.prisma.user.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });
  }

  async getProfile(id: string) {
    const getProfile = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!getProfile) throw new HttpException("User not found", 404);
    return getProfile;
  }

  async getOneUser(idUser: string) {
    const data = {
      ...(await this.prisma.user.findUnique({
        where: {
          id: idUser,
        },
        select: {
          avatar: true,
          created_at: true,
          name: true,
          id: true,
        },
      })),
      games: await this.prisma.game.findMany({
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
          OR: [{ player1_id: idUser }, { player2_id: idUser }],
        },
      }),
      wins: await this.prisma.game.count({
        where: {
          OR: [
            {
              player1_id: idUser,
              player1_score: { gt: this.prisma.game.fields.player2_score },
            },
            {
              player2_id: idUser,
              player2_score: { gt: this.prisma.game.fields.player1_score },
            },
          ],
        },
      }),
    };
    if (!data.id) throw new HttpException('User not found', 404);
    const achivement = Math.floor(data.wins / 2);
    return {
      ...data,
      losses: data.games.length - data.wins,
      achivement: this.getFilePath(achivement),
    };
  }

  async updateUserbyId(idUser: string, b: UpdateUserDto) {
    // if (
    //   await this.prisma.user.findFirst({
    //     where: {
    //       id: {
    //         not: idUser,
    //       },
    //       name: b.name,
    //     },
    //   })
    // )
    //   throw new HttpException('Name already exists', 400);
    await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: b,
    });
  }

  getFilePath(type: number): string {
    let filePath = `/achivements/${type}.png`;
    if (type > 12) {
      filePath = `/achivements/${12}.png`;
    } else if (type < 1) {
      filePath = `/achivements/${1}.png`;
    }
    return filePath;
  }
}
