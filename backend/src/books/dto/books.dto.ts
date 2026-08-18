import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { BookStatus } from '../../generated/prisma/client';

export class CreateBookDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  author: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  coverKey?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  externalUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverKey?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  externalUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateBookStatusDto {
  @IsEnum(BookStatus)
  status: BookStatus;
}
