import { Module } from '@nestjs/common';
import { BlocklistService } from './blocklist.service';
import { BlocklistController } from './blocklist.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  providers: [BlocklistService],
  controllers: [BlocklistController],
  imports: [SharedModule],
})
export class BlocklistModule {}
