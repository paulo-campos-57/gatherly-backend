import { Module } from '@nestjs/common';

import { PASSWORD_HASHER } from './password-hasher.js';
import { PasswordHasherService } from './password-hasher.service.js';

@Module({
  providers: [
    PasswordHasherService,
    {
      provide: PASSWORD_HASHER,
      useExisting: PasswordHasherService,
    },
  ],
  exports: [PASSWORD_HASHER],
})
export class PasswordModule {}
