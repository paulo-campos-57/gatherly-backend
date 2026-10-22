import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JwtStrategy } from '@/features/auth/strategies/jwt.strategy.js';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  const configServiceMock = {
    getOrThrow: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    configServiceMock.getOrThrow.mockReturnValue('test-jwt-secret');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve carregar o segredo JWT da configuração', () => {
    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith('auth.jwtSecret');
  });

  it('deve propagar erro quando o segredo JWT não está configurado', () => {
    const error = new Error('Configuração obrigatória ausente');
    configServiceMock.getOrThrow.mockImplementation(() => {
      throw error;
    });

    expect(() => new JwtStrategy(configServiceMock as never)).toThrow(error);
  });

  it('deve mapear o payload para os dados públicos do usuário autenticado', () => {
    const payload = {
      sub: 'user-id',
      email: 'paulo@example.com',
      username: 'paulo_campos',
    };

    expect(jwtStrategy.validate(payload)).toEqual({
      id: 'user-id',
      email: 'paulo@example.com',
      username: 'paulo_campos',
    });
  });

  it('deve carregar quando o token ConfigService não existe em runtime', async () => {
    vi.resetModules();
    vi.doMock('@nestjs/config', () => ({ ConfigService: undefined }));

    try {
      const strategyModule =
        await import('@/features/auth/strategies/jwt.strategy.js');

      expect(strategyModule.JwtStrategy).toBeDefined();
    } finally {
      vi.doUnmock('@nestjs/config');
      vi.resetModules();
    }
  });
});
