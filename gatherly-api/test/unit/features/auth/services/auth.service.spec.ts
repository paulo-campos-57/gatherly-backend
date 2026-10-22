import { UnauthorizedException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '@/security/hasher/password-hasher.js';
import { AuthService } from '@/features/auth/services/auth.service.js';
import { UserRepository } from '@/features/user/repositories/user.repository.js';
import { makeUser } from '@test/factories/user.factory.js';

describe('AuthService', () => {
  let authService: AuthService;

  const userRepositoryMock = {
    findByEmail: vi.fn(),
  };

  const jwtServiceMock = {
    signAsync: vi.fn(),
  };

  const passwordHasherMock = {
    hash: vi.fn<PasswordHasher['hash']>(),
    verify: vi.fn<PasswordHasher['verify']>(),
  } satisfies PasswordHasher;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('deve autenticar, normalizar o email e retornar o token e dados públicos do usuário', async () => {
      const user = makeUser();
      userRepositoryMock.findByEmail.mockResolvedValue(user);
      passwordHasherMock.verify.mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('access-token');

      const result = await authService.login({
        email: '  PAULO.CAMPOS@EXAMPLE.COM  ',
        password: 'SenhaSegura123',
      });

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        'paulo.campos@example.com',
      );
      expect(passwordHasherMock.verify).toHaveBeenCalledWith(
        user.password,
        'SenhaSegura123',
      );
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        username: user.username,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        tokenType: 'Bearer',
        expiresIn: '24h',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve rejeitar quando o email não corresponde a um usuário', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nao-existe@example.com',
          password: 'SenhaSegura123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha inválidos'),
      );

      expect(passwordHasherMock.verify).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando o usuário está inativo', async () => {
      const user = makeUser({ isActive: false });
      userRepositoryMock.findByEmail.mockResolvedValue(user);

      await expect(
        authService.login({
          email: user.email,
          password: 'SenhaSegura123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha inválidos'),
      );

      expect(passwordHasherMock.verify).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('deve rejeitar quando a senha não confere', async () => {
      const user = makeUser();
      userRepositoryMock.findByEmail.mockResolvedValue(user);
      passwordHasherMock.verify.mockResolvedValue(false);

      await expect(
        authService.login({
          email: user.email,
          password: 'SenhaIncorreta123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException('Usuário ou senha inválidos'),
      );

      expect(passwordHasherMock.verify).toHaveBeenCalledWith(
        user.password,
        'SenhaIncorreta123',
      );
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
