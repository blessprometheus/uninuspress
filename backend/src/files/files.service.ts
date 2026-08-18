import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED_MIME: Record<string, string[]> = {
  MANUSCRIPT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  COVER: ['image/jpeg', 'image/png', 'image/webp'],
  PROPOSAL: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

@Injectable()
export class FilesService {
  private s3: S3Client;
  private bucket: string;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.s3 = new S3Client({
      region: config.get<string>('S3_REGION') ?? 'ap-southeast-1',
      endpoint: config.get<string>('S3_ENDPOINT'),
      credentials: {
        accessKeyId: config.get<string>('S3_ACCESS_KEY_ID') ?? '',
        secretAccessKey: config.get<string>('S3_SECRET_ACCESS_KEY') ?? '',
      },
    });
    this.bucket = config.get<string>('S3_BUCKET') ?? 'uninus-press';
  }

  async uploadToManuscript(
    manuscriptId: string,
    file: Express.Multer.File,
    type: FileType,
  ) {
    const allowed = ALLOWED_MIME[type];
    if (!allowed || !allowed.includes(file.mimetype)) {
      throw new BadRequestException(`Tipe file tidak diizinkan untuk ${type}`);
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('Ukuran file maksimal 20 MB');
    }

    const key = `manuscripts/${manuscriptId}/${type.toLowerCase()}/${Date.now()}-${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.prisma.manuscriptFile.create({
      data: {
        manuscriptId,
        type,
        originalName: file.originalname,
        key,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async getDownloadUrl(fileId: string) {
    const file = await this.prisma.manuscriptFile.findUnique({
      where: { id: fileId },
    });
    if (!file) throw new NotFoundException('File tidak ditemukan');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 900 });
  }

  async getPublicUrl(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async removeFile(fileId: string) {
    const file = await this.prisma.manuscriptFile.findUnique({
      where: { id: fileId },
    });
    if (!file) return;
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: file.key }),
    );
    await this.prisma.manuscriptFile.delete({ where: { id: fileId } });
  }
}
