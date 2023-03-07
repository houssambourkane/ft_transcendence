import { RoomType } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class UpdateRoomDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsOptional()
  password: string;
}
