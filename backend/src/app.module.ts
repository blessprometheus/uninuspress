import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { CmsModule } from './cms/cms.module';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { ManuscriptsModule } from './manuscripts/manuscripts.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 120 }],
      errorMessage: 'Terlalu banyak permintaan. Coba lagi nanti.',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ManuscriptsModule,
    CmsModule,
    BooksModule,
    ContactModule,
    MailModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
