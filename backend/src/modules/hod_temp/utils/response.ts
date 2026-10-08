import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  arg3?: number | string,
  arg4?: string | number
) {
  let statusCode = 200;
  let message: string | undefined;

  if (typeof arg3 === 'number') {
    statusCode = arg3;
    if (typeof arg4 === 'string') message = arg4;
  } else if (typeof arg3 === 'string') {
    message = arg3;
    if (typeof arg4 === 'number') statusCode = arg4;
  }

  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}
