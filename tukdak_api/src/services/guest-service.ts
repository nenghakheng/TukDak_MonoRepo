import { GuestRepository } from '../repositories/guest-repository';
import {
  Guest,
  CreateGuestRequest,
  UpdateGuestRequest,
  SearchGuestsRequest,
  GuestFilters,
  SearchType,
  SearchResult,
  CheckInGuestRequest
} from '../types/guest.types';
import { ValidationError, NotFoundError } from '../errors/custom-errors';

export class GuestService {
  private guestRepository: GuestRepository;

  constructor() {
    this.guestRepository = new GuestRepository();
  }

  /**
   * Search for guests with validation and performance monitoring
   */
  async searchGuests(searchRequest: SearchGuestsRequest): Promise<SearchResult> {
    // Validate the search request
    this.validateSearchRequest(searchRequest);
    
    // Set default values for limit and offset
    const limit = searchRequest.limit ?? 50;
    const offset = searchRequest.offset ?? 0;
    
    // Call repository with individual parameters (to match test expectations)
    const result = await this.guestRepository.searchGuests(
      searchRequest.query,
      searchRequest.searchType,
      limit,
      offset
    );
    
    // Performance warning (to match test expectations)
    if (result.search_time_ms > 200) {
      console.warn(`Search performance warning: ${result.search_time_ms}ms for query "${searchRequest.query}" (${searchRequest.searchType})`);
    }
    
    // Return normalized result to match expected SearchResult type
    return {
      guests: result.guests.map(guest => this.normalizeGuest(guest)),
      total_count: result.total_count,
      search_time_ms: result.search_time_ms,
      query_used: result.query_used,
      search_type: result.search_type
    } as SearchResult;
  }

  /**
   * Quick search method for common use cases
   */
  async quickSearch(query: string, searchType: SearchType): Promise<Guest[]> {
    // Call repository with default limit and explicit offset
    const result = await this.guestRepository.searchGuests(query, searchType, 20, 0);
    
    // Map the result to ensure type consistency
    return result.guests.map(guest => ({
      guest_id: guest.guest_id,
      english_name: guest.english_name || null,
      khmer_name: guest.khmer_name || null,
      amount_khr: guest.amount_khr || 0,
      amount_usd: guest.amount_usd || 0,
      payment_method: guest.payment_method || null,
      guest_of: guest.guest_of,
      is_duplicate: Boolean(guest.is_duplicate),
      created_at: guest.created_at || new Date().toISOString(),
      updated_at: guest.updated_at || new Date().toISOString(),
    }));
  }

