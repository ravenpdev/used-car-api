import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@app/users';
import { DB } from '@app/database';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  jest.mock('argon2', () => ({
    hash: jest.fn(),
    verify: jest.fn(),
  }));

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: DB,
          useValue: DB,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ConflictException when email already exists', async () => {
    usersServiceMock.create.mockRejectedValue(
      new ConflictException('Email already exits'),
    );

    await expect(
      service.signUp({
        email: 'test@test.com',
        password: 'password',
        confirmPassword: 'password',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should register successfully', async () => {
    usersServiceMock.create.mockResolvedValue({
      email: 'test@test.com',
      password: 'password',
    });

    const result = await service.signUp({
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result).toEqual({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('should throw UnauthorizedException if email not found', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      service.signIn({ email: 'test@test.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for invalid password', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashed-password',
    });

    jest.spyOn(argon2, 'verify').mockResolvedValue(false);

    await expect(
      service.signIn({ email: 'test@test.com', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should login successfully', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashed-password',
    });

    jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    const result = await service.signIn({
      email: 'test@test.com',
      password: 'password',
    });

    expect(result).toEqual({
      id: 1,
      email: 'test@test.com',
    });
  });
});
