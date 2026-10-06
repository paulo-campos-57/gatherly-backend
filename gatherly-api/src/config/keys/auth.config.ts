import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES ?? '24h',
}));
