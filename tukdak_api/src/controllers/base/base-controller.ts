import {ValidationError, NotFoundError, ConflictError} from '../../errors/custom-errors';
import {ApiResponse, SuccessResponse} from '../../types/error-response';

export class BaseController {
  protected success<T>(data: T, meta?: any): SuccessResponse<T> {
    return {
      success: true,
      data,
      meta,
    };
  }

  protected validateRequired(fields: Record<string, any>): void {
    const errors: any[] = [];
    
    Object.entries(fields).forEach(([field, value]) => {
      if (value === undefined || value === null || value === '') {
        errors.push({
          field,
          message: `${field} is required`,
          value,
          code: 'REQUIRED',
        });
      }
    });

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  protected validateEmail(email: string, fieldName: string = 'email'): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', [{
        field: fieldName,
        message: 'Must be a valid email address',
        value: email,
        code: 'INVALID_EMAIL',
      }]);
    }
  }

  protected notFound(resource: string, id: any): never {
    throw new NotFoundError(resource, id);
  }

  protected conflict(message: string): never {
    throw new ConflictError(message);
  }
}