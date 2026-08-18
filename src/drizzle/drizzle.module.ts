import { Global, Module } from '@nestjs/common';
import { DRIZZLE, DrizzleProvider } from './drizzle.provider';
import { ConfigModule } from '@app/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DrizzleProvider],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
