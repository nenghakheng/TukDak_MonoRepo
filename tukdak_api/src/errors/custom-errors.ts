import {HttpErrors} from '@loopback/rest';

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

export interface ErrorResponse {
  error: {
    statusCode: number;
    name: string;
    message: string;
    details?: ValidationErrorDetail[];
    timestamp: string;
    path?: string;
  };
}

export class ValidationError extends HttpErrors.BadRequest {
  details: ValidationErrorDetail[];
  
  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends HttpErrors.NotFound {
  resource: string;
  resourceId: any;
  
  constructor(resource: string, id: any) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

export class ConflictError extends HttpErrors.Conflict {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends HttpErrors.Unauthorized {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpErrors.Forbidden {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends HttpErrors.InternalServerError {
  constructor(message: string, public originalError?: Error) {
    super(`Database error: ${message}`);
    this.name = 'DatabaseError';
  }
}