  /**
   * Validate search request parameters
   */
  private validateSearchRequest(searchRequest: SearchGuestsRequest): void {
    const { query, searchType, limit, offset } = searchRequest;

    // Check if query exists and is a string
    if (query === null || query === undefined || typeof query !== 'string') {
      throw new ValidationError('Validation failed');
    }

    // Check if query is empty (including whitespace-only strings)
    if (query.trim().length === 0) {
      throw new ValidationError('Validation failed');
    }

    // Validate query length
    if (query.length > 100) {
      throw new ValidationError('Validation failed');
    }

    // Validate search type
    const validSearchTypes: SearchType[] = ['guest_id', 'english_name', 'khmer_name'];
    if (!validSearchTypes.includes(searchType)) {
      throw new ValidationError('Validation failed');
    }

    // Validate limit
    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1 || limit > 100) {
        throw new ValidationError('Validation failed');
      }
    }

    // Validate offset
    if (offset !== undefined) {
      if (typeof offset !== 'number' || offset < 0) {
        throw new ValidationError('Validation failed');
      }
    }
  }

  // Helper method to normalize guest data
  private normalizeGuest(guest: any): Guest {
    if (!guest) {
      throw new Error('Cannot normalize undefined guest');
    }

    return {
      guest_id: guest.guest_id,
      english_name: guest.english_name,
      khmer_name: guest.khmer_name,
      amount_khr: guest.amount_khr ?? 0,
      amount_usd: guest.amount_usd ?? 0,
      payment_method: guest.payment_method ?? null,
      guest_of: guest.guest_of,
      is_duplicate: Boolean(guest.is_duplicate),
      created_at: guest.created_at || new Date().toISOString(),
      updated_at: guest.updated_at || new Date().toISOString(),
    };
  }

  // Rest of your service methods - update to use normalizeGuest
  async createGuest(guestData: CreateGuestRequest): Promise<Guest> {
    this.validateCreateGuestData(guestData);
    const result = await this.guestRepository.createGuest(guestData);
    return this.normalizeGuest(result);
  }

  async getGuestById(guestId: string): Promise<Guest> {
    if (!guestId || typeof guestId !== 'string' || guestId.trim().length === 0) {
      throw new ValidationError('Valid guest ID is required');
    }
    const result = await this.guestRepository.getGuestById(guestId);
    return this.normalizeGuest(result);
  }

  async getAllGuests(filters?: GuestFilters): Promise<Guest[]> {
    const results = await this.guestRepository.getAllGuests(filters);
    return results.map(guest => this.normalizeGuest(guest));
  }

  async updateGuest(guestId: string, updates: UpdateGuestRequest): Promise<Guest> {
    if (!guestId || typeof guestId !== 'string' || guestId.trim().length === 0) {
      throw new ValidationError('Valid guest ID is required');
    }
    this.validateUpdateGuestData(updates);
    const result = await this.guestRepository.updateGuest(guestId, updates);
    return this.normalizeGuest(result);
  }

  async checkInGuest(guestId: string, paymentData: CheckInGuestRequest): Promise<Guest> {
    if (!guestId || typeof guestId !== 'string' || guestId.trim().length === 0) {
      throw new ValidationError('Valid guest ID is required');
    }
    this.validateCheckedInGuestData(paymentData);
    const result = await this.guestRepository.checkInGuest(guestId, paymentData);
    return this.normalizeGuest(result);
  }

  async deleteGuest(guestId: string, softDelete: boolean = true): Promise<boolean> {
    if (!guestId || typeof guestId !== 'string' || guestId.trim().length === 0) {
      throw new ValidationError('Valid guest ID is required');
    }
    return this.guestRepository.deleteGuest(guestId, softDelete);
  }

  async getStatistics() {
    return this.guestRepository.getGuestStatistics();
  }

  // Keep your existing validation methods unchanged...
  private validateCreateGuestData(data: CreateGuestRequest): void {
    const details: { field: string; message: string; value?: any; code?: string }[] = [];

    // Required fields
    if (typeof data.guest_id !== 'string' || data.guest_id.trim().length === 0) {
      details.push({ field: 'guest_id', message: 'Guest ID is required', code: 'REQUIRED' });
    }
    if (typeof data.english_name !== 'string' || data.english_name.trim().length === 0) {
      details.push({ field: 'english_name', message: 'English Name is required', code: 'REQUIRED' });
    }
    if (typeof data.khmer_name !== 'string' || data.khmer_name.trim().length === 0) {
      details.push({ field: 'khmer_name', message: 'Khmer Name is required', code: 'REQUIRED' });
    }
    if (!data.guest_of || !['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents'].includes(data.guest_of)) {
      // Keep generic for invalid value
      details.push({ field: 'guest_of', message: 'Invalid guest_of', code: 'INVALID_TYPE' });
    }

    // Early throw for required field errors to match tests
    if (details.length > 0) {
      throw new ValidationError('Validation failed', details);
    }

    // Amount validations with specific messages
    if (data.amount_khr !== undefined) {
      if (typeof data.amount_khr !== 'number') {
        throw new ValidationError('Validation failed');
      }
      if (data.amount_khr < 0) {
        throw new ValidationError('KHR amount cannot be negative');
      }
    }
    if (data.amount_usd !== undefined) {
      if (typeof data.amount_usd !== 'number') {
        throw new ValidationError('Validation failed');
      }
      if (data.amount_usd < 0) {
        throw new ValidationError('USD amount cannot be negative');
      }
    }

    // Payment method required when any amount provided
    const hasAmount = (data.amount_khr ?? 0) > 0 || (data.amount_usd ?? 0) > 0;
    if (hasAmount && !data.payment_method) {
      throw new ValidationError('Payment method is required when amount is provided');
    }

    if (data.payment_method && !['QR_Code', 'Cash'].includes(data.payment_method)) {
      throw new ValidationError('Validation failed');
    }
  }

  private validateUpdateGuestData(updates: UpdateGuestRequest): void {
    const allowedFields = ['english_name', 'khmer_name', 'amount_khr', 'amount_usd', 'payment_method', 'guest_of', 'is_duplicate'];
    const providedFields = Object.keys(updates);
    
    if (providedFields.length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    providedFields.forEach(field => {
      if (!allowedFields.includes(field)) {
        throw new ValidationError('Validation failed');
      }
    });

    // Collect details for certain validations to match tests
    const details: { field: string; message: string; value?: any; code?: string }[] = [];

    if (updates.english_name !== undefined && (typeof updates.english_name !== 'string' || updates.english_name.trim().length === 0)) {
      details.push({ field: 'English name', message: ' English Name must be a non-empty string', code: 'INVALID_TYPE' });
    }

    if (updates.khmer_name !== undefined && (typeof updates.khmer_name !== 'string' || updates.khmer_name.trim().length === 0)) {
      details.push({ field: 'Khmer name', message: ' Khmer Name must be a non-empty string', code: 'INVALID_TYPE' });
    }
    if (updates.amount_khr !== undefined) {
      if (typeof updates.amount_khr !== 'number') {
        details.push({ field: 'amount_khr', message: 'Amount KHR must be a number', code: 'INVALID_TYPE' });
      } else if (updates.amount_khr < 0) {
        details.push({ field: 'amount_khr', message: 'Amount KHR must be non-negative', code: 'INVALID_TYPE' });
      }
    }
    if (updates.amount_usd !== undefined) {
      if (typeof updates.amount_usd !== 'number') {
        details.push({ field: 'amount_usd', message: 'Amount USD must be a number', code: 'INVALID_TYPE' });
      } else if (updates.amount_usd < 0) {
        details.push({ field: 'amount_usd', message: 'Amount USD must be non-negative', code: 'INVALID_TYPE' });
      }
    }
    if (details.length > 0) {
      throw new ValidationError('Validation failed', details);
    }
    if (updates.payment_method !== undefined && updates.payment_method !== null && !['QR_Code', 'Cash'].includes(updates.payment_method)) {
      throw new ValidationError('Validation failed');
    }
    if (updates.guest_of !== undefined && !['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents'].includes(updates.guest_of)) {
      throw new ValidationError('Validation failed');
    }
    if (updates.is_duplicate !== undefined && typeof updates.is_duplicate !== 'boolean') {
      throw new ValidationError('Validation failed');
    }
  }

  private validateCheckedInGuestData(data: CheckInGuestRequest): void {
    const errors: Array<{field: string; message: string; code: string; value?: any}> = [];

    // Check if payment_method is provided (required for check-in)
    if (data.payment_method === undefined) {
      throw new ValidationError('Payment method is required for check-in');
    }

    // Validate payment_method value
    if (data.payment_method === null) {
      errors.push({
        field: 'payment_method',
        message: 'Payment method cannot be null',
        code: 'INVALID_TYPE',
        value: data.payment_method,
      });
    } else if (!['QR_Code', 'Cash'].includes(data.payment_method)) {
      errors.push({
        field: 'payment_method',
        message: 'Payment method must be either QR_Code or Cash',
        code: 'INVALID_TYPE',
        value: data.payment_method,
      });
    }

    // Validate amount_khr
    if (data.amount_khr !== undefined) {
      if (typeof data.amount_khr !== 'number') {
        errors.push({
          field: 'amount_khr',
          message: 'Amount KHR must be a number',
          code: 'INVALID_TYPE',
          value: data.amount_khr,
        });
      } else if (data.amount_khr < 0) {
        errors.push({
          field: 'amount_khr',
          message: 'Amount KHR must be non-negative',
          code: 'INVALID_TYPE',
          value: data.amount_khr,
        });
      }
    }

    // Validate amount_usd
    if (data.amount_usd !== undefined) {
      if (typeof data.amount_usd !== 'number') {
        errors.push({
          field: 'amount_usd',
          message: 'Amount USD must be a number',
          code: 'INVALID_TYPE',
          value: data.amount_usd,
        });
      } else if (data.amount_usd < 0) {
        errors.push({
          field: 'amount_usd',
          message: 'Amount USD must be non-negative',
          code: 'INVALID_TYPE',
          value: data.amount_usd,
        });
      }
    }

    // Check for non-allowed fields
    const allowedFields = ['amount_khr', 'amount_usd', 'payment_method'];
    const providedFields = Object.keys(data);
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      invalidFields.forEach(field => {
        errors.push({
          field,
          message: `Field '${field}' is not allowed for check-in`,
          code: 'INVALID_FIELD',
          value: (data as any)[field],
        });
      });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }
}