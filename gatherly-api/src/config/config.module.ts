import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './keys/app.config.js';
import databaseConfig from './keys/database.config.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
