import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, CurrentUser } from '@app/common';
import type { UserWithoutPassword } from '@app/database';
import { SigninDto, SignupDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Session() session: Record<string, any>,
    @Body() body: SignupDto,
  ) {
    const user = await this.authService.signUp(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signin')
  async sigIn(
    @Session() session: Record<string, any>,
    @Body() body: SigninDto,
  ) {
    const user = await this.authService.signIn(body);
    session.userId = user.id;

    return user;
  }

  @Post('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Session() session: Record<string, any>) {
    session.userId = null;
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() currentUser: UserWithoutPassword) {
    return currentUser;
  }
}
