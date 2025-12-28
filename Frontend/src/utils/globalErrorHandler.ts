import { isAuthenticationError, transformAxiosError } from './errorUtils';
import type { StandardError } from '@/types/error.types';
import { AxiosError } from 'axios';

/**
 * Global error handler configuration
 */
interface ErrorHandlerConfig {
    onAuthenticationError?: (error: StandardError) => void;
    onError?: (error: StandardError, context?: ErrorContext) => void;
    enableConsoleLogging?: boolean;
    enableToastNotifications?: boolean;
    showToast?: (message: string, type: 'error') => void;
    showRetryableError?: (error: StandardError, retryFn?: () => Promise<void>) => void;
}

/**
 * Error context information
 */
interface ErrorContext {
    operation?: string;
    component?: string;
}

/**
 * Default error handler configuration
 */
const defaultConfig: ErrorHandlerConfig = {
    enableConsoleLogging: false,
    enableToastNotifications: true,
};

let globalConfig: ErrorHandlerConfig = defaultConfig;

/**
 * Configure global error handling behavior
 */
export function configureErrorHandler(config: Partial<ErrorHandlerConfig>): void {
    globalConfig = { ...defaultConfig, ...config };
}

/**
 * Set toast integration functions
 */
export function setToastIntegration(
    showToast: (message: string, type: 'error') => void,
): void {
    globalConfig.showToast = showToast;
}

/**
 * Global error handler that processes and handles all application errors
 */
export function handleGlobalError(error: unknown, context?: ErrorContext): StandardError {
    const standardError = transformAxiosError(error as AxiosError);

    if (globalConfig.enableConsoleLogging) {
        console.error('Application Error:', {
            ...standardError,
            context,
        });
        if (error instanceof Error) {
            console.error('Original Error Stack:', error.stack);
        }
    }

    if (isAuthenticationError(standardError) && globalConfig.onAuthenticationError) {
        globalConfig.onAuthenticationError(standardError);
    }

    if (globalConfig.onError) {
        globalConfig.onError(standardError, context);
    }

    return standardError;
}

/**
 * Default authentication error handler after trying to refresh token
 */
export function handleRedirectToLogin(): void {
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
        const redirectUrl = encodeURIComponent(window.location.href);
        window.location.href = `/login?redirect=${redirectUrl}`;
    }
}

/**
 * Error boundary error handler
 */
export function handleErrorBoundaryError(error: Error, errorInfo: React.ErrorInfo): void {
    const standardError = transformAxiosError(error as AxiosError);

    console.error('React Error Boundary:', {
        ...standardError,
        componentStack: errorInfo.componentStack,
        errorBoundary: true
    });

    if (globalConfig.onError) {
        globalConfig.onError(standardError, {
            operation: 'error_boundary',
        });
    }
}