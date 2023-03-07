import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  providers: [FriendsService],
  controllers: [FriendsController],
  imports: [SharedModule],
})
export class FriendsModule {}
