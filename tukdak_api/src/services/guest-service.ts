import { GuestRepository } from '../repositories/guest-repository';
import { Guest } from '../types/database.types';
import { CreateGuestRequest, UpdateGuestRequest, GuestFilters } from '../types/guest.types';
import { ValidationError, NotFoundError } from '../errors/custom-errors';

export class GuestService {
  private guestRepository: GuestRepository;

  constructor() {
    this.guestRepository = new GuestRepository();
  }

  async createGuest(data: CreateGuestRequest): Promise<Guest> {
    this.validateCreateGuestData(data);
    return await this.guestRepository.createGuest(data);
  }

  async getGuestById(guestId: string): Promise<Guest> {
    if (!guestId || guestId.trim() === '') {
      throw new ValidationError('Valid guest ID is required');
    }
    return await this.guestRepository.getGuestById(guestId);
  }

  async getAllGuests(filters?: GuestFilters): Promise<Guest[]> {
    return await this.guestRepository.getAllGuests(filters);
  }

  async updateGuest(guestId: string, updates: UpdateGuestRequest): Promise<Guest> {
    if (!guestId || guestId.trim() === '') {
      throw new ValidationError('Valid guest ID is required');
    }
    
    this.validateUpdateGuestData(updates);
    return await this.guestRepository.updateGuest(guestId, updates);
  }

  async deleteGuest(guestId: string, softDelete: boolean = true): Promise<boolean> {
    if (!guestId || guestId.trim() === '') {
      throw new ValidationError('Valid guest ID is required');
    }
    return await this.guestRepository.deleteGuest(guestId, softDelete);
  }

  async getStatistics() {
    return await this.guestRepository.getGuestStatistics();
  }

  private validateCreateGuestData(data: CreateGuestRequest): void {
    const errors: any[] = [];

    // Required fields validation
    if (!data.guest_id || data.guest_id.trim() === '') {
      errors.push({
        field: 'guest_id',
        message: 'Guest ID is required',
        code: 'REQUIRED'
      });
    }

    if (!data.name || data.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED'
      });
    }

    if (!data.guest_of) {
      errors.push({
        field: 'guest_of',
        message: 'Guest relationship is required',
        code: 'REQUIRED'
      });
    }

    // Validate guest_of enum
    const validGuestOf = ['Bride', 'Groom', 'Bride_Parents', 'Groom_Parents'];
    if (data.guest_of && !validGuestOf.includes(data.guest_of)) {
      errors.push({
        field: 'guest_of',
        message: 'Invalid guest relationship',
        code: 'INVALID_VALUE'
      });
    }

    // Amount validation
    if (data.amount_khr !== undefined) {
      if (data.amount_khr < 0) {
        throw new ValidationError('KHR amount cannot be negative');
      }
    }

    if (data.amount_usd !== undefined) {
      if (data.amount_usd < 0) {
        throw new ValidationError('USD amount cannot be negative');
      }
    }

    // Payment method validation
    if ((data.amount_khr && data.amount_khr > 0) || (data.amount_usd && data.amount_usd > 0)) {
      if (!data.payment_method) {
        throw new ValidationError('Payment method is required when amount is provided');
      }
    }

    if (data.payment_method) {
      const validPaymentMethods = ['QR_Code', 'Cash'];
      if (!validPaymentMethods.includes(data.payment_method)) {
        errors.push({
          field: 'payment_method',
          message: 'Invalid payment method',
          code: 'INVALID_VALUE'
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private validateUpdateGuestData(updates: UpdateGuestRequest): void {
    const errors: any[] = [];

    // Check if at least one field is provided
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    // Name validation
    if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
      errors.push({
        field: 'name',
        message: 'Name cannot be empty',
        code: 'REQUIRED'
      });
    }

    // Amount validation
    if (updates.amount_khr !== undefined && updates.amount_khr < 0) {
      errors.push({
        field: 'amount_khr',
        message: 'KHR amount cannot be negative',
        code: 'INVALID_TYPE'
      });
    }

    if (updates.amount_usd !== undefined && updates.amount_usd < 0) {
      errors.push({
        field: 'amount_usd',
        message: 'USD amount cannot be negative',
        code: 'INVALID_TYPE'
      });
    }

    // Payment method validation
    if (updates.payment_method !== undefined && updates.payment_method !== null) {
      const validPaymentMethods = ['QR_Code', 'Cash'];
      if (!validPaymentMethods.includes(updates.payment_method)) {
        errors.push({
          field: 'payment_method',
          message: 'Invalid payment method',
          code: 'INVALID_VALUE'
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }
}