import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { CurrentUserInterceptor, HttpExceptionFilter } from '@app/common';
import { ConfigModule } from '@app/config';
import { DatabaseModule } from '@app/database';
import { UsersModule } from '@app/users';
import { AuthModule } from '@app/auth';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.configService.getOrThrow('auth.sessionSecret'),
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes('*');
  }
}
