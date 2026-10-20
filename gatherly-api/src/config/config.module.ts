import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './keys/app.config.js';
import databaseConfig from './keys/database.config.js';
import authConfig from './keys/auth.config.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, authConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
