import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  slug: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  content: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePackageDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
