/**
 * Model for the Ping API response
 */
export interface PingHeaders {
  'user-agent': string;
  accept: string;
  'cache-control': string;
  'postman-token'?: string;
  host: string;
  'accept-encoding': string;
  connection: string;
  [key: string]: string | undefined;
}

export interface PingData {
  greeting: string;
  date: string;
  url: string;
  headers: PingHeaders;
}

export interface PingResponse {
  success: boolean;
  data: PingData;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
