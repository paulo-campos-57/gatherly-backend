import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { SignOptions } from 'jsonwebtoken';

import { UserModule } from '../user/user.module.js';
import { PasswordModule } from '../security/hasher/password.module.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthService } from './services/auth.service.js';

import { PASSWORD_HASHER } from '../security/hasher/password-hasher.js';
import { PasswordHasherService } from '../security/hasher/password-hasher.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    UserModule,

    PasswordModule,

    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'auth.jwtExpiresIn',
            '24h',
          ) as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PasswordHasherService,
    {
      provide: PASSWORD_HASHER,
      useExisting: PasswordHasherService,
    },
  ],
  exports: [PASSWORD_HASHER, JwtModule],
})
export class AuthModule {}
