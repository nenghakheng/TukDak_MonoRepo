import {HttpErrors, Request, Response} from '@loopback/rest';
import {ValidationError, NotFoundError, ErrorResponse} from './custom-errors';

export class ErrorHandler {
  static formatError(error: Error, request?: Request): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request?.path;

    // Handle custom validation errors
    if (error instanceof ValidationError) {
      return {
        error: {
          statusCode: error.statusCode,
          name: error.name,
          message: error.message,
          details: error.details,
          timestamp,
          path,
        },
      };
    }

    // Handle custom not found errors
    if (error instanceof NotFoundError) {
      return {
        error: {
          statusCode: error.statusCode,
          name: error.name,
          message: error.message,
          timestamp,
          path,
        },
      };
    }

    // Handle LoopBack HTTP errors
    if (HttpErrors.isHttpError(error)) {
      return {
        error: {
          statusCode: error.statusCode,
          name: error.name || 'HttpError',
          message: error.message,
          timestamp,
          path,
        },
      };
    }

    // Handle generic errors
    return {
      error: {
        statusCode: 500,
        name: 'InternalServerError',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        timestamp,
        path,
      },
    };
  }

  static logError(error: Error, request?: Request): void {
    const logData = {
      error: error.message,
      stack: error.stack,
      path: request?.path,
      method: request?.method,
      timestamp: new Date().toISOString(),
    };

    if (HttpErrors.isHttpError(error) && error.statusCode < 500) {
      console.warn('Client Error:', logData);
    } else {
      console.error('Server Error:', logData);
    }
  }
}