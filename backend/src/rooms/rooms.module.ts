import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  imports: [SharedModule],
})
export class RoomsModule {}
