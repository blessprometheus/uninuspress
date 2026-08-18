import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto } from './dto/books.dto';

const STATUS_TRANSITIONS: Record<BookStatus, BookStatus[]> = {
  DRAFT: [BookStatus.SUBMITTED],
  SUBMITTED: [BookStatus.APPROVED, BookStatus.REJECTED],
  APPROVED: [BookStatus.SUBMITTED],
  REJECTED: [BookStatus.SUBMITTED],
};

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.book.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book || !book.published)
      throw new NotFoundException('Buku tidak ditemukan');
    return book;
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({ data: dto });
  }

  async update(id: string, dto: UpdateBookDto) {
    await this.ensureBook(id);
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  async changeStatus(id: string, status: BookStatus) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');

    if (!STATUS_TRANSITIONS[book.status].includes(status)) {
      throw new BadRequestException(
        `Transisi ${book.status} -> ${status} tidak diizinkan`,
      );
    }

    return this.prisma.book.update({
      where: { id },
      data: {
        status,
        published: status === BookStatus.APPROVED,
      },
    });
  }

  async remove(id: string) {
    await this.ensureBook(id);
    return this.prisma.book.delete({ where: { id } });
  }

  private async ensureBook(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Buku tidak ditemukan');
  }
}
