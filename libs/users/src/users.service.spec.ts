import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  Database,
  DatabaseProvider,
  DB,
  DB_CLIENT,
  users,
} from '@app/database';
import { ConfigModule } from '@app/config';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import postgres from 'postgres';
import { sql, eq } from 'drizzle-orm';

describe('UsersService (integration)', () => {
  let service: UsersService;
  let module: TestingModule;
  let db: Database;
  let client: ReturnType<typeof postgres>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [UsersService, DatabaseProvider].flat(),
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get(DB);
    client = module.get(DB_CLIENT);
  });

  afterEach(async () => {
    await db.execute(
      sql`
        TRUNCATE TABLE
          users
        RESTART IDENTITY
        CASCADE;
      `,
    );
  });

  afterAll(async () => {
    await client.end();
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an empty array', async () => {
    const result = await service.all();
    expect(result).toHaveLength(0);

    const rows = await db.select().from(users);
    expect(rows).toHaveLength(0);
  });

  it('should return all users', async () => {
    await Promise.all([
      service.create({
        email: 'test1@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      }),
      service.create({
        email: 'test2@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      }),
      service.create({
        email: 'test3@test.com',
        password: 'P@ssw0rd',
        confirmPassword: 'P@ssw0rd',
      }),
    ]);

    expect(await service.all()).toHaveLength(3);

    const rows = await db.select().from(users);
    expect(rows).toHaveLength(3);
  });

  it('should throw a 404 when user with the given ID is not found', async () => {
    const userId = 1;
    await expect(service.findById(userId)).rejects.toThrow(NotFoundException);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    expect(user).toBeUndefined();
  });

  it('should return a user when given ID exist', async () => {
    const userId = 1;

    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await service.create(dto);

    expect(await service.findById(userId)).toMatchObject({
      id: userId,
      email: 'test@test.com',
    });

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .limit(1);

    expect(user.id).toBe(userId);
    expect(user.email).toBe(dto.email);
  });

  it('should create a user', async () => {
    const result = await service.create({
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    });

    expect(result).toMatchObject({
      id: 1,
      email: 'test@test.com',
    });

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@test.com'));

    expect(rows).toHaveLength(1);
  });

  it('should throw a 409 when email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await service.create(dto);
    await expect(service.create(dto)).rejects.toThrow(ConflictException);

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@test.com'));
    expect(rows).toHaveLength(1);
  });

  it('should return a user when given an email that exist', async () => {
    const createDto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await service.create(createDto);

    expect(await service.findByEmail(createDto.email)).toMatchObject({
      id: 1,
      email: 'test@test.com',
    });

    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, createDto.email))
      .limit(1);
    expect(user).toMatchObject({
      id: 1,
      email: createDto.email,
    });
  });

  it('should update user email', async () => {
    const createDto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    const { id, updatedAt: updatedAtOnCreate } =
      await service.create(createDto);

    const updateDto: UpdateUserDto = {
      email: 'update@test.com',
    };

    const { email, updatedAt } = await service.update(id, updateDto);
    expect(email).toBe(updateDto.email);
    expect(updatedAt).not.toBe(updatedAtOnCreate);
  });

  it('should update user password', async () => {
    const createDto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    const { id, updatedAt: updatedAtOnCreate } =
      await service.create(createDto);

    const updateDto: UpdateUserDto = {
      password: 'P@ssw0rd123',
    };

    const { updatedAt } = await service.update(id, updateDto);
    // Here we compare the updatedAt here, because in service.update we exluced the password from drizzle select query
    expect(updatedAt).not.toBe(updatedAtOnCreate);
  });

  it('should throw 404 when updating a user with the given ID is non-existent', async () => {
    const createDto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await service.create(createDto);

    const updateDto: UpdateUserDto = {
      password: 'P@ssw0rd123',
    };

    await expect(service.update(2, updateDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a user', async () => {
    const userId = 1;
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'P@ssw0rd',
      confirmPassword: 'P@ssw0rd',
    };

    await service.create(dto);
    await service.remove(userId);

    const rows = await db.select().from(users);
    expect(rows).toHaveLength(0);
  });

  it('should throw 404 when deleting a user with a non-existent ID', async () => {
    const userId = 1;
    await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
  });
});
