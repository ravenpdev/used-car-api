import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@app/config';
import { DatabaseProvider, DB, DB_CLIENT } from './database.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: DatabaseProvider,
  exports: [DB, DB_CLIENT],
})
export class DatabaseModule {}
