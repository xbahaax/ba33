import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const url: string = request.url;
    const userId: string | undefined = request.user?.id;
    const body = request.body;
    const now = Date.now();

    // Extract resource info from URL pattern: /resource/:id
    const urlParts = url.split('/').filter(Boolean);
    const resource = urlParts[0] ?? 'unknown';
    const resourceId = urlParts[1] ?? undefined;

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          this.logger.log(
            JSON.stringify({
              audit: true,
              method,
              url,
              resource,
              resourceId,
              actorId: userId ?? 'anonymous',
              durationMs: Date.now() - now,
              requestBody: this.sanitize(body),
              responseId:
                responseBody?.id ?? responseBody?.data?.id ?? undefined,
            }),
          );
        },
        error: (err) => {
          this.logger.warn(
            JSON.stringify({
              audit: true,
              method,
              url,
              resource,
              resourceId,
              actorId: userId ?? 'anonymous',
              durationMs: Date.now() - now,
              error: err.message,
              status: err.status ?? 500,
            }),
          );
        },
      }),
    );
  }

  private sanitize(body: Record<string, unknown> | undefined) {
    if (!body) return undefined;
    const sanitized = { ...body };
    // Strip sensitive fields from audit logs
    for (const key of ['password', 'token', 'refreshToken', 'secret']) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
