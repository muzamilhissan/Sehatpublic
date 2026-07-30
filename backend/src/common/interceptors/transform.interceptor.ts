import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TransformedResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface DataWithMeta<T> {
  data: T;
  meta: Record<string, unknown>;
}

function hasDataAndMeta<T>(value: unknown): value is DataWithMeta<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value
  );
}

/**
 * Wraps every successful response as `{ success, data, meta? }`.
 * Services/controllers may return `{ data, meta }` explicitly (e.g. paginated
 * lists) and the `meta` will be surfaced at the top level.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, TransformedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<TransformedResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (hasDataAndMeta<T>(result)) {
          return { success: true, data: result.data, meta: result.meta };
        }
        return { success: true, data: result };
      }),
    );
  }
}
