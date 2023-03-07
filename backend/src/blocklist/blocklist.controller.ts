import { Controller, UseFilters } from '@nestjs/common';
import { BlocklistService } from './blocklist.service';
import { Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';
import { Request } from 'express';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-client-exception.filter';

@Controller('blocklist')
@UseFilters(PrismaClientExceptionFilter)
@UseGuards(JwtGuard)
export class BlocklistController {
  constructor(private blocklistService: BlocklistService) {}

  @Get('')
  fetchAllBlocklist(@Req() req: Request): any {
    return this.blocklistService.fetchAllBlocklist(req.user.id);
  }

  @Post(':id')
  async addToBlocklist(@Param('id') idUser: string, @Req() req: Request) {
    return this.blocklistService.addToBlocklist(idUser, req.user.id);
  }

  @Delete(':id')
  async rmvFromBlocklist(@Param('id') idUser: string, @Req() req: Request) {
    return this.blocklistService.rmvFromBlocklist(idUser, req.user.id);
  }
}
