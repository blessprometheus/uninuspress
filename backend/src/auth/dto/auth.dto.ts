import {
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  name: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  @Matches(/[a-zA-Z]/, { message: 'Password harus mengandung huruf' })
  @Matches(/[0-9]/, { message: 'Password harus mengandung angka' })
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString({ message: 'Password harus berupa teks' })
  password: string;
}

export class VerifyEmailDto {
  @IsString({ message: 'Token harus berupa teks' })
  token: string;
}

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token harus berupa teks' })
  token: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  @Matches(/[a-zA-Z]/, { message: 'Password harus mengandung huruf' })
  @Matches(/[0-9]/, { message: 'Password harus mengandung angka' })
  newPassword: string;
}

export class UpdateRoleDto {
  @IsIn(['ADMIN', 'EDITOR', 'AUTHOR'], { message: 'Role tidak valid' })
  role: 'ADMIN' | 'EDITOR' | 'AUTHOR';
}
