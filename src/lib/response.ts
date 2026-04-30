import type { Context } from "hono";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SuccessEnvelope<T> {
  data: T;
  error?: never;
  meta?: PaginationMeta;
}

interface ErrorEnvelope {
  data?: never;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: never;
}

export function success<T>(c: Context, data: T, meta?: PaginationMeta) {
  return c.json({ data, meta } as SuccessEnvelope<T>);
}

export function created<T>(c: Context, data: T) {
  return c.json({ data } as SuccessEnvelope<T>, 201);
}

export function error(c: Context, code: string, message: string, status = 400, details?: unknown) {
  return c.json({ error: { code, message, details } } as ErrorEnvelope, status as any);
}

export function paginated<T>(c: Context, items: T[], total: number, page: number, limit: number) {
  return c.json({
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  } as SuccessEnvelope<T>);
}
