import {
  type Database,
  DB,
  users,
  type User,
  type UserWithoutPassword,
} from '@app/database';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB)
    private readonly db: Database,
  ) {}

  all(): Promise<UserWithoutPassword[]> {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  }

  async create(data: CreateUserDto): Promise<UserWithoutPassword> {
    const isExist = await this.findByEmail(data.email);

    if (isExist) {
      throw new ConflictException('Email already exists');
    }

    const [user] = await this.db.insert(users).values(data).returning({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return user;
  }

  async findById(id: number): Promise<UserWithoutPassword> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }

  async update(id: number, data: UpdateUserDto): Promise<UserWithoutPassword> {
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: number) {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
