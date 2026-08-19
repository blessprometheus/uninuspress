import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@uninus.ac.id';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
  const editorEmail = process.env.SEED_EDITOR_EMAIL ?? 'editor@uninus.ac.id';
  const editorPassword = process.env.SEED_EDITOR_PASSWORD ?? 'editor12345';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrator',
        passwordHash,
        role: Role.ADMIN,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Admin dibuat: ${adminEmail}`);
  } else {
    if (!existing.emailVerifiedAt) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { emailVerifiedAt: new Date() },
      });
      console.log(`Admin diaktifkan: ${adminEmail}`);
    } else {
      console.log(`Admin sudah ada: ${adminEmail}`);
    }
  }

  const editor = await prisma.user.findUnique({ where: { email: editorEmail } });
  if (!editor) {
    const passwordHash = await bcrypt.hash(editorPassword, 10);
    await prisma.user.create({
      data: {
        email: editorEmail,
        name: 'Editor',
        passwordHash,
        role: Role.EDITOR,
        emailVerifiedAt: new Date(),
      },
    });
    console.log(`Editor dibuat: ${editorEmail}`);
  } else {
    if (!editor.emailVerifiedAt) {
      await prisma.user.update({
        where: { email: editorEmail },
        data: { emailVerifiedAt: new Date() },
      });
      console.log(`Editor diaktifkan: ${editorEmail}`);
    } else {
      console.log(`Editor sudah ada: ${editorEmail}`);
    }
  }

  const services = [
    {
      title: 'Pengurusan ISBN',
      description:
        'Bantu pengurusan ISBN untuk setiap buku yang diterbitkan agar memiliki nomor resmi nasional.',
      icon: '📖',
      sortOrder: 1,
    },
    {
      title: 'Layanan Terpadu (One Stop Service)',
      description:
        'Seluruh proses penerbitan dari pengajuan hingga terbit ditangani dalam satu layanan terpadu.',
      icon: '⚙️',
      sortOrder: 2,
    },
    {
      title: 'Penyuntingan dan Tata Letak',
      description:
        'Editor dan layouter profesional untuk menyempurnakan naskah Anda.',
      icon: '✍️',
      sortOrder: 3,
    },
    {
      title: 'Desain Sampul Buku',
      description:
        'Desain sampul yang menarik sesuai tema dan target pembaca buku Anda.',
      icon: '🎨',
      sortOrder: 4,
    },
    {
      title: 'Pemasaran Buku',
      description:
        'Buku Anda dipasarkan melalui toko online dan kanal distribusi Uninus Press.',
      icon: '📣',
      sortOrder: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: (await prisma.service.findFirst({ where: { title: service.title } }))?.id ?? 'none' },
      update: {},
      create: service,
    });
  }
  console.log(`Layanan di-seed: ${services.length}`);

  const pages = [
    {
      slug: 'tentang',
      title: 'Tentang Kami',
      content:
        'Uninus Press adalah penerbit akademis di lingkungan Universitas Islam Nusantara yang menerbitkan buku untuk kepentingan akademis, pendidikan, dan kebudayaan.',
    },
    {
      slug: 'layanan',
      title: 'Layanan Penerbitan Buku',
      content:
        'Uninus Press menyediakan layanan terpadu penerbitan buku dari pengajuan naskah hingga pemasaran.',
    },
  ];

  for (const page of pages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`Halaman CMS di-seed: ${pages.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });