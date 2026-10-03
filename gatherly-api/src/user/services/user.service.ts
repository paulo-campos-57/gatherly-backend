import {
  NotFoundException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../auth/hasher/password-hasher.js';
import { CreateUserDTO } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { UserRepository } from '../repositories/user.repository.js';
import { UserDocument } from '../schemas/user.schema.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  //#region private methods
  private toResponse(user: UserDocument) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private handleDuplicateKey(err: unknown): void {
    const conflictCondition =
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === 1100;

    if (conflictCondition)
      throw new ConflictException('E-mail ou username já está em uso');
  }
  //#endregion

  //#region Public methods
  async create(createUserDto: CreateUserDTO) {
    const email = createUserDto.email.trim().toLowerCase();
    const username = createUserDto.username.trim().toLowerCase();

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new ConflictException('E-mail já cadastrado');

    const existingUname = await this.userRepository.findByUsername(username);
    if (existingUname) throw new ConflictException('Nome de usuário já em uso');

    const passwordHash = await this.passwordHasher.hash(createUserDto.password);

    const user = await this.userRepository.create({
      ...createUserDto,
      email,
      username,
      password: passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll() {
    const users = await this.userRepository.findAll();
    return users.map((u) => this.toResponse(u));
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException('Usuário não econtrado');

    return this.toResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: UpdateUserDto = { ...updateUserDto };

    if (data.email !== undefined) data.email = data.email.trim().toLowerCase();

    if (data.username !== undefined)
      data.username = data.username.trim().toLowerCase();

    try {
      const user = await this.userRepository.update(id, data);

      if (!user) throw new NotFoundException('Usuário não encontrado');

      return this.toResponse(user);
    } catch (err) {
      this.handleDuplicateKey(err);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.delete(id);

    if (!user) throw new NotFoundException('Usuário não encontrado');
  }
  //#endregion
}
