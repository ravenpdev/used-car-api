import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/drizzle/drizzle.provider';
import * as schema from '../drizzle/schema';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { NewUser, users } from '../drizzle/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
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
