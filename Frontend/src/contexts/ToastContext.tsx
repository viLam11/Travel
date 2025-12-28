import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/useTheme';
import { configureErrorHandler, setToastIntegration } from '@/utils/globalErrorHandler';
import { AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextProps {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string, error?: Error | unknown) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
    promise: <T>(
        promise: Promise<T>,
        options: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }
    ) => Promise<T>;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const { theme, isDark } = useTheme();
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(isDark ? 'dark' : 'light');

    useEffect(() => {
        setResolvedTheme(isDark ? 'dark' : 'light');
    }, [theme, isDark]);

    const getToastIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return CheckCircle;
            case 'error':
                return AlertTriangle;
            case 'warning':
                return AlertCircle;
            case 'info':
            default:
                return Info;
        }
    };

    const getBaseToastOptions = (type: ToastType) => {
        const IconComponent = getToastIcon(type);
        return {
            icon: React.createElement(IconComponent, {
                className: `h-4 w-4 ${type === 'success' ? 'text-green-600' :
                    type === 'error' ? 'text-red-600' :
                        type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                    }`
            }),
            closeButton: true,
            duration: type === 'error' ? 6000 : 4000,
        };
    };

    const toast = (message: string, type: ToastType = 'info') => {
        const options = getBaseToastOptions(type);

        switch (type) {
            case 'success':
                sonnerToast.success(message, options);
                break;
            case 'error':
                sonnerToast.error(message, options);
                break;
            case 'warning':
                sonnerToast.warning(message, options);
                break;
            default:
                sonnerToast.info(message, options);
        }
    };

    const success = (message: string) => toast(message, 'success');

    const error = (message: string, err?: Error | unknown) => {
        let errorMessage = message;

        if (err) {
            if (err instanceof Error) {
                errorMessage += `: ${err.message}`;
            } else if (typeof err === 'string') {
                errorMessage += `: ${err}`;
            }
        }

        toast(errorMessage, 'error');
    };

    const info = (message: string) => toast(message, 'info');
    const warning = (message: string) => toast(message, 'warning');

    const promiseToast = <T,>(
        promise: Promise<T>,
        options: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string)
        }
    ) => {
        const enhancedPromise = promise.catch((error) => {
            throw error;
        });

        sonnerToast.promise(enhancedPromise, {
            loading: options.loading,
            success: options.success,
            error: options.error,
            duration: 4000,
        });

        return enhancedPromise;
    };

    useEffect(() => {
        configureErrorHandler({
            enableToastNotifications: true,
            enableConsoleLogging: false,
        });

        setToastIntegration(
            (message: string) => toast(message, 'error')
        );
    }, [toast]);

    const value: ToastContextProps = {
        toast,
        success,
        error,
        info,
        warning,
        promise: promiseToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <Toaster
                position="top-center"
                expand={false}
                theme={resolvedTheme}
                richColors={false}
                closeButton={false}
                toastOptions={{
                    className: 'border-l-4',
                    classNames: {
                        error: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
                        success: 'border-l-green-500 bg-green-50 dark:bg-green-950/20',
                        warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                        info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
                    }
                }}
            />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextProps {
    const context = useContext(ToastContext);

    if (context === undefined) {
        return {
            toast: (message, type = 'info') => {
                switch (type) {
                    case 'success':
                        sonnerToast.success(message);
                        break;
                    case 'error':
                        sonnerToast.error(message);
                        break;
                    case 'warning':
                        sonnerToast.warning(message);
                        break;
                    default:
                        sonnerToast.info(message);
                }
            },
            success: (message) => sonnerToast.success(message),
            error: (message, err) => {
                let errorMessage = message;
                if (err && err instanceof Error) {
                    errorMessage += `: ${err.message}`;
                }
                sonnerToast.error(errorMessage);
            },
            info: (message) => sonnerToast.info(message),
            warning: (message) => sonnerToast.warning(message),
            promise: <T,>(promise: Promise<T>, options: any) => {
                sonnerToast.promise(promise, options);
                return promise;
            },
        };
    }

    return context;
} 