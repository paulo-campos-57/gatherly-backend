import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from './config/config.module.js';

import { UserModule } from './features/user/user.module.js';
import { AuthModule } from './features/auth/auth.module.js';

@Module({
  imports: [
    AppConfigModule,

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.uri'),
      }),
    }),

    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
