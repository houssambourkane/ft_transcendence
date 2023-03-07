import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Redirect,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Jwt2faGuard, JwtGuard } from './guards';
import { TwoFactDto, codeDto } from './dto';
import { PrismaClientExceptionFilter } from 'src/filters/prisma-client-exception.filter';

@Controller('auth')
@UseFilters(PrismaClientExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/redirect')
  @Redirect(
    `https://api.intra.42.fr/oauth/authorize?client_id=${
      process.env.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URL,
    )}&response_type=code`,
    301,
  )
  redirect() {}

  @Get('')
  async getToken(@Query() obj: codeDto) {
    const data = await this.authService.fetch_data(obj.code);
    const user = await this.authService.create_user(data);
    return this.authService.signToken(user.id, !!user.tfa);
  }

  @Get('qrcode')
  @UseGuards(JwtGuard)
  async generateQrCode(@Req() req: Request) {
    const tf_auth_obj = await this.authService.generate_2f_auth(req.user);
    return {
      qr: await this.authService.generateQrCodeDataURL(tf_auth_obj.otpauthUrl),
      secret: tf_auth_obj.secret,
    };
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtGuard)
  async turn_on_2f_auth(@Req() req: Request, @Body() body: TwoFactDto) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      body.secret,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    return this.authService.turnOnTwoFactorAuthentication(
      req.user,
      body.secret,
    );
  }

  @Delete('2fa/turn-off')
  @UseGuards(JwtGuard)
  async turn_off_2f_auth(@Req() req: Request) {
    return this.authService.turnOffTwoFactorAuthentication(req.user);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(Jwt2faGuard)
  async authenticate(@Req() req, @Body() body) {
    return this.authService.authenticate2f(req.user, body);
  }
}
