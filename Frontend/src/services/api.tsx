import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { authService } from "./authService";
import { handleGlobalError, handleRedirectToLogin } from "@/utils/globalErrorHandler";
import { isAuthenticationError } from "@/utils/errorUtils";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: Error | null): void => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response, // Return full response for headers access
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        const standardError = handleGlobalError(error);

        if (!error.response) {
            return Promise.reject(standardError);
        }

        const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        if (isAuthEndpoint || originalRequest._retry) {
            return Promise.reject(standardError);
        }

        if (isAuthenticationError(standardError)) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: () => resolve(api(originalRequest)),
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await authService.refreshToken();
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                const refreshStandardError = handleGlobalError(refreshError);
                processQueue(refreshStandardError as unknown as Error);
                handleRedirectToLogin();
                return Promise.reject(refreshStandardError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(standardError);
    }
);

export default api;