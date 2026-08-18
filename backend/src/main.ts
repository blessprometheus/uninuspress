import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
