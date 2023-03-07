import { IsNotEmpty } from 'class-validator';

export class codeDto {
  @IsNotEmpty()
  code: string

}
