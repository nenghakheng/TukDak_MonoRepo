export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    name: string;
    message: string;
    details?: ValidationErrorDetail[];
    timestamp: string;
    path?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: {
    statusCode: number;
    name: string;
    message: string;
    details?: ValidationErrorDetail[];
    timestamp: string;
    path?: string;
  };
}