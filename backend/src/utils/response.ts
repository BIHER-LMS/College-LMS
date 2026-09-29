import { Response } from 'express';

/**
 * Standardized API response helpers.
 *
 * Every endpoint MUST use these helpers so the frontend
 * team gets a consistent JSON shape.
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  } satisfies ApiSuccessResponse<T>);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ApiErrorDetail[],
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {}),
    },
  } satisfies ApiErrorResponse);
}

/**
 * Common error codes used across the application.
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_REJECTED: 'ACCOUNT_REJECTED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TENANT_MISMATCH: 'TENANT_MISMATCH',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
  FIREBASE_ERROR: 'FIREBASE_ERROR',
} as const;
