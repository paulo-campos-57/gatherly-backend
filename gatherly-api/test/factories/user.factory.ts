import type { UserDocument } from '@/user/schemas/user.schema.js';

type UserFactoryOverrides = Partial<UserDocument>;

export function makeUser(overrides: UserFactoryOverrides = {}): UserDocument {
  const user = {
    id: '2e7ac8a0-ec8c-4b6f-9623-f3c90f0e4f1f',
    name: 'Paulo Campos',
    email: 'paulo.campos@example.com',
    username: 'paulo_campos',
    password: '$argon2id$v=19$m=65536,t=3,p=4$hash-exemplo',
    bio: 'Desenvolvedor full-stack.',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-10-06T00:00:00.000Z'),
    updatedAt: new Date('2026-10-06T00:00:00.000Z'),

    _id: 'mongo-object-id-falso',
    __v: 0,
  } as unknown as UserDocument;

  return {
    ...user,
    ...overrides,
  } as UserDocument;
}
