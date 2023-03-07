import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomsGateway } from 'src/shared/rooms.gateway';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService, private gateway: RoomsGateway) {}

  async fetchAllfriends(id: string) {
    const sent = (
      await this.prisma.friend.findMany({
        where: {
          from_id: id,
          accepted: true,
        },
        select: {
          to: {
            select: {
              id: true,
              avatar: true,
              name: true,
            },
          },
        },
      })
    ).map((e) => e.to);
    const received = await this.prisma.friend.findMany({
      where: {
        to_id: id,
      },
      select: {
        from: {
          select: {
            id: true,
            avatar: true,
            name: true,
          },
        },
        accepted: true,
      },
    });
    const pending = received.filter((e) => !e.accepted).map((e) => e.from);
    const friends = received
      .filter((e) => e.accepted)
      .map((e) => e.from)
      .concat(sent);
    return { friends, pending };
  }

  async addFriends(idUser: string, req) {
    if (idUser === req.user.id)
      throw new BadRequestException('It is not possible to add yourself!');
    const checkuser = await this.prisma.user.count({
      where: {
        id: {
          in: [idUser, req.user.id],
        },
      },
    });
    if (checkuser !== 2) throw new NotFoundException('User not found!');
    const friend = await this.prisma.friend.findFirst({
      where: {
        OR: [
          {
            from_id: req.user.id,
            to_id: idUser,
          },
          {
            from_id: idUser,
            to_id: req.user.id,
          },
        ],
      },
    });
    if (friend && !friend.accepted)
      throw new BadRequestException('Friend request already sent');
    else if (friend) throw new BadRequestException('Friend already added');
    await this.prisma.friend.create({
      data: {
        to_id: idUser,
        from_id: req.user.id,
        accepted: false,
      },
    });
    this.gateway.server.emit('users:friends');
  }

  async removeFriends(idUser: string, req) {
    if (idUser === req.user.id)
      throw new BadRequestException('It is not possible to remove yourself!');
    const removedFriend = await this.prisma.friend.deleteMany({
      where: {
        OR: [
          {
            from_id: req.user.id,
            to_id: idUser,
          },
          {
            from_id: idUser,
            to_id: req.user.id,
          },
        ],
      },
    });
    if (!removedFriend) throw new NotFoundException('Firend not found!');
    this.gateway.server.emit('users:friends');
  }

  async acceptFriends(idUser: string, req) {
    await this.prisma.friend.update({
      where: {
        from_id_to_id: {
          from_id: idUser,
          to_id: req.user.id,
        },
      },
      data: {
        accepted: true,
      },
    });
    this.gateway.server.emit('users:friends');
  }
}
