import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePackageDto,
  CreatePageDto,
  CreateServiceDto,
  UpdatePackageDto,
  UpdatePageDto,
  UpdateServiceDto,
} from './dto/cms.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  findPage(slug: string) {
    return this.prisma.cmsPage.findUnique({ where: { slug } });
  }

  findAllPages() {
    return this.prisma.cmsPage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findServices() {
    return this.prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findAllServices() {
    return this.prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  findPackages() {
    return this.prisma.package.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findAllPackages() {
    return this.prisma.package.findMany({ orderBy: { createdAt: 'asc' } });
  }

  createPage(dto: CreatePageDto) {
    return this.prisma.cmsPage.create({ data: dto });
  }

  async updatePage(id: string, dto: UpdatePageDto) {
    await this.ensurePage(id);
    return this.prisma.cmsPage.update({ where: { id }, data: dto });
  }

  async deletePage(id: string) {
    await this.ensurePage(id);
    return this.prisma.cmsPage.delete({ where: { id } });
  }

  createService(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async updateService(id: string, dto: UpdateServiceDto) {
    await this.ensureService(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async deleteService(id: string) {
    await this.ensureService(id);
    return this.prisma.service.delete({ where: { id } });
  }

  createPackage(dto: CreatePackageDto) {
    return this.prisma.package.create({ data: dto });
  }

  async updatePackage(id: string, dto: UpdatePackageDto) {
    await this.ensurePackage(id);
    return this.prisma.package.update({ where: { id }, data: dto });
  }

  async deletePackage(id: string) {
    await this.ensurePackage(id);
    return this.prisma.package.delete({ where: { id } });
  }

  private async ensurePage(id: string) {
    const page = await this.prisma.cmsPage.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Halaman tidak ditemukan');
  }

  private async ensureService(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Layanan tidak ditemukan');
  }

  private async ensurePackage(id: string) {
    const paket = await this.prisma.package.findUnique({ where: { id } });
    if (!paket) throw new NotFoundException('Paket tidak ditemukan');
  }
}
