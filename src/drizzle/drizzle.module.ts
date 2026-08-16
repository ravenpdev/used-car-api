import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE, DrizzleProvider } from './drizzle.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DrizzleProvider],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
