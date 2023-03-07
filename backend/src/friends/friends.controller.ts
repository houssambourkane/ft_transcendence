import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { FriendsService } from './friends.service';
import { Request } from 'express';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-client-exception.filter';

@Controller('friends')
@UseFilters(PrismaClientExceptionFilter)
@UseGuards(JwtGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get('')
  async fetchAllFriends(@Req() req: Request) {
    return this.friendsService.fetchAllfriends(req.user.id);
  }

  @Post(':id')
  async addFriends(
    @Param('id', ParseUUIDPipe) idUser: string,
    @Req() req: Request,
  ) {
    return this.friendsService.addFriends(idUser, req);
  }

  @Delete(':id')
  async removeFriends(@Param('id', ParseUUIDPipe) idUser: string, @Req() req: Request) {
    return this.friendsService.removeFriends(idUser, req);
  }

  @Post('/accept/:id')
  async acceptFriends(@Param('id', ParseUUIDPipe) idUser: string, @Req() req: Request) {
    return this.friendsService.acceptFriends(idUser, req);
  }

}

