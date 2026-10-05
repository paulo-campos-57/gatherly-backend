import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ValidationErrorResponse = {
  message?: string | string[];
  error?: string;
};

type MongoDuplicateKeyError = {
  code: number;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const isDuplicateKeyError =
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as MongoDuplicateKeyError).code === 11000;

    if (isDuplicateKeyError) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Já existe um registro com um valor único informado',
        error: 'Conflict',
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });

      return;
    }

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const details = this.getDetails(exceptionResponse);

    response.status(status).json({
      statusCode: status,
      message: details.message,
      error: details.error,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  private getDetails(response: string | object | null): {
    message: string | string[];
    error: string;
  } {
    if (typeof response === 'string') {
      return {
        message: response,
        error: 'Error',
      };
    }

    if (response && typeof response === 'object') {
      const typedResponse = response as ValidationErrorResponse;

      return {
        message: typedResponse.message ?? 'Ocorreu um erro na requisição',
        error: typedResponse.error ?? 'Error',
      };
    }

    return {
      message: 'Erro interno do servidor',
      error: 'Internal Server Error',
    };
  }
}
