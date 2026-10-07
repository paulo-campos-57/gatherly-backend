import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '@/security/hasher/password-hasher.js';
import { UserRepository } from '@/user/repositories/user.repository.js';
import { UserService } from '@/user/services/user.service.js';
import { makeUser } from '@test/factories/user.factory.js';

describe('UserService', () => {
  let userService: UserService;

  const userRepositoryMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByUsername: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  };

  const passwordHasherMock = {
    hash: vi.fn<PasswordHasher['hash']>(),
    verify: vi.fn<PasswordHasher['verify']>(),
  } satisfies PasswordHasher;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: PASSWORD_HASHER,
          useValue: passwordHasherMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('deve criar um usuário, normalizar email e username, e salvar apenas o hash da senha', async () => {
      const dto = {
        name: 'Paulo Campos',
        email: '  PAULO.CAMPOS@EXAMPLE.COM  ',
        username: '  Paulo_Campos  ',
        password: 'SenhaSegura123',
        bio: 'Desenvolvedor full-stack.',
      };

      const savedUser = makeUser();

      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByUsername.mockResolvedValue(null);
      passwordHasherMock.hash.mockResolvedValue('$argon2id$v=19$hash-exemplo');
      userRepositoryMock.create.mockResolvedValue(savedUser);

      const result = await userService.create(dto);

      expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(
        'paulo.campos@example.com',
      );

      expect(userRepositoryMock.findByUsername).toHaveBeenCalledWith(
        'paulo_campos',
      );

      expect(passwordHasherMock.hash).toHaveBeenCalledWith('SenhaSegura123');

      expect(userRepositoryMock.create).toHaveBeenCalledWith({
        ...dto,
        email: 'paulo.campos@example.com',
        username: 'paulo_campos',
        password: '$argon2id$v=19$hash-exemplo',
      });

      expect(result).toMatchObject({
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        username: savedUser.username,
        bio: savedUser.bio,
        avatarUrl: savedUser.avatarUrl,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      });

      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar ConflictException se o email já estiver cadastrado', async () => {
      const existingUser = makeUser();

      userRepositoryMock.findByEmail.mockResolvedValue(existingUser);

      await expect(
        userService.create({
          name: 'Novo Usuário',
          email: existingUser.email,
          username: 'novo_usuario',
          password: 'SenhaSegura123',
        }),
      ).rejects.toThrow(new ConflictException('E-mail já cadastrado'));

      expect(userRepositoryMock.findByUsername).not.toHaveBeenCalled();
      expect(passwordHasherMock.hash).not.toHaveBeenCalled();
      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o username já estiver em uso', async () => {
      const existingUser = makeUser();

      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByUsername.mockResolvedValue(existingUser);

      await expect(
        userService.create({
          name: 'Novo Usuário',
          email: 'novo@example.com',
          username: existingUser.username,
          password: 'SenhaSegura123',
        }),
      ).rejects.toThrow(new ConflictException('Nome de usuário já em uso'));

      expect(passwordHasherMock.hash).not.toHaveBeenCalled();
      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar usuários sem expor a senha', async () => {
      const users = [
        makeUser(),
        makeUser({
          id: 'c1b9e4ec-6e65-4cd2-829b-9163a57a1247',
          email: 'ana@example.com',
          username: 'ana_dev',
          name: 'Ana Silva',
        }),
      ];

      userRepositoryMock.findAll.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(userRepositoryMock.findAll).toHaveBeenCalledOnce();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');

      expect(result[0]).toMatchObject({
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        username: users[0].username,
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário pelo UUID sem expor a senha', async () => {
      const user = makeUser();

      userRepositoryMock.findById.mockResolvedValue(user);

      const id = user.id.toString();
      const result = await userService.findOne(id);

      expect(userRepositoryMock.findById).toHaveBeenCalledWith(id);

      expect(result).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      });

      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar NotFoundException quando o usuário não existe', async () => {
      const id = '2e7ac8a0-ec8c-4b6f-9623-f3c90f0e4f1f';

      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(userService.findOne(id)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('update', () => {
    it('deve atualizar dados, normalizar email e username, e não alterar senha', async () => {
      const user = makeUser();

      const dto = {
        name: 'Paulo Campos Atualizado',
        email: '  NOVO.EMAIL@EXAMPLE.COM  ',
        username: '  Novo_Username  ',
        bio: 'Nova bio.',
      };

      const updatedUser = makeUser({
        name: 'Paulo Campos Atualizado',
        email: 'novo.email@example.com',
        username: 'novo_username',
        bio: 'Nova bio.',
      });

      userRepositoryMock.update.mockResolvedValue(updatedUser);

      const id = user.id.toString();
      const result = await userService.update(id, dto);

      expect(userRepositoryMock.update).toHaveBeenCalledWith(id, {
        name: 'Paulo Campos Atualizado',
        email: 'novo.email@example.com',
        username: 'novo_username',
        bio: 'Nova bio.',
      });

      expect(result).toMatchObject({
        id: updatedUser.id,
        name: 'Paulo Campos Atualizado',
        email: 'novo.email@example.com',
        username: 'novo_username',
        bio: 'Nova bio.',
      });

      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar NotFoundException quando não encontrar o usuário para atualizar', async () => {
      const id = '2e7ac8a0-ec8c-4b6f-9623-f3c90f0e4f1f';

      userRepositoryMock.update.mockResolvedValue(null);

      await expect(
        userService.update(id, { name: 'Novo nome' }),
      ).rejects.toThrow(new NotFoundException('Usuário não encontrado'));
    });
  });

  describe('remove', () => {
    it('deve remover o usuário quando ele existe', async () => {
      const user = makeUser();
      const id = user.id.toString();

      userRepositoryMock.delete.mockResolvedValue(user);

      await expect(userService.remove(id)).resolves.toBeUndefined();

      expect(userRepositoryMock.delete).toHaveBeenCalledWith(id);
    });

    it('deve lançar NotFoundException quando não encontrar usuário para remover', async () => {
      const id = '2e7ac8a0-ec8c-4b6f-9623-f3c90f0e4f1f';

      userRepositoryMock.delete.mockResolvedValue(null);

      await expect(userService.remove(id)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('search', () => {
    it('deve retornar usuários encontrados sem expor a senha', async () => {
      const users = [makeUser()];

      userRepositoryMock.search.mockResolvedValue(users);

      const result = await userService.search('paulo');

      expect(userRepositoryMock.search).toHaveBeenCalledWith('paulo');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        username: users[0].username,
      });
      expect(result[0]).not.toHaveProperty('password');
    });

    it('deve retornar uma lista vazia quando não encontrar usuários', async () => {
      userRepositoryMock.search.mockResolvedValue([]);

      await expect(userService.search('inexistente')).resolves.toEqual([]);
    });
  });
});
