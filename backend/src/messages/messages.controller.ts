import { Controller, Get, Param, ParseUUIDPipe, UseFilters, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtGuard } from 'src/auth/guards';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-client-exception.filter';

@Controller('messages')
@UseFilters(PrismaClientExceptionFilter)
@UseGuards(JwtGuard)
export class MessagesController {
  constructor(private messageService: MessagesService) {}

  @Get(':room_id')
  async findMsgByRoomId(@Param('room_id', ParseUUIDPipe) idRoom: string) {
    return this.messageService.findMsgByRoomId(idRoom);
  }
}
