import { signupSchema, signinSchema } from '@app/database';
import { createZodDto } from 'nestjs-zod';

export class SignupDto extends createZodDto(signupSchema) {}

export class SigninDto extends createZodDto(signinSchema) {}
