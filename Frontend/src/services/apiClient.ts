import api from "./api";
import type { UserPermissions } from "@/types/models.types";
import type { CreateOrderRequest } from "@/types/order.types";

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
  public static readonly USE_MOCK = true; // Bật fallback sang mock khi API lỗi

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

    verify: (data: {
      email: string;
      verificationCode: string;
    }): ApiResponse<any> => {
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

    verifyResetOTP: (data: {
      email: string;
      otp: string;
    }): ApiResponse<{
      statusCode: number;
      message: string;
      resetToken: string;
    }> => {
      return this.post("/auth/verify-reset-otp", data);
    },

    resetPassword: (data: {
      token: string;
      newPassword: string;
    }): ApiResponse<any> => {
      return this.post("/auth/reset-password", data);
    },
  };

  // Service endpoints
  services = {
    create: (
      params: {
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
      },
      thumbnail: File,
      photos: File[]
    ): ApiResponse<any> => {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      photos.forEach((photo) => formData.append("photo", photo));

      return this.post("/services/newService", formData, {
        params,
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    getById: (serviceID: number): ApiResponse<any> => {
      return this.get(`/services/${serviceID}`);
    },

    list: (page = 0, size = 10): ApiResponse<any> => {
      return this.get("/services/data", { params: { page, size } });
    },

    getAll: (): ApiResponse<any> => {
      return this.get("/services/all");
    },

    delete: (id: number): ApiResponse<any> => {
      return this.delete(`/services/${id}`);
    },

    uploadImages: (id: number, photos: File[]): ApiResponse<any> => {
      const formData = new FormData();
      photos.forEach((p) => formData.append("photos", p));

      return this.patch(`/services/upload/img/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    // search: (params: {
    //   keyword?: string;
    //   serviceType?: string;
    //   minPrice?: number;
    //   maxPrice?: number;
    //   minRating?: number;
    //   page?: number;
    //   size?: number;
    //   sortBy?: string;
    //   direction?: string;
    // }): ApiResponse<any> => {
    //   // Create query params
    //   const queryParams = new URLSearchParams();
    //   if (params.keyword) queryParams.append('keyword', params.keyword);
    //   if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    //   if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    //   if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    //   if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    //   queryParams.append('page', (params.page || 0).toString());
    search: async (params: {
      provinceCode?: string;
      keyword?: string;
      serviceType?: string;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      page?: number;
      size?: number;
      sortBy?: string;
      direction?: string;
      signal?: AbortSignal;
    }): ApiResponse<any> => {
      try {
        const self = (this as any);
        console.log("Fetching real API services/search", params);
        const response: any = await self.get("/services/search", { params });
        
        if (ApiClient.USE_MOCK && (!response || !response.services || response.services.length === 0)) {
           console.warn("Real API returned no data, falling back to Mock...");
           return self.services.getMockSearch(params);
        }
        
        return response;
      } catch (error) {
        const self = (this as any);
        console.error("API Search failed, using Fallback Mock:", error);
        if (ApiClient.USE_MOCK) {
          return self.services.getMockSearch(params);
        }
        throw error;
      }
    },

    getMockSearch: async (params: any): Promise<any> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const MOCK_DATA = [
          {
            id: 101, serviceName: "Vinpearl Land Nha Trang", description: "Thiên đường vui chơi giải trí.", serviceType: "DESTINATION",
            province: { code: "56", name: "Nha Trang", fullName: "Khánh Hòa" },
            address: "Nha Trang, Khánh Hòa", averagePrice: 880000, thumbnailUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800", rating: 4.8, reviewCount: 240, bookingCount: 1500
          },
          {
            id: 102, serviceName: "Sun World Ba Na Hills", description: "Quần thể du lịch nghỉ dưỡng.", serviceType: "DESTINATION",
            province: { code: "48", name: "Đà Nẵng", fullName: "Đà Nẵng" },
            address: "Đà Nẵng", averagePrice: 850000, thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", rating: 4.9, reviewCount: 1200, bookingCount: 5000
          },
          {
            id: 103, serviceName: "Phố cổ Hội An", description: "Di sản văn hóa thế giới.", serviceType: "DESTINATION",
            province: { code: "quang-nam", name: "Hội An", fullName: "Quảng Nam" },
            address: "Hội An, Quảng Nam", averagePrice: 0, thumbnailUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", rating: 4.9, reviewCount: 680, bookingCount: 3000
          },
          {
            id: 104, serviceName: "Vịnh Hạ Long", description: "Kỳ quan thiên nhiên thế giới.", serviceType: "DESTINATION",
            province: { code: "22", name: "Hạ Long", fullName: "Quảng Ninh" },
            address: "Hạ Long, Quảng Ninh", averagePrice: 290000, thumbnailUrl: "https://images.unsplash.com/photo-1506606401543-2e73709cebb4?w=800", rating: 4.7, reviewCount: 450, bookingCount: 2000
          },
          {
            id: 106, serviceName: "Landmark 81 SkyView", description: "Đài quan sát cao nhất VN.", serviceType: "DESTINATION",
            province: { code: "79", name: "Hồ Chí Minh", fullName: "Hồ Chí Minh" },
            address: "Hồ Chí Minh", averagePrice: 810000, thumbnailUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", rating: 4.8, reviewCount: 560, bookingCount: 2500
          },
          {
            id: 201, serviceName: "Khách sạn Majestic Saigon", description: "Khách sạn di sản 5 sao.", serviceType: "HOTEL",
            province: { code: "79", name: "Hồ Chí Minh", fullName: "Hồ Chí Minh" },
            address: "Quận 1, Hồ Chí Minh", averagePrice: 2500000, thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", rating: 4.7, reviewCount: 180, bookingCount: 850
          },
          {
            id: 202, serviceName: "InterContinental Hanoi Westlake", description: "Khách sạn sang trọng Hồ Tây.", serviceType: "HOTEL",
            province: { code: "01", name: "Hà Nội", fullName: "Hà Nội" },
            address: "Tây Hồ, Hà Nội", averagePrice: 3200000, thumbnailUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", rating: 4.9, reviewCount: 210, bookingCount: 920
          },
          {
            id: 203, serviceName: "Vinpearl Resort Nha Trang", description: "Khu nghỉ dưỡng biển.", serviceType: "HOTEL",
            province: { code: "56", name: "Nha Trang", fullName: "Khánh Hòa" },
            address: "Nha Trang, Khánh Hòa", averagePrice: 2800000, thumbnailUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", rating: 4.8, reviewCount: 350, bookingCount: 1400
          },
          {
            id: 205, serviceName: "Pullman Danang Beach Resort", description: "Khu nghỉ dưỡng 5 sao.", serviceType: "HOTEL",
            province: { code: "48", name: "Đà Nẵng", fullName: "Đà Nẵng" },
            address: "Đà Nẵng", averagePrice: 3500000, thumbnailUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", rating: 4.8, reviewCount: 280, bookingCount: 1100
          },
          {
            id: 301, serviceName: "Tour 4 đảo Phú Quốc", description: "Khám phá 4 hòn đảo.", serviceType: "TOUR",
            province: { code: "91", name: "Phú Quốc", fullName: "Kiên Giang" },
            address: "Phú Quốc", averagePrice: 950000, thumbnailUrl: "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800", rating: 4.7, reviewCount: 150, bookingCount: 800
          }
        ];

        let results = [...MOCK_DATA];

        if (params.serviceType) {
          const type = params.serviceType.toUpperCase();
          results = results.filter(item => item.serviceType === type);
        }

        if (params.provinceCode) {
          const pCode = params.provinceCode.toLowerCase();
          results = results.filter(item =>
            item.province.code.includes(pCode) ||
            item.province.name.toLowerCase().includes(pCode)
          );
        }

        if (params.keyword) {
          const lowerKeyword = params.keyword.toLowerCase();
          results = results.filter(item =>
            item.serviceName.toLowerCase().includes(lowerKeyword) ||
            item.province.name.toLowerCase().includes(lowerKeyword)
          );
        }

        const page = params.page || 0;
        const size = params.size || 10;
        const totalItems = results.length;
        const totalPages = Math.ceil(totalItems / size);
        const paginatedItems = results.slice(page * size, (page + 1) * size);

        return {
          services: paginatedItems,
          totalItems,
          totalPages,
          currentPage: page
        };
    },
  };

  // Comment endpoints
  comments = {
    getByServiceId: (
      serviceID: string | number,
      page?: number,
      size?: number,
      sortBy?: string,
      direction?: string
    ): ApiResponse<any> => {
      return this.get(`/comment/${serviceID}`, {
        params: { page, size, sortBy, direction },
      });
    },

    create: (
      serviceID: string | number,
      content: string,
      rating: number,
      photos?: File[]
    ): ApiResponse<any> => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("rating", rating.toString());
      formData.append("serviceID", serviceID.toString());
      if (photos && photos.length > 0) {
        photos.forEach((photo) => formData.append("photos", photo));
      }

      return this.post(`/comment/${serviceID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },

    getById: (commentID: string | number): ApiResponse<any> => {
      return this.get(`/comment/${commentID}`);
    },

    delete: (commentID: string | number): ApiResponse<any> => {
      return this.delete(`/comment/${commentID}`);
    },

    like: (commentID: string | number): ApiResponse<any> => {
      return this.post(`/comment/like/${commentID}`, {});
    },

    dislike: (commentID: string | number): ApiResponse<any> => {
      return this.post(`/comment/dislike/${commentID}`, {});
    },

    unlike: (commentID: string | number): ApiResponse<any> => {
      return this.post(`/comment/unlike/${commentID}`, {});
    },

    undoDislike: (commentID: string | number): ApiResponse<any> => {
      return this.post(`/comment/undoDislike/${commentID}`, {});
    },
  };

  // Payment endpoints
  payments = {
    zalopay: {
      createOrder: (
        appuser: string,
        amount: number,
        order_id: string | number
      ): ApiResponse<any> => {
        return this.post(
          "/api/zalopay/create-order",
          {},
          {
            params: { appuser, amount, order_id },
          }
        );
      },
      getStatus: (apptransid: string): ApiResponse<any> => {
        return this.get("/api/zalopay/getstatusbyapptransid", {
          params: { apptransid },
        });
      },
    },
    vnpay: {
      createPayment: (
        vnp_OrderInfo: string,
        vnp_OrderType: string,
        vnp_Amount: number,
        vnp_Locale: string,
        vnp_BankCode: string = ""
      ): ApiResponse<any> => {
        return this.post(
          "/api/vnpay/make",
          {},
          {
            params: {
              vnp_OrderInfo,
              vnp_OrderType,
              vnp_Amount,
              vnp_Locale,
              vnp_BankCode,
            },
          }
        );
      },
      getResult: (params: any): ApiResponse<any> => {
        return this.get("/api/vnpay/result", { params });
      },
    },
    momo: {
      createOrder: (amount: number, order_id: string): ApiResponse<any> => {
        return this.post(
          "/api/momo/create-order",
          {},
          {
            params: { amount, order_id },
          }
        );
      },
      transactionStatus: (
        requestId: string,
        orderId: string
      ): ApiResponse<any> => {
        return this.post(
          "/api/momo/transactionStatus",
          {},
          {
            params: { requestId, orderId },
          }
        );
      },
    },
  };

  // User endpoints
  users = {
    getAll: (): ApiResponse<any> => {
      return this.get("/users/all");
    },

    getProfile: (): ApiResponse<any> => {
      return this.get("/users/me");
    },

    getById: (userID: number): ApiResponse<any> => {
      return this.get(`/users/${userID}`);
    },

    update: (
      userID: number,
      data: {
        fullname?: string;
        phone?: string;
        address?: string;
        dateOfBirth?: string;
        gender?: string;
        city?: string;
        country?: string;
      }
    ): ApiResponse<any> => {
      return this.put(`/users/${userID}`, data);
    },
  };

  // Order endpoints
  orders = {
    getById: (id: string | number): ApiResponse<any> => {
      return this.get(`/orders/${id}`);
    },
    test: (): ApiResponse<string> => {
      return this.get("/orders/test");
    },
    create: (data: CreateOrderRequest): ApiResponse<any> => {
      return this.post("/orders/create", data);
    },
    getAll: (): ApiResponse<any> => {
      return this.get("/orders/all");
    },
  };

  tickets = {
    getByServiceId: (serviceId: string | number): ApiResponse<any[]> => {
      return this.get(`/services/${serviceId}/tickets`);
    },
  };

  // Province endpoints
  provinces = {
    search: (query: string): ApiResponse<any[]> => {
      return this.get("/provinces/search", { params: { query } });
    },

    getByRegion: (
      region: "north" | "central" | "south"
    ): ApiResponse<any[]> => {
      return this.get(`/provinces/region/${region}`);
    },

    getMockProvinces: async (): Promise<any[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { code: "01", name: "Hà Nội", fullName: "Thành phố Hà Nội" },
        { code: "79", name: "Hồ Chí Minh", fullName: "Thành phố Hồ Chí Minh" },
        { code: "48", name: "Đà Nẵng", fullName: "Thành phố Đà Nẵng" },
        { code: "56", name: "Khánh Hòa", fullName: "Tỉnh Khánh Hòa" },
        { code: "68", name: "Lâm Đồng", fullName: "Tỉnh Lâm Đồng" },
        { code: "22", name: "Quảng Ninh", fullName: "Tỉnh Quảng Ninh" },
        { code: "51", name: "Quảng Nam", fullName: "Tỉnh Quảng Nam" },
        { code: "91", name: "Kiên Giang", fullName: "Tỉnh Kiên Giang" },
        { code: "92", name: "Cần Thơ", fullName: "Thành phố Cần Thơ" }
      ];
    },

    getAll: async (): Promise<any[]> => {
      try {
        const response = await this.get<any[]>("/provinces/all");
        return response;
      } catch (error) {
        if (ApiClient.USE_MOCK) {
          return this.provinces.getMockProvinces();
        }
        throw error;
      }
    },
  };

  transactions = {
    getAll: (): ApiResponse<any> => {
      return this.get("/orders/all");
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
    // Safety check: response might be undefined if API call failed
    if (!response || !response.headers) {
      return;
    }

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
    try {
      const response = await api.get<T>(url, config);
      this.handleRateLimit(response);
      return response.data;
    } catch (error) {
      throw error;
    }
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

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    this.handleRateLimit(response);
    return response.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
