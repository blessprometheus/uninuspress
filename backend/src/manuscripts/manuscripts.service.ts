import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ManuscriptStatus, Role } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManuscriptDto, UpdateStatusDto } from './dto/manuscript.dto';

const TRANSITIONS: Record<
  ManuscriptStatus,
  { to: ManuscriptStatus[]; role: Role[] }
> = {
  [ManuscriptStatus.DRAFT]: {
    to: [ManuscriptStatus.SUBMITTED],
    role: [Role.AUTHOR],
  },
  [ManuscriptStatus.SUBMITTED]: {
    to: [ManuscriptStatus.REVIEW],
    role: [Role.EDITOR, Role.ADMIN],
  },
  [ManuscriptStatus.REVIEW]: {
    to: [ManuscriptStatus.ACCEPTED, ManuscriptStatus.REJECTED],
    role: [Role.EDITOR, Role.ADMIN],
  },
  [ManuscriptStatus.ACCEPTED]: {
    to: [ManuscriptStatus.IN_PRODUCTION],
    role: [Role.EDITOR, Role.ADMIN],
  },
  [ManuscriptStatus.REJECTED]: {
    to: [],
    role: [],
  },
  [ManuscriptStatus.IN_PRODUCTION]: {
    to: [ManuscriptStatus.PUBLISHED],
    role: [Role.EDITOR, Role.ADMIN],
  },
  [ManuscriptStatus.PUBLISHED]: {
    to: [],
    role: [],
  },
};

@Injectable()
export class ManuscriptsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateManuscriptDto) {
    return this.prisma.manuscript.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        status: ManuscriptStatus.DRAFT,
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.manuscript.findMany({
      where: { userId },
      include: { files: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(status?: ManuscriptStatus) {
    return this.prisma.manuscript.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true } },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, role: Role, userId: string) {
    const manuscript = await this.prisma.manuscript.findUnique({
      where: { id },
      include: { files: true, history: { orderBy: { createdAt: 'desc' } } },
    });
    if (!manuscript) throw new NotFoundException('Naskah tidak ditemukan');
    if (role === Role.AUTHOR && manuscript.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses');
    }
    return manuscript;
  }

  async changeStatus(
    id: string,
    dto: UpdateStatusDto,
    actor: { id: string; role: Role },
  ) {
    const manuscript = await this.prisma.manuscript.findUnique({
      where: { id },
    });
    if (!manuscript) throw new NotFoundException('Naskah tidak ditemukan');

    const transition = TRANSITIONS[manuscript.status];
    if (!transition.to.includes(dto.status)) {
      throw new BadRequestException(
        `Transisi ${manuscript.status} -> ${dto.status} tidak diizinkan`,
      );
    }
    if (!transition.role.includes(actor.role)) {
      throw new ForbiddenException(
        'Peran Anda tidak diizinkan untuk transisi ini',
      );
    }

    await this.prisma.manuscriptStatusHistory.create({
      data: {
        manuscriptId: id,
        from: manuscript.status,
        to: dto.status,
        changedById: actor.id,
        note: dto.note,
      },
    });

    return this.prisma.manuscript.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async verifyFile(fileId: string, verified: boolean, actorId: string) {
    const file = await this.prisma.manuscriptFile.findUnique({
      where: { id: fileId },
    });
    if (!file) throw new NotFoundException('Berkas tidak ditemukan');

    return this.prisma.manuscriptFile.update({
      where: { id: fileId },
      data: {
        verified,
        verifiedById: verified ? actorId : null,
        verifiedAt: verified ? new Date() : null,
      },
    });
  }
}
