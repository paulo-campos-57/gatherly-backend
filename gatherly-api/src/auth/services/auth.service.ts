import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../security/hasher/password-hasher.js';

import { LoginDto } from '../dto/login.dto.js';
import { UserRepository } from '../../user/repositories/user.repository.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive)
      throw new UnauthorizedException('Usuário ou senha inválidos');

    const passwordMatches = await this.passwordHasher.verify(
      user.password,
      loginDto.password,
    );

    if (!passwordMatches)
      throw new UnauthorizedException('Usuário ou senha inválidos');

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '24h',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      },
    };
  }
}
