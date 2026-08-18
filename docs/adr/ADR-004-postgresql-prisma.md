# ADR-004: PostgreSQL and Prisma

- **Status:** Accepted
- **Tanggal:** 2026-08-13
- **Context:** Data relasional: user, submission, file, status history, buku, CMS, email log, token. Perlu constraint di level database dan migration yang versioned.
- **Alternatives:**
  - TypeORM/Sequelize — kapabilitas serupa, ekosistem Prisma lebih jelas untuk schema-first.
  - MySQL — terima; Postgres dipilih karena fitur enum, constraint, dan tooling.
- **Decision:** Gunakan **PostgreSQL + Prisma ORM**.
  - Schema-first; semua perubahan schema lewat **migration** (`prisma migrate`), tidak ada perubahan manual pada DB production.
  - Entity inti (lihat Section 30 requirements):

    ```text
    User, Submission, SubmissionFile, SubmissionStatusHistory,
    Book, Page, Service, PricingPackage, SiteSetting,
    EmailLog, EmailVerification, PasswordResetToken, RefreshToken (P2)
    ```

  - Constraint di DB: unique email, unique slug, foreign key, enum status, required fields, timestamp, `onDelete` yang sesuai.
  - Business rule tetap divalidasi di application layer; **transaction** (`prisma.$transaction`) untuk operasi atomik (mis. perubahan status + history).
  - Prisma Client di-generate ke `src/generated/prisma`.
- **Consequences:**
  - Migration harus disertakan pada tiap PR yang mengubah schema.
  - `prisma migrate deploy` dijalankan pada startup container production (ADR-010).
  - Perlu test database terisolasi untuk integration test.
