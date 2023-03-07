import { IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @Length(3, 40, {
    message: 'Name must be between 3 and 40 characters',
  })
  name: string;

  @IsOptional()
  @IsUrl({
    require_tld: false,
  })
  avatar: string;
}
