import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 处理异常响应消息
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }

      // 使用HTTP状态码作为错误码
      code = status;
    } else {
      // 处理非HTTP异常
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    // 统一的错误响应格式
    const errorResponse: ApiResponse<null> = {
      code,
      message,
      data: null,
      timestamp: Date.now(),
    };

    response.status(status).json(errorResponse);
  }
}
