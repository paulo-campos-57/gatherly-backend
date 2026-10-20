import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import type { PasswordHasher } from './password-hasher.js';

@Injectable()
export class PasswordHasherService implements PasswordHasher {
  hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
