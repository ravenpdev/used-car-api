import { UsersService } from '@app/users';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { SigninDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(data: SignupDto) {
    const hashedPassword = await argon2.hash(data.password);

    return this.usersService.create({
      email: data.email,
      password: hashedPassword,
    });
  }

  async signIn(data: SigninDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!(await argon2.verify(user.password, data.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { password, ...rest } = user;
    return rest;
  }
}
