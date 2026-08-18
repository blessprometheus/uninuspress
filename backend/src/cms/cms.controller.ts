import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../generated/prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CmsService } from './cms.service';
import {
  CreatePageDto,
  UpdatePageDto,
  CreateServiceDto,
  UpdateServiceDto,
  CreatePackageDto,
  UpdatePackageDto,
} from './dto/cms.dto';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // Public
  @Get('pages/:slug')
  findPage(@Param('slug') slug: string) {
    return this.cmsService.findPage(slug);
  }

  @Get('services')
  findServices() {
    return this.cmsService.findServices();
  }

  @Get('packages')
  findPackages() {
    return this.cmsService.findPackages();
  }

  // Admin
  @Get('pages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAllPages() {
    return this.cmsService.findAllPages();
  }

  @Get('services/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAllServices() {
    return this.cmsService.findAllServices();
  }

  @Get('packages/all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  findAllPackages() {
    return this.cmsService.findAllPackages();
  }

  @Post('pages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  @Patch('pages/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.cmsService.updatePage(id, dto);
  }

  @Delete('pages/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(id);
  }

  @Post('services')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createService(@Body() dto: CreateServiceDto) {
    return this.cmsService.createService(dto);
  }

  @Patch('services/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.cmsService.updateService(id, dto);
  }

  @Delete('services/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteService(@Param('id') id: string) {
    return this.cmsService.deleteService(id);
  }

  @Post('packages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createPackage(@Body() dto: CreatePackageDto) {
    return this.cmsService.createPackage(dto);
  }

  @Patch('packages/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.cmsService.updatePackage(id, dto);
  }

  @Delete('packages/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deletePackage(@Param('id') id: string) {
    return this.cmsService.deletePackage(id);
  }
}
