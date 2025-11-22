/**
 * Model type definitions for the application
 * These types extend the API types and are used across the application
 * Only include types that aren't already defined in the API schema or
 * types that provide additional functionality beyond the API definitions
 */

import type { components } from "./api.types";

export type GenericResponse = components["schemas"]["GenericResponse"];

/**
 * Auth types
 */
export type LoginCredentials = components["schemas"]["LoginRequest"];

/**
 * UserPermissions type based on the API /users/me/permissions response
 */
export interface UserPermissions {
  user_id: number;
  user: User;
  global_role: string;
  global_permissions: string[];
  team_roles: Record<string, string>;
  team_permissions: Record<string, string[]>;
}

/**
 * User types
 */
export type User = components["schemas"]["User"];

/**
 * Auth context types
 */
export interface AuthContextType {
  currentUser: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  error: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
