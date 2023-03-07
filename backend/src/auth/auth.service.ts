import {
  BadRequestException,
  Injectable,
  UsePipes,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async fetch_data(code: string) {
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URL;
    try {
      const token = await axios.post('https://api.intra.42.fr/oauth/token', {
        grant_type: 'authorization_code',
        client_id,
        client_secret,
        code,
        redirect_uri,
      });
      const data = (
        await axios.get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${token.data.access_token}`,
          },
        })
      ).data;

      return {
        id: data.id,
        name: data.displayname,
        avatar: data.image.versions.medium,
      };
    } catch (e) {
      console.error(e)
      throw new BadRequestException('Bad request');
    }
  }

  async create_user(userDto: UserDto) {
    const upsertUser = await this.prisma.user.upsert({
      where: {
        intra_id: userDto.id,
      },
      update: {},
      create: {
        intra_id: userDto.id,
        name: userDto.name,
        avatar: userDto.avatar,
      },
    });

    return upsertUser;
  }

  async signToken(
    idUser: string,
    tfa_required = false,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: idUser,
      tfa_required,
    };

    const secret = await this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '72h',
      secret,
    });
    return {
      access_token: token,
    };
  }
  async generate_2f_auth(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.name,
      'Transcendence 2F Auth',
      secret,
    );

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    secret: any,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret,
    });
  }

  async authenticate2f(user: any, body: any) {
    const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user.tfa,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    return this.signToken(user.id, false);
  }

  async turnOnTwoFactorAuthentication(user: any, secret: string) {
    const userUpdated = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tfa: secret,
      },
    });
  }

  async turnOffTwoFactorAuthentication(user: any) {
    const userUpdated = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tfa: null,
      },
    });
  }
}
