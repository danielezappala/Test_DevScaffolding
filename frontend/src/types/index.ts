/**
 * Common type definitions for the frontend application
 */

export interface VersionInfo {
  version: string;
  commit: string;
  build_date: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  details?: unknown;
}
