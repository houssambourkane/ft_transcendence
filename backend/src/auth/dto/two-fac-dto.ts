import { IsNotEmpty } from "class-validator"

export class TwoFactDto {
    @IsNotEmpty()
    twoFactorAuthenticationCode: string

    @IsNotEmpty()
    secret: string
}