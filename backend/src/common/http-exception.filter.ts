import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

const STATUS_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
};

const DEFAULT_STATUS_MESSAGE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Permintaan tidak valid',
  [HttpStatus.UNAUTHORIZED]: 'Tidak memiliki akses',
  [HttpStatus.FORBIDDEN]: 'Akses ditolak',
  [HttpStatus.NOT_FOUND]: 'Halaman tidak ditemukan',
  [HttpStatus.CONFLICT]: 'Terjadi konflik data',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Layanan tidak tersedia',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Terlalu banyak permintaan. Coba lagi nanti.',
};

const DEFAULT_ENGLISH_MESSAGES = new Set([
  'Bad Request',
  'Unauthorized',
  'Forbidden',
  'Not Found',
  'Conflict',
  'Service Unavailable',
]);

function isDefaultEnglishMessage(message: string, status: HttpStatus): boolean {
  if (status === HttpStatus.NOT_FOUND) {
    return message === 'Not Found' || message.startsWith('Cannot ');
  }
  return DEFAULT_ENGLISH_MESSAGES.has(message);
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Terjadi kesalahan pada server';
    let code = STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = STATUS_CODES[status] ?? 'ERROR';
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body !== null && typeof body === 'object') {
        const data = body as Record<string, unknown>;
        if (typeof data.code === 'string') code = data.code;
        const msg = data.message;
        if (Array.isArray(msg)) message = msg.join(', ');
        else if (typeof msg === 'string') message = msg;
      }
      if (isDefaultEnglishMessage(message, status)) {
        message = DEFAULT_STATUS_MESSAGE[status] ?? message;
      }
    } else {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
      if (process.env.NODE_ENV === 'development') {
        message = exception instanceof Error ? exception.message : message;
      }
    }

    response.status(status).json({ success: false, message, code });
  }
}
