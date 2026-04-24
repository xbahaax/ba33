import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface HttpRequestLike {
  url: string;
}

interface HttpResponseLike {
  status(statusCode: number): {
    json(body: Record<string, unknown>): void;
  };
}

function getExceptionMessage(response: unknown, fallback: string): unknown {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object' && 'message' in response) {
    return response.message;
  }

  return fallback;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();
    const request = ctx.getRequest<HttpRequestLike>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    const message = getExceptionMessage(exceptionResponse, exception.message);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
