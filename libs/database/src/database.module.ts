import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@app/config';
import { DatabaseProvider, DB } from './database.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DatabaseProvider],
  exports: [DB],
})
export class DatabaseModule {}
