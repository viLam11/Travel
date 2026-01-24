import type { components } from './api.types';

export type ErrorDetail = components['schemas']['ErrorDetail'];
export type AuthError = components['schemas']['AuthErrorResponse'];
export type ValidationError = components['schemas']['ValidationErrorResponse'];
export type ForbiddenError = components['schemas']['ForbiddenErrorResponse'];
export type NotFoundError = components['schemas']['NotFoundErrorResponse'];

export interface StandardError {
    status_code: number;
    message: string;
    details?: Record<string, unknown>;
    request_id?: string;
}