import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({ data: dto });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Pesan tidak ditemukan');
    return this.prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
  }
}
