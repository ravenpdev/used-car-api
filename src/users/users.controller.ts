import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    console.log(body);
    // return this.usersService.create(body);
  }

  @Get('/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(Number(id), body);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeById(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
