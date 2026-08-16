import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE } from 'src/drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { users, type User } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from './user.dto';

// NOTE: LIMITATION throwing NotFoundException in a service only works on HTTP
// Using this service in WebSocket or GRPC will not handle the exception

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  findAll() {
    return this.db.select().from(users);
  }

  async create(data: CreateUserDto): Promise<User> {
    try {
      const [user] = await this.db.insert(users).values(data).returning();

      return user;
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  async findById(id: number): Promise<User> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const [user] = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

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
