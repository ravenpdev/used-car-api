import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './auth.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/signup')
  async signUp(
    @Session() session: Record<string, any>,
    @Body() body: SignupDto,
  ) {
    const user = await this.authService.signup(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signin')
  async sigIn(
    @Session() session: Record<string, any>,
    @Body() body: SigninDto,
  ) {
    const user = await this.authService.signin(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  signOut(@Session() session: Record<string, any>) {
    session.userId = null;
  }

  @Get('/whoami')
  whoAmI(@Session() session: Record<string, any>) {
    return this.usersService.findById(Number(session.userId));
  }
}
