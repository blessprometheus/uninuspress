import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Role } from '../generated/prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FilesService } from '../files/files.service';
import {
  CreateManuscriptDto,
  ListManuscriptsQueryDto,
  UpdateStatusDto,
  VerifyFileDto,
} from './dto/manuscript.dto';
import { ManuscriptsService } from './manuscripts.service';

@Controller('manuscripts')
export class ManuscriptsController {
  constructor(
    private readonly manuscriptsService: ManuscriptsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateManuscriptDto,
  ) {
    return this.manuscriptsService.create(user.id, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  findAll(
    @CurrentUser() user: { id: string; role: Role },
    @Query() query: ListManuscriptsQueryDto,
  ) {
    if (user.role === Role.AUTHOR) {
      return this.manuscriptsService.findAllByUser(user.id);
    }
    return this.manuscriptsService.findAll(query.status);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.manuscriptsService.findOne(id, user.role, user.id);
  }

  @Post(':id/files')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'manuscript', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
      { name: 'proposal', maxCount: 1 },
    ]),
  )
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      manuscript?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      proposal?: Express.Multer.File[];
    },
    @CurrentUser() user: { id: string; role: Role },
  ) {
    await this.manuscriptsService.findOne(id, user.role, user.id);
    const uploaded: Awaited<
      ReturnType<typeof this.filesService.uploadToManuscript>
    >[] = [];
    if (files.manuscript) {
      uploaded.push(
        await this.filesService.uploadToManuscript(
          id,
          files.manuscript[0],
          'MANUSCRIPT',
        ),
      );
    }
    if (files.cover) {
      uploaded.push(
        await this.filesService.uploadToManuscript(id, files.cover[0], 'COVER'),
      );
    }
    if (files.proposal) {
      uploaded.push(
        await this.filesService.uploadToManuscript(
          id,
          files.proposal[0],
          'PROPOSAL',
        ),
      );
    }
    if (uploaded.length === 0) {
      throw new BadRequestException('Tidak ada file yang di-upload');
    }
    return uploaded;
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  changeStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() actor: { id: string; role: Role },
  ) {
    return this.manuscriptsService.changeStatus(id, dto, actor);
  }

  @Post(':fileId/download-url')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN, Role.AUTHOR)
  async getDownloadUrl(@Param('fileId') fileId: string) {
    return { url: await this.filesService.getDownloadUrl(fileId) };
  }

  @Patch(':fileId/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  verifyFile(
    @Param('fileId') fileId: string,
    @Body() dto: VerifyFileDto,
    @CurrentUser() actor: { id: string },
  ) {
    return this.manuscriptsService.verifyFile(fileId, dto.verified, actor.id);
  }
}
