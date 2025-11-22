import type { StandardError } from '@/types/error.types';
import { AxiosError } from 'axios';

/**
 * Error type constants matching backend implementation
 */
export const ERROR_CODES = {
    // Client errors (4xx)
    VALIDATION_ERROR: 400,
    AUTHENTICATION_FAILED: 401,
    PERMISSION_DENIED: 403,
    RESOURCE_NOT_FOUND: 404,
    RATE_LIMIT_EXCEEDED: 429,

    // Server errors (5xx)
    SERVER_ERROR: 500,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<number, string> = {
    // Client errors
    [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ERROR_CODES.AUTHENTICATION_FAILED]: 'You need to log in to access this resource.',
    [ERROR_CODES.PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',

    // Server errors
    [ERROR_CODES.SERVER_ERROR]: 'An internal server error occurred. Please try again later.',
};

/**
 * Check if error should trigger authentication flow
 */
export function isAuthenticationError(error: StandardError): boolean {
    return error.status_code === ERROR_CODES.AUTHENTICATION_FAILED;
}

export function isAxiosError(error: unknown): error is AxiosError {
    return error instanceof AxiosError;
}

/**
 * Transform AxiosError to StandardError
 */
export function transformAxiosError(error: AxiosError): StandardError {
    const responseData = error.response?.data;

    if (isStandardError(responseData)) {
        return {
            ...responseData,
        };
    }

    return createStandardError(ERROR_CODES.SERVER_ERROR);
}

/**
 * Check if error response has backend error structure
 */
function isStandardError(data: unknown): data is StandardError {
    return (
        typeof data === 'object' &&
        data !== null &&
        'status_code' in data &&
        typeof (data as any).status_code === 'number' &&
        'message' in data &&
        typeof (data as any).message === 'string'
    );
}

/**
 * Create a StandardError with consistent structure
 */
function createStandardError(
    code: number,
): StandardError {
    return {
        status_code: code,
        message: ERROR_MESSAGES[code],
    };
}