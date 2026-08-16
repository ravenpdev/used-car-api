import { createZodDto } from 'nestjs-zod';
import { insertUserSchema, updateUserSchema } from '../drizzle/schema';

export class CreateUserDto extends createZodDto(insertUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
