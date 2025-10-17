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

export class ValidationError extends Error {
  public details: ValidationErrorDetail[];
  public statusCode: number = 400;

  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    
    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends Error {
  public resource: string;
  public resourceId: any;
  public statusCode: number = 404;

  constructor(resource: string, id: any) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
    
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends Error {
  public statusCode: number = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }
    
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class DatabaseError extends Error {
  public statusCode: number = 500;
  public originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}