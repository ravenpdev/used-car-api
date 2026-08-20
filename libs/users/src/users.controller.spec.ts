import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  let usersServiceMock = {
    all: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an empty array', async () => {
    usersServiceMock.all.mockReturnValue([]);
    expect(await controller.all()).toEqual([]);
  });

  it('should return all users', async () => {
    usersServiceMock.all.mockReturnValue([
      {
        id: 1,
        email: 'user1@test.com',
      },
      {
        id: 2,
        email: 'user2@test.com',
      },
    ]);

    const result = await controller.all();

    expect(result.length).toBe(2);
    expect(result[0].id).toBe(1);
    expect(result[0].email).toBe('user1@test.com');
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    };

    usersServiceMock.create.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
    });

    const result = await controller.create(dto);

    expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      id: 1,
      email: 'test@test.com',
    });
  });

  it('should throw a ConflictException when email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    };

    usersServiceMock.create.mockRejectedValue(
      new ConflictException('Email already exists'),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
  });

  it('should throw a NotFoundException when user is not found', async () => {
    usersServiceMock.findById.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    await expect(controller.findById('1')).rejects.toThrow(NotFoundException);
  });

  it('should return a user', async () => {
    usersServiceMock.findById.mockReturnValue({
      id: 1,
      email: 'test@test.com',
    });

    const result = await controller.findById('1');

    expect(result).toEqual({
      id: 1,
      email: 'test@test.com',
    });

    expect(usersServiceMock.findById).toHaveBeenCalledWith(1);
  });

  it('should return a user with updated email', async () => {
    const dto: UpdateUserDto = {
      email: 'update@test.com',
    };

    usersServiceMock.update.mockReturnValue({
      id: 1,
      email: 'update@test.com',
    });

    const result = await controller.update('1', dto);

    expect(result).toEqual({
      id: 1,
      email: 'update@test.com',
    });

    expect(usersServiceMock.update).toHaveBeenCalledWith(1, dto);
  });

  it('should return a NotFoundException when removing a non existing user', async () => {
    usersServiceMock.remove.mockRejectedValue(
      new NotFoundException('User not found'),
    );

    await expect(controller.removeById('1')).rejects.toThrow(NotFoundException);
    expect(usersServiceMock.remove).toHaveBeenCalledWith(1);
  });

  it('should return the id when user successfully deleted', async () => {
    usersServiceMock.remove.mockReturnValue({ id: 1 });

    const result = await controller.removeById('1');

    expect(result).toEqual({
      id: 1,
    });
    expect(usersServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
