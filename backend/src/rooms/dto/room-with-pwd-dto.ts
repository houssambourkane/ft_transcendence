import {
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';

export class RoomWithPwd {
  @ValidateIf((e) => e.type === 'protected')
  @IsOptional()
  @IsString()
  @Length(8, 40, {
    message: 'Password must be between 8 and 40 characters',
  })
  password: string;
}
