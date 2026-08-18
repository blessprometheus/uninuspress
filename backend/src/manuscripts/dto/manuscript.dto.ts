import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ManuscriptStatus } from '../../generated/prisma/client';

export class CreateManuscriptDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;
}

export class UpdateStatusDto {
  @IsEnum(ManuscriptStatus)
  status: ManuscriptStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ListManuscriptsQueryDto {
  @IsOptional()
  @IsEnum(ManuscriptStatus)
  status?: ManuscriptStatus;
}

export class VerifyFileDto {
  @IsBoolean()
  verified: boolean;
}
