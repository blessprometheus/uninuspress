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
}
