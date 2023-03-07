import { Controller, Get, Param, ParseUUIDPipe, UseFilters, UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtGuard } from 'src/auth/guards';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-client-exception.filter';

@Controller('games')
@UseFilters(PrismaClientExceptionFilter)
@UseGuards(JwtGuard)
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('')
  async getAllGames() {
    return this.gamesService.getAllGames();
  }

  @Get(':id')
  async getOneRoom(@Param('id', ParseUUIDPipe) idRoom: string) {
    return this.gamesService.findOne(idRoom);
  }
}
