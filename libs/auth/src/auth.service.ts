import { DB, users, type NewUser } from '@app/database';
import { UsersService } from '@app/users';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB)
    private readonly db: NodePgDatabase<typeof import('@app/database/schema')>,
    private readonly usersService: UsersService,
  ) {}

  async signup(data: NewUser) {
    const isExists = await this.usersService.findByEmail(data.email);

    if (isExists) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await argon2.hash(data.password);

    const [user] = await this.db
      .insert(users)
      .values({ email: data.email, password: hashedPassword })
      .returning({ id: users.id });

    return user;
  }

  async signin(data: NewUser) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!(await argon2.verify(user.password, data.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return { id: user.id };
  }
}
