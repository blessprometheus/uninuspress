import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET) mengembalikan status ok', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', db: 'up' });
  });

  it('rute yang tidak dikenal mengembalikan format error konsisten', () => {
    return request(app.getHttpServer())
      .get('/api/tidak-ada')
      .expect(404)
      .expect((res) => {
        const body = res.body as {
          success: boolean;
          message: string;
          code: string;
        };
        expect(body.success).toBe(false);
        expect(body.code).toBe('NOT_FOUND');
        expect(body.message).toBe('Halaman tidak ditemukan');
      });
  });
});
