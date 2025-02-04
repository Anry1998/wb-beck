import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
   
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();
  
  constructor(
    private configService: ConfigService, 
    private readonly httpAdapterHost: HttpAdapterHost
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
  
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  
    this.logger.error(`Ошибка: ${exception.message}, статус: ${status}`);

    if (status == 400) {
      response.status(status).json( 
        isProduction
          ? { 
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
              stacktrace: exception.stack, 
            }, 
      );
    }
    else if (status == 401) {
      response.status(status).json( 
        isProduction
          ? { 
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: 'Ошибка авторизации',
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
              stacktrace: exception.stack,
            },
      );
    }
    else if (status == 403) {
      response.status(status).json( 
        isProduction
          ? { 
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: 'Закрытый ресурс',
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
              stacktrace: exception.stack,
            },
      );
    }
    else if (status == 404) {
      response.status(status).json( 
        isProduction
          ? { 
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
              stacktrace: exception.stack,
            },
      );
    }
    else if (status == 403) {
      response.status(status).json( 
        isProduction
          ? { 
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: 'Закрытый ресурс',
            }
          : {
              statusCode: status,
              timestamp: new Date().toISOString(),
              message: exception.message,
              stacktrace: exception.stack,
            },
      );
    }
    else {
      const { httpAdapter } = this.httpAdapterHost;
      const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      this.logger.error(
        `Ошибка: ${exception.message}, стэк: ${exception.stack}, статус: ${status}`,
      );
      const responseBody = {
        status: httpStatus,
        message: 'Внутренняя ошибка сервера 😒',
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}