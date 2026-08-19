/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hash:${value}`),
  compare: jest.fn(
    async (plain: string, hash: string) => hash === `hash:${plain}`,
  ),
}));

const verifiedUser = {
  id: 'u1',
  email: 'penulis@uninus.ac.id',
  name: 'Penulis',
  passwordHash: 'hash:rahasia123',
  role: Role.AUTHOR,
  emailVerifiedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const unverifiedUser = { ...verifiedUser, emailVerifiedAt: null };

function buildService() {
  const prismaMock: any = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailVerification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  prismaMock.$transaction = jest.fn(async (arg: any) => {
    if (typeof arg === 'function') return arg(prismaMock);
    return Promise.all(arg);
  });

  const jwtMock = { sign: jest.fn(() => 'jwt-token') };
  const mailMock = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  const service = new AuthService(
    prismaMock,
    jwtMock as unknown as JwtService,
    mailMock as unknown as MailService,
  );
  return { service, prismaMock, jwtMock, mailMock };
}

describe('AuthService', () => {
  describe('register', () => {
    it('membuat user AUTHOR + token verifikasi dan mengirim email tanpa accessToken', async () => {
      const { service, prismaMock, mailMock, jwtMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        ...verifiedUser,
        emailVerifiedAt: null,
      });

      const result = await service.register({
        email: 'penulis@uninus.ac.id',
        name: 'Penulis',
        password: 'rahasia123',
      });

      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(prismaMock.emailVerification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ expiresAt: expect.any(Date) }),
        }),
      );
      expect(mailMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(jwtMock.sign).not.toHaveBeenCalled();
      expect(result.message).toContain('Registrasi berhasil');
    });

    it('menolak register jika email sudah terdaftar', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(verifiedUser);

      await expect(
        service.register({
          email: 'penulis@uninus.ac.id',
          name: 'Penulis',
          password: 'rahasia123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('tidak menggagalkan register ketika email gagal dikirim (Section 23)', async () => {
      const { service, prismaMock, mailMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({
        ...verifiedUser,
        emailVerifiedAt: null,
      });
      mailMock.sendVerificationEmail.mockRejectedValueOnce(
        new Error('smtp down'),
      );

      const result = await service.register({
        email: 'penulis@uninus.ac.id',
        name: 'Penulis',
        password: 'rahasia123',
      });

      expect(result.message).toContain('Registrasi berhasil');
    });
  });

  describe('login', () => {
    it('mengembalikan accessToken untuk penulis terverifikasi', async () => {
      const { service, prismaMock, jwtMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(verifiedUser);

      const result = await service.login({
        email: 'penulis@uninus.ac.id',
        password: 'rahasia123',
      });

      expect(jwtMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'u1', role: Role.AUTHOR }),
      );
      expect(result.accessToken).toBe('jwt-token');
    });

    it('menolak login penulis yang belum verifikasi email', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(
        unverifiedUser,
      );

      await expect(
        service.login({
          email: 'penulis@uninus.ac.id',
          password: 'rahasia123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('menolak login dengan password salah', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(verifiedUser);

      await expect(
        service.login({
          email: 'penulis@uninus.ac.id',
          password: 'salah-benar',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('mengizinkan login admin meskipun emailVerifiedAt null (seed aktif langsung)', async () => {
      const { service, prismaMock, jwtMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
        ...verifiedUser,
        role: Role.ADMIN,
        emailVerifiedAt: null,
      });

      const result = await service.login({
        email: 'admin@uninus.ac.id',
        password: 'rahasia123',
      });

      expect(result.accessToken).toBe('jwt-token');
    });
  });

  describe('verifyEmail', () => {
    it('menandai email terverifikasi dan token terpakai', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.emailVerification.findUnique as jest.Mock).mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 1000),
        usedAt: null,
      });

      const result = await service.verifyEmail({ token: 'abc' });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({ emailVerifiedAt: expect.any(Date) }),
      });
      expect(prismaMock.emailVerification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
      expect(result.message).toContain('berhasil diverifikasi');
    });

    it('menolak token yang sudah digunakan', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.emailVerification.findUnique as jest.Mock).mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 1000),
        usedAt: new Date(),
      });

      await expect(
        service.verifyEmail({ token: 'abc' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('menolak token kedaluwarsa', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.emailVerification.findUnique as jest.Mock).mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });

      await expect(
        service.verifyEmail({ token: 'abc' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('resendVerification', () => {
    it('mengirim ulang token baru untuk pengguna belum terverifikasi', async () => {
      const { service, prismaMock, mailMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(
        unverifiedUser,
      );

      await service.resendVerification({ email: 'penulis@uninus.ac.id' });

      expect(prismaMock.emailVerification.updateMany).toHaveBeenCalled();
      expect(prismaMock.emailVerification.create).toHaveBeenCalled();
      expect(mailMock.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it('tidak membocorkan status email yang tidak terdaftar', async () => {
      const { service, prismaMock, mailMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.resendVerification({
        email: 'tidak-ada@uninus.ac.id',
      });

      expect(mailMock.sendVerificationEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('Jika email terdaftar');
    });
  });

  describe('forgotPassword', () => {
    it('membuat token reset dan mengirim email', async () => {
      const { service, prismaMock, mailMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(verifiedUser);

      await service.forgotPassword({ email: 'penulis@uninus.ac.id' });

      expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
      expect(mailMock.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    it('mengembalikan pesan generik untuk email tidak terdaftar', async () => {
      const { service, prismaMock, mailMock } = buildService();
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'tidak-ada@uninus.ac.id',
      });

      expect(mailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result.message).toContain('Jika email terdaftar');
    });
  });

  describe('resetPassword', () => {
    it('memperbarui password dan menandai token terpakai', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(
        {
          id: 'r1',
          userId: 'u1',
          expiresAt: new Date(Date.now() + 1000),
          usedAt: null,
        },
      );

      const result = await service.resetPassword({
        token: 'abc',
        newPassword: 'baru12345',
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { passwordHash: 'hash:baru12345' },
      });
      expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
      expect(result.message).toContain('berhasil diubah');
    });

    it('menolak token reset yang sudah kedaluwarsa', async () => {
      const { service, prismaMock } = buildService();
      (prismaMock.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(
        {
          id: 'r1',
          userId: 'u1',
          expiresAt: new Date(Date.now() - 1000),
          usedAt: null,
        },
      );

      await expect(
        service.resetPassword({ token: 'abc', newPassword: 'baru12345' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('logout', () => {
    it('mengembalikan pesan success tanpa state', () => {
      const { service } = buildService();
      expect(service.logout().message).toContain('Berhasil keluar');
    });
  });
});
