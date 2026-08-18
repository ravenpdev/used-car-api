import { insertUserSchema, updateUserSchema } from '@app/database/schema';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(insertUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
