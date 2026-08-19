import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { ManuscriptStatus } from '../generated/prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendStatusEmail(to: string, title: string, status: ManuscriptStatus) {
    await this.mailer.sendMail({
      to,
      subject: `Status Pengajuan Naskah: ${title}`,
      template: 'status',
      context: {
        title,
        status: status.replace('_', ' ').toLowerCase(),
        baseUrl:
          this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Selamat datang di Uninus Press',
      template: 'welcome',
      context: {
        name,
        baseUrl:
          this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Verifikasi Email — Uninus Press',
      template: 'verify-email',
      context: {
        name,
        verificationUrl: this.frontendUrl(`/verifikasi-email?token=${token}`),
      },
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    await this.mailer.sendMail({
      to,
      subject: 'Reset Password — Uninus Press',
      template: 'reset-password',
      context: {
        name,
        resetUrl: this.frontendUrl(`/reset-password?token=${token}`),
      },
    });
  }

  private frontendUrl(path: string) {
    const base =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}${path}`;
  }
}
