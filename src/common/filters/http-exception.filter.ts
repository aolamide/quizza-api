import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse = {
      status: 'error',
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Handle validation errors specifically
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse['message']
      ) {
        const validationMessages = exceptionResponse['message'] as
          | string[]
          | string;
        errorResponse = {
          ...errorResponse,
          message: Array.isArray(validationMessages)
            ? validationMessages.join(' -- ') // Convert array to string
            : validationMessages, // Use as-is if not an array
        };
      }
    }

    response.status(statusCode).json(errorResponse);
  }
}
