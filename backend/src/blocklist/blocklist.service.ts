import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomsGateway } from 'src/shared/rooms.gateway';

@Injectable()
export class BlocklistService {
  constructor(private prisma: PrismaService, private gateway: RoomsGateway) {}

  async fetchAllBlocklist(id: string) {
    const blockedList = await this.prisma.blocklist.findMany({
      where: {
        from_id: id,
      },
      select: {
        to_id: true,
      },
    });
    return blockedList.map((b) => b.to_id);
  }

  async addToBlocklist(to_id: string, from_id: string) {
    if (to_id === from_id)
      throw new BadRequestException('It is not possible to block yourself!');
    if (
      !(await this.prisma.user.count({
        where: {
          id: to_id,
        },
      }))
    )
      throw new NotFoundException('User not found!');
    await this.prisma.blocklist.createMany({
      data: {
        from_id,
        to_id,
      },
      skipDuplicates: true,
    });
    this.gateway.server.emit('users:blocklist');
  }

  async rmvFromBlocklist(to_id: string, from_id: string) {
    await this.prisma.blocklist.deleteMany({
      where: {
        from_id,
        to_id,
      },
    });
    this.gateway.server.emit('users:blocklist');
  }
}
