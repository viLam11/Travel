import api from "./api";
import type {
  UserPermissions,
} from "@/types/models.types";

import type { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Generic types for API responses
 */
type ApiResponse<T> = Promise<T>;

/**
 * Standard pagination metadata structure
 */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/**
 * Standard paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Backend pagination response structure
 */
export interface BackendPaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Generic resource adapter for standard CRUD operations
 */
export interface ResourceAdapter<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>
> {
  list: (params?: Record<string, any>) => Promise<PaginatedResponse<T>>;
  getById: (id: string | number) => Promise<T>;
  create: (data: TCreate) => Promise<T>;
  update: (id: string | number, data: TUpdate) => Promise<T>;
  delete: (id: string | number) => Promise<T>;
  baseUrl: string;
}

/** 
  * ApiClient class for type-safe API calls
 */
export class ApiClient {
  private rateLimitInfo: RateLimitInfo | null = null;

  // Auth endpoints
  auth = {
    login: (data: {
      email: string;
      password: string;
      remember_me: boolean;
    }): ApiResponse<UserPermissions> => {
      return this.post("/auth/login", data);
    },

    refresh: (): ApiResponse<void> => {
      return this.post("/auth/refresh", {});
    },

    logout: (): ApiResponse<void> => {
      return this.post("/auth/logout", {});
    },
  };


  /**
   * Create a generic resource adapter for standard CRUD operations
   * This is useful for connecting resources to the DataTable component
   */
  createResourceAdapter<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
    baseUrl: string,
    options?: {
      transformResponse?: (data: any) => PaginatedResponse<T>;
      transformParams?: (params: Record<string, any>) => Record<string, any>;
    }
  ): ResourceAdapter<T, TCreate, TUpdate> {
    return {
      baseUrl,

      list: async (
        params?: Record<string, any>
      ): Promise<PaginatedResponse<T>> => {
        const apiParams = {
          page: params?.page || 1,
          per_page: params?.pageSize || params?.per_page || 10,
          sort_by:
            params?.sort_by || (params?.sorting && params?.sorting[0]?.id),
          sort_order:
            params?.sort_order ||
            (params?.sorting && params?.sorting[0]?.desc ? "desc" : "asc"),
          q: params?.q || params?.searchTerm,
          ...params,
        };

        const transformedParams = options?.transformParams
          ? options.transformParams(apiParams)
          : apiParams;

        const response = await this.get<any>(baseUrl, {
          params: transformedParams,
        });

        if (options?.transformResponse) {
          return options.transformResponse(response);
        }

        if (
          response &&
          "items" in response &&
          "total" in response &&
          "page" in response
        ) {
          return {
            items: response.items || [],
            meta: {
              page: response.page || 1,
              per_page: response.per_page || 10,
              total: response.total || 0,
              total_pages: response.pages || 1,
            },
          };
        }

        if (Array.isArray(response)) {
          return {
            items: response,
            meta: {
              page: 1,
              per_page: response.length,
              total: response.length,
              total_pages: 1,
            },
          };
        }

        return {
          items: response.data || response.results || response,
          meta: response.meta ||
            response.pagination || {
              page: params?.page || 1,
              per_page: params?.per_page || 10,
              total:
                response.total ||
                response.count ||
                (response.data || response.results || response).length ||
                0,
              total_pages:
                response.total_pages ||
                response.pages ||
                Math.ceil(
                  (response.total || response.count || 0) /
                    (params?.per_page || 10)
                ),
            },
        };
      },

      getById: (id: string | number): Promise<T> => {
        return this.get<T>(`${baseUrl}/${id}`);
      },

      create: (data: TCreate): Promise<T> => {
        return this.post<T>(baseUrl, data);
      },

      update: (id: string | number, data: TUpdate): Promise<T> => {
        return this.put<T>(`${baseUrl}/${id}`, data);
      },

      delete: (id: string | number): Promise<T> => {
        return this.delete<T>(`${baseUrl}/${id}`);
      },
    };
  }

  /**
   * Get current rate limit information
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Handle rate limit headers from response
   */
  private handleRateLimit(response: AxiosResponse): void {
    const limit = response.headers["x-ratelimit-limit"];
    const remaining = response.headers["x-ratelimit-remaining"];
    const reset = response.headers["x-ratelimit-reset"];

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };

      if (this.rateLimitInfo.remaining / this.rateLimitInfo.limit < 0.1) {
        console.warn(
          `API Rate limit warning: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit} requests remaining. Resets in ${this.rateLimitInfo.reset} seconds.`
        );
      }
    }
  }

  private async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    this.handleRateLimit(response);
    return response.data;
  }

  private async post<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post<T>(url, data, config);
    this.handleRateLimit(response);
    return response.data;
  }

  private async put<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.put<T>(url, data, config);
    this.handleRateLimit(response);
    return response.data;
  }

  private async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.delete<T>(url, config);
    this.handleRateLimit(response);
    return response.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
