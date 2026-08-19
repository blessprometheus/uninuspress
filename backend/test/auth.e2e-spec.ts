/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MailService } from './../src/mail/mail.service';
import { PrismaService } from './../src/prisma/prisma.service';

const sentEmails: Array<{ to: string; type: string; token?: string }> = [];
const mailMock = {
  sendVerificationEmail: jest.fn(
    async (to: string, _name: string, token: string) => {
      sentEmails.push({ to, type: 'verify', token });
    },
  ),
  sendPasswordResetEmail: jest.fn(
    async (to: string, _name: string, token: string) => {
      sentEmails.push({ to, type: 'reset', token });
    },
  ),
  sendStatusEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(mailMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  function emailFor(prefix: string) {
    return `${prefix}-${Date.now()}@uninus.test`;
  }

  describe('alur register → verifikasi → login → me', () => {
    it('menolak login penulis sebelum verifikasi, kemudian sukses setelah verifikasi', async () => {
      const email = emailFor('penulis');

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, name: 'Penulis', password: 'rahasia123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('Registrasi berhasil');
        });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'rahasia123' })
        .expect(401);

      const verifyEmail = sentEmails.find(
        (e) => e.to === email && e.type === 'verify',
      );
      expect(verifyEmail?.token).toBeDefined();

      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({ token: verifyEmail?.token })
        .expect(200);

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'rahasia123' })
        .expect(200);
      expect(loginRes.body.accessToken).toBeDefined();

      const token = loginRes.body.accessToken as string;

      const meRes = await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(meRes.body.email).toBe(email);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('menolak token verifikasi yang tidak valid', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({ token: 'tidak-ada-token' })
        .expect(400);
    });
  });

  describe('alur forgot → reset → login', () => {
    it('mereset password dan memungkinkan login dengan password baru', async () => {
      const email = emailFor('reset');

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, name: 'Penulis Reset', password: 'rahasia123' })
        .expect(201);

      const verifyEmail = sentEmails.find(
        (e) => e.to === email && e.type === 'verify',
      );
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({ token: verifyEmail?.token })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email })
        .expect(200);

      const resetEmail = sentEmails.find(
        (e) => e.to === email && e.type === 'reset',
      );
      expect(resetEmail?.token).toBeDefined();

      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: resetEmail?.token, newPassword: 'passwordbaru1' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'rahasia123' })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'passwordbaru1' })
        .expect(200);
    });

    it('tidak membocorkan email yang tidak terdaftar', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'hantu@uninus.test' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Jika email terdaftar');
        });
    });
  });

  describe('authorization', () => {
    it('menolak akses /users tanpa token', async () => {
      await request(app.getHttpServer()).get('/api/users').expect(401);
    });

    it('menolak akses /users untuk role AUTHOR (forbidden)', async () => {
      const email = emailFor('authz');

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, name: 'Penulis Authz', password: 'rahasia123' })
        .expect(201);

      const verifyEmail = sentEmails.find(
        (e) => e.to === email && e.type === 'verify',
      );
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({ token: verifyEmail?.token })
        .expect(200);

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'rahasia123' })
        .expect(200);
      const token = loginRes.body.accessToken as string;

      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('validasi password policy', () => {
    it('menolak password tanpa angka', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: emailFor('polisi'),
          name: 'Polisi',
          password: 'hanya-huruf',
        })
        .expect(400);
    });

    it('menolak password lebih pendek dari 8 karakter', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: emailFor('pendek'), name: 'Pendek', password: 'a1' })
        .expect(400);
    });
  });
});
