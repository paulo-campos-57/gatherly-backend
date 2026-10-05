import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from './config/config.module.js';

import { UserModule } from './user/user.module.js';

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
  ],
})
export class AppModule {}
