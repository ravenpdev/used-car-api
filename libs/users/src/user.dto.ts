import { signupSchema, updateUserSchema } from '@app/database/schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(signupSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
