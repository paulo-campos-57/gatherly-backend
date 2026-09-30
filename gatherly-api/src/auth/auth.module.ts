import { Module } from '@nestjs/common';

import { PASSWORD_HASHER } from './hasher/password-hasher.js';
import { PasswordHasherService } from './hasher/password-hasher.service.js';
@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasherService,
    },
  ],
  exports: [PASSWORD_HASHER],
})
export class AuthModule {}
