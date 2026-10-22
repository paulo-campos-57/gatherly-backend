import type { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRepository } from '@/features/user/repositories/user.repository.js';
import type { UserDocument } from '@/features/user/schemas/user.schema.js';
import { makeUser } from '@test/factories/user.factory.js';

describe('UserRepository', () => {
  const saveMock = vi.fn();
  const selectMock = vi.fn();
  const findOneExecMock = vi.fn();
  const findExecMock = vi.fn();
  const sortMock = vi.fn();
  const findOneAndUpdateExecMock = vi.fn();
  const findOneAndDeleteExecMock = vi.fn();

  const findOneMock = vi.fn();
  const findMock = vi.fn();
  const findOneAndUpdateMock = vi.fn();
  const findOneAndDeleteMock = vi.fn();
  const userModelMock = vi.fn(function (this: { save: typeof saveMock }) {
    this.save = saveMock;
  });

  const findOneQuery = {
    select: selectMock,
    exec: findOneExecMock,
  };
  const findQuery = {
    sort: sortMock,
    exec: findExecMock,
  };
  const findOneAndUpdateQuery = { exec: findOneAndUpdateExecMock };
  const findOneAndDeleteQuery = { exec: findOneAndDeleteExecMock };

  let userRepository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReturnValue(findOneQuery);
    findOneMock.mockReturnValue(findOneQuery);
    findMock.mockReturnValue(findQuery);
    sortMock.mockReturnValue(findQuery);
    findOneAndUpdateMock.mockReturnValue(findOneAndUpdateQuery);
    findOneAndDeleteMock.mockReturnValue(findOneAndDeleteQuery);
    userModelMock.mockImplementation(function (this: {
      save: typeof saveMock;
    }) {
      this.save = saveMock;
    });

    const model = Object.assign(userModelMock, {
      findOne: findOneMock,
      find: findMock,
      findOneAndUpdate: findOneAndUpdateMock,
      findOneAndDelete: findOneAndDeleteMock,
    }) as unknown as Model<UserDocument>;

    userRepository = new UserRepository(model);
  });

  it('cria e salva um usuário', async () => {
    const data = {
      name: 'Paulo Campos',
      email: 'paulo@example.com',
      username: 'paulo_campos',
      password: 'hash',
    };
    const user = makeUser();
    saveMock.mockResolvedValue(user);

    await expect(userRepository.create(data)).resolves.toBe(user);

    expect(userModelMock).toHaveBeenCalledWith(data);
    expect(saveMock).toHaveBeenCalledOnce();
  });

  it('busca por email normalizado e seleciona a senha', async () => {
    const user = makeUser();
    findOneExecMock.mockResolvedValue(user);

    await expect(
      userRepository.findByEmail('  PAULO.CAMPOS@EXAMPLE.COM  '),
    ).resolves.toBe(user);

    expect(findOneMock).toHaveBeenCalledWith({
      email: 'paulo.campos@example.com',
    });
    expect(selectMock).toHaveBeenCalledWith('+password');
    expect(findOneExecMock).toHaveBeenCalledOnce();
  });

  it('busca por username em minúsculas', async () => {
    const user = makeUser();
    findOneExecMock.mockResolvedValue(user);

    await expect(userRepository.findByUsername('Paulo_Campos')).resolves.toBe(
      user,
    );

    expect(findOneMock).toHaveBeenCalledWith({ username: 'paulo_campos' });
    expect(findOneExecMock).toHaveBeenCalledOnce();
  });

  it('busca por id', async () => {
    const user = makeUser();
    findOneExecMock.mockResolvedValue(user);

    await expect(userRepository.findById(user.id)).resolves.toBe(user);

    expect(findOneMock).toHaveBeenCalledWith({ id: user.id });
    expect(findOneExecMock).toHaveBeenCalledOnce();
  });

  it('lista todos os usuários', async () => {
    const users = [makeUser()];
    findExecMock.mockResolvedValue(users);

    await expect(userRepository.findAll()).resolves.toBe(users);

    expect(findMock).toHaveBeenCalledOnce();
    expect(findExecMock).toHaveBeenCalledOnce();
  });

  it('busca por texto normalizado, escapando caracteres especiais e ordena por data', async () => {
    const users = [makeUser()];
    findExecMock.mockResolvedValue(users);

    await expect(userRepository.search('  Paulo.*  ')).resolves.toBe(users);

    expect(findMock).toHaveBeenCalledWith({
      $or: [
        { id: 'Paulo.*' },
        { email: 'paulo.*' },
        { username: 'paulo.*' },
        { name: { $regex: /Paulo\.\*/i } },
      ],
    });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(findExecMock).toHaveBeenCalledOnce();
  });

  it('atualiza usuário com validadores e retorna o documento atualizado', async () => {
    const id = 'user-id';
    const data = { name: 'Nome atualizado' };
    const user = makeUser({ name: data.name });
    findOneAndUpdateExecMock.mockResolvedValue(user);

    await expect(userRepository.update(id, data)).resolves.toBe(user);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { id },
      { $set: data },
      { returnDocument: 'after', runValidators: true },
    );
    expect(findOneAndUpdateExecMock).toHaveBeenCalledOnce();
  });

  it('remove usuário por id', async () => {
    const id = 'user-id';
    const user = makeUser();
    findOneAndDeleteExecMock.mockResolvedValue(user);

    await expect(userRepository.delete(id)).resolves.toBe(user);

    expect(findOneAndDeleteMock).toHaveBeenCalledWith({ id });
    expect(findOneAndDeleteExecMock).toHaveBeenCalledOnce();
  });
});
