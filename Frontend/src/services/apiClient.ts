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
      remember_me?: boolean;
    }): ApiResponse<UserPermissions> => {
      return this.post("/auth/login/local", data);
    },

    register: (data: any): ApiResponse<any> => {
      return this.post("/auth/register/local", data);
    },

    verify: (data: { email: string; verificationCode: string }): ApiResponse<any> => {
      return this.post("/auth/verify", data);
    },

    refresh: (): ApiResponse<void> => {
      return this.post("/auth/refresh", {});
    },

    logout: (): ApiResponse<void> => {
      return this.post("/auth/logout", {});
    },

    resendOTP: (data: { email: string }): ApiResponse<any> => {
      return this.post("/auth/resend-otp", data);
    },

    loginGoogle: (): ApiResponse<void> => {
      return this.get("/auth/login/google");
    },

    // Forgot Password methods
    forgotPassword: (data: { email: string }): ApiResponse<any> => {
      return this.post("/auth/forgot-password", data);
    },

    verifyResetOTP: (data: { email: string; otp: string }): ApiResponse<{ statusCode: number; message: string; resetToken: string }> => {
      return this.post("/auth/verify-reset-otp", data);
    },

    resetPassword: (data: { token: string; newPassword: string }): ApiResponse<any> => {
      return this.post("/auth/reset-password", data);
    }
  };

  // Service endpoints
  services = {
    create: (params: {
      serviceName: string;
      description: string;
      provinceCode: string;
      address?: string;
      contactNumber?: string;
      averagePrice?: number;
      tags?: string;
      serviceType: string;
      start_time?: string;
      end_time?: string;
      open_time?: string;
      close_time?: string;
      working_days?: string;
    }, thumbnail: File, photos: File[]): ApiResponse<any> => {
      const formData = new FormData();
      formData.append('thumbnail', thumbnail);
      photos.forEach(photo => formData.append('photo', photo));

      return this.post('/services/newService', formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    getById: (serviceID: number): ApiResponse<any> => {
      return this.get(`/services/${serviceID}`);
    },

    list: (page = 0, size = 10): ApiResponse<any> => {
      return this.get('/services/data', { params: { page, size } });
    },

    getAll: (): ApiResponse<any> => {
      return this.get('/services/all');
    },

    delete: (id: number): ApiResponse<any> => {
      return this.delete(`/services/${id}`);
    },

    uploadImages: (id: number, photos: File[]): ApiResponse<any> => {
      const formData = new FormData();
      photos.forEach(p => formData.append('photos', p));

      return this.patch(`/services/upload/img/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    search: (params: {
      keyword?: string;
      serviceType?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      size?: number;
      sortBy?: string;
      direction?: string;
    }): ApiResponse<any> => {
      return this.get('/services/search', { params });
    }
  };

  // Comment endpoints
  comments = {
    getByServiceId: (serviceID: number, page?: number, size?: number, sortBy?: string, direction?: string): ApiResponse<any> => {
      return this.get(`/comment/${serviceID}`, {
        params: { page, size, sortBy, direction }
      });
    },

    create: (serviceID: number, content: string, rating: number, photos?: File[]): ApiResponse<any> => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('rating', rating.toString());
      formData.append('serviceID', serviceID.toString());
      if (photos && photos.length > 0) {
        photos.forEach(photo => formData.append('photos', photo));
      }

      return this.post(`/comment/${serviceID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },

    getById: (commentID: number): ApiResponse<any> => {
      return this.get(`/comment/${commentID}`);
    },

    delete: (commentID: number): ApiResponse<any> => {
      return this.delete(`/comment/${commentID}`);
    },

    like: (commentID: number): ApiResponse<any> => {
      return this.post(`/comment/like/${commentID}`, {});
    },

    dislike: (commentID: number): ApiResponse<any> => {
      return this.post(`/comment/dislike/${commentID}`, {});
    },

    unlike: (commentID: number): ApiResponse<any> => {
      return this.post(`/comment/unlike/${commentID}`, {});
    },

    undoDislike: (commentID: number): ApiResponse<any> => {
      return this.post(`/comment/undoDislike/${commentID}`, {});
    }
  };

  // Payment endpoints
  payments = {
    zalopay: {
      createOrder: (appuser: string, amount: number, order_id: number): ApiResponse<any> => {
        return this.post('/api/zalopay/create-order', {}, {
          params: { appuser, amount, order_id }
        });
      },
      getStatus: (apptransid: string): ApiResponse<any> => {
        return this.get('/api/zalopay/getstatusbyapptransid', {
          params: { apptransid }
        });
      }
    },
    vnpay: {
      createPayment: (vnp_OrderInfo: string, vnp_OrderType: string, vnp_Amount: number, vnp_Locale: string, vnp_BankCode: string = ""): ApiResponse<any> => {
        return this.post('/api/vnpay/make', {}, {
          params: { vnp_OrderInfo, vnp_OrderType, vnp_Amount, vnp_Locale, vnp_BankCode }
        });
      },
      getResult: (params: any): ApiResponse<any> => {
        return this.get('/api/vnpay/result', { params });
      }
    },
    momo: {
      createOrder: (amount: number, order_id: string): ApiResponse<any> => {
        return this.post('/api/momo/create-order', {}, {
          params: { amount, order_id }
        });
      },
      transactionStatus: (requestId: string, orderId: string): ApiResponse<any> => {
        return this.post('/api/momo/transactionStatus', {}, {
          params: { requestId, orderId }
        });
      }
    }
  };

  // User endpoints
  users = {
    getAll: (): ApiResponse<any> => {
      return this.get('/users/all');
    },

    getProfile: (): ApiResponse<any> => {
      return this.get('/users/me');
    },

    getById: (userID: number): ApiResponse<any> => {
      return this.get(`/users/${userID}`);
    },

    update: (userID: number, data: { fullname?: string; phone?: string; address?: string }): ApiResponse<any> => {
      return this.put(`/users/${userID}`, data);
    }
  };

  // Order endpoints
  orders = {
    getById: (id: string | number): ApiResponse<any> => {
      return this.get(`/orders/${id}`);
    },
    test: (): ApiResponse<string> => {
      return this.get('/orders/test');
    }
  };

  // Province endpoints
  provinces = {
    search: (query: string): ApiResponse<any[]> => {
      return this.get('/provinces/search', { params: { query } });
    },

    getByRegion: (region: 'north' | 'central' | 'south'): ApiResponse<any[]> => {
      return this.get(`/provinces/region/${region}`);
    },

    getAll: (): ApiResponse<any[]> => {
      return this.get('/provinces/all');
    }
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

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    this.handleRateLimit(response);
    return response.data;
  }

  public async post<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post<T>(url, data, config);
    this.handleRateLimit(response);
    return response.data;
  }

  public async put<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.put<T>(url, data, config);
    this.handleRateLimit(response);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    this.handleRateLimit(response);
    return response.data;
  }

  public async delete<T>(
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
