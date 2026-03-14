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
    [ERROR_CODES.VALIDATION_ERROR]: 'Vui lòng kiểm tra thông tin và thử lại.',
    [ERROR_CODES.AUTHENTICATION_FAILED]: 'Bạn cần đăng nhập để truy cập tài nguyên này.',
    [ERROR_CODES.PERMISSION_DENIED]: 'Bạn không có quyền thực hiện hành động này.',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',

    // Server errors
    [ERROR_CODES.SERVER_ERROR]: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
};

/**
 * Translation dictionary for common backend error messages
 */
const ERROR_TRANSLATIONS: Record<string, string> = {
    // Authentication & Verification
    'Account not verified': 'Tài khoản chưa được xác thực',
    'Please verify your account': 'Vui lòng xác thực tài khoản của bạn',
    'Unexpected error: Account not verified. Please verify your account.': 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.',
    'Invalid verification code': 'Mã xác thực không đúng',
    'Verification code has expired': 'Mã xác thực đã hết hạn',
    'Account verified successfully': 'Xác thực tài khoản thành công',
    'Account is already verified': 'Tài khoản đã được xác thực',
    'OTP has been resent successfully': 'Đã gửi lại mã OTP thành công',

    // User errors - Use generic message for security (prevent user enumeration)
    'User not found': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
    'Username not found': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
    'Email not found': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
    'Username is already in use': 'Tên đăng nhập đã tồn tại',
    'Email is already in use': 'Email đã tồn tại',

    // Validation errors - Use generic message for security
    'Bad credentials': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
    'Invalid credentials': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
    'Invalid email or password': 'Thông tin đăng nhập không đúng. Vui lòng thử lại.',
};

/**
 * Translate error message from English to Vietnamese
 */
export function translateErrorMessage(message: string): string {
    // Direct match
    if (ERROR_TRANSLATIONS[message]) {
        return ERROR_TRANSLATIONS[message];
    }

    // Partial match - check if message contains any known phrases
    for (const [englishPhrase, vietnamesePhrase] of Object.entries(ERROR_TRANSLATIONS)) {
        if (message.includes(englishPhrase)) {
            return message.replace(englishPhrase, vietnamesePhrase);
        }
    }

    // Return original if no translation found
    // Feature: Specific backend data inconsistency handling
    if (message.includes('No enum constant') || message.includes('PROVIDER_HOTEL')) {
      return 'Dịch vụ này tạm thời không thể đặt do lỗi dữ liệu từ Nhà cung cấp. Vui lòng thử lại sau hoặc chọn dịch vụ khác.';
    }

    if (message.includes('Unable to find') && message.includes('User')) {
      return 'Không tìm thấy thông tin tài khoản Nhà cung cấp. Vui lòng liên hệ hỗ trợ.';
    }

    return message;
}

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
    const status = error.response?.status || ERROR_CODES.SERVER_ERROR;

    if (responseData && typeof responseData === 'string') {
        return {
            status_code: status,
            message: translateErrorMessage(responseData),
        };
    }

    if (isStandardError(responseData)) {
        const originalMessage = responseData.message;
        return {
            status_code: (responseData as any).status_code || (responseData as any).status || status,
            message: translateErrorMessage(originalMessage),
        };
    }

    // If it's an object but doesn't match standard structure, try to extract message
    if (responseData && typeof responseData === 'object') {
        const msg = (responseData as any).message || (responseData as any).error || (responseData as any).msg;
        if (msg) {
            return {
                status_code: (responseData as any).status_code || (responseData as any).status || status,
                message: translateErrorMessage(msg),
            };
        }
    }

    return createStandardError(status);
}

/**
 * Check if error response has backend error structure
 */
function isStandardError(data: unknown): data is StandardError {
    return (
        typeof data === 'object' &&
        data !== null &&
        ('status_code' in data || 'status' in data) &&
        (typeof (data as any).status_code === 'number' || typeof (data as any).status === 'number') &&
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