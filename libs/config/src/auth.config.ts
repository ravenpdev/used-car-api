import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  sessionSecret: process.env.SESSION_SECRET,
}));
