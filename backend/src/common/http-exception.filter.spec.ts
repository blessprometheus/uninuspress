/* eslint-disable @typescript-eslint/unbound-method */
import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

function mockHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { response, host };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('memformat NotFoundException dengan kode NOT_FOUND', () => {
    const { response, host } = mockHost();
    filter.catch(new NotFoundException('Naskah tidak ditemukan'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Naskah tidak ditemukan',
      code: 'NOT_FOUND',
    });
  });

  it('menggabungkan error validasi array menjadi satu pesan', () => {
    const { response, host } = mockHost();
    const exception = new BadRequestException({
      message: ['nama tidak boleh kosong', 'email harus valid'],
    });
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'nama tidak boleh kosong, email harus valid',
      code: 'BAD_REQUEST',
    });
  });

  it('tidak membocorkan detail internal untuk error tak dikenal', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { response, host } = mockHost();
    filter.catch(new Error('secret db detail'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Terjadi kesalahan pada server',
      code: 'INTERNAL_ERROR',
    });

    process.env.NODE_ENV = previous;
  });

  it('menjaga kode custom untuk HttpException bertipe object', () => {
    const { response, host } = mockHost();
    const exception = new HttpException({ code: 'SUBMISSION_CONFLICT' }, 409);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Terjadi kesalahan pada server',
      code: 'SUBMISSION_CONFLICT',
    });
  });

  it('menerjemahkan pesan default 404 menjadi Bahasa Indonesia', () => {
    const { response, host } = mockHost();
    filter.catch(new HttpException('Not Found', 404), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Halaman tidak ditemukan',
      code: 'NOT_FOUND',
    });
  });

  it('menerjemahkan pesan default 401 menjadi Bahasa Indonesia', () => {
    const { response, host } = mockHost();
    filter.catch(new HttpException('Unauthorized', 401), host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Tidak memiliki akses',
      code: 'UNAUTHORIZED',
    });
  });
});
