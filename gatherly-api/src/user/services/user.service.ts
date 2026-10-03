import { ConflictException, Inject, Injectable } from '@nestjs/common';

import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../auth/hasher/password-hasher.js';
import { CreateUserDTO } from './dto/create-user.dto.js';
import { UserRepository } from './repository/user.repository.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

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
}
