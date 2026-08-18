-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "status" "BookStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ManuscriptFile" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- CreateIndex
CREATE INDEX "Book_status_idx" ON "Book"("status");
