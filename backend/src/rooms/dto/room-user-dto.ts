import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class RoomUserDto {
  @IsOptional()
  @IsBoolean()
  admin: boolean;

  @IsOptional()
  @IsBoolean()
  ban: boolean;

  @IsOptional()
  @Type(() => Date)
  mute: Date;
}
