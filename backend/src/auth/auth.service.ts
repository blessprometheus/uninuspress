import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Role } from '../generated/prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  ResendVerificationDto,
  VerifyEmailDto,
} from './dto/auth.dto';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const token = randomBytes(32).toString('hex');

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash,
          role: Role.AUTHOR,
        },
      });
      await tx.emailVerification.create({
        data: {
          userId: created.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        },
      });
      return created;
    });

    await this.safeSendEmail(() =>
      this.mail.sendVerificationEmail(user.email, user.name, token),
    );

    return {
      message: 'Registrasi berhasil. Periksa email untuk verifikasi akun.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email atau password salah');
    }
    if (user.role === Role.AUTHOR && user.emailVerifiedAt === null) {
      throw new UnauthorizedException(
        'Email belum diverifikasi. Periksa kotak masuk Anda.',
      );
    }
    return { accessToken: this.sign(user.id, user.email, user.role) };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.prisma.emailVerification.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (!record || record.usedAt) {
      throw new BadRequestException(
        'Token verifikasi tidak valid atau sudah digunakan',
      );
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token verifikasi sudah kedaluwarsa');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerification.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Email berhasil diverifikasi. Silakan masuk.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user && user.emailVerifiedAt === null) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.$transaction([
        this.prisma.emailVerification.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        this.prisma.emailVerification.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
          },
        }),
      ]);
      await this.safeSendEmail(() =>
        this.mail.sendVerificationEmail(user.email, user.name, token),
      );
    }
    return {
      message:
        'Jika email terdaftar dan belum terverifikasi, tautan baru telah dikirim.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.$transaction([
        this.prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        this.prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + RESET_TTL_MS),
          },
        }),
      ]);
      await this.safeSendEmail(() =>
        this.mail.sendPasswordResetEmail(user.email, user.name, token),
      );
    }
    return {
      message: 'Jika email terdaftar, tautan reset password telah dikirim.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (!record || record.usedAt) {
      throw new BadRequestException(
        'Token reset tidak valid atau sudah digunakan',
      );
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token reset sudah kedaluwarsa');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { message: 'Password berhasil diubah. Silakan masuk.' };
  }

  logout() {
    return { message: 'Berhasil keluar.' };
  }

  private async safeSendEmail(send: () => Promise<unknown>) {
    try {
      await send();
    } catch (err) {
      this.logger.error(
        `Gagal mengirim email: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private sign(sub: string, email: string, role: string) {
    return this.jwt.sign({ sub, email, role });
  }
}
