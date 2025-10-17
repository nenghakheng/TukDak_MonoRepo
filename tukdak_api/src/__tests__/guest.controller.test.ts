import { GuestService } from '../services/guest-service';
import { GuestRepository } from '../repositories/guest-repository';
import { ValidationError, NotFoundError } from '../errors/custom-errors';
import { mockGuest, createMockRepository, validCreateRequest, validCreateRequestWithPayment } from './test-helpers';

// Mock repository
jest.mock('../repositories/guest-repository');

describe('GuestService', () => {
  let service: GuestService;
  let mockRepo: jest.Mocked<GuestRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    const repo = createMockRepository();
    (GuestRepository as jest.MockedClass<typeof GuestRepository>).mockImplementation(() => repo as any);
    service = new GuestService();
    mockRepo = (service as any).guestRepository;
  });

  describe('createGuest', () => {
    it('should create valid guest successfully', async () => {
      mockRepo.createGuest.mockResolvedValue(mockGuest);

      const result = await service.createGuest(validCreateRequest);

      expect(mockRepo.createGuest).toHaveBeenCalledWith(validCreateRequest);
      expect(result).toEqual(mockGuest);
    });

    it('should create guest with payment successfully', async () => {
      mockRepo.createGuest.mockResolvedValue(mockGuest);

      const result = await service.createGuest(validCreateRequestWithPayment);

      expect(mockRepo.createGuest).toHaveBeenCalledWith(validCreateRequestWithPayment);
      expect(result).toEqual(mockGuest);
    });

    it('should validate required fields - empty guest_id', async () => {
      try {
        await service.createGuest({
          guest_id: '',
          name: 'Test',
          guest_of: 'Bride'
        });
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).name).toBe('ValidationError');
        expect((error as ValidationError).message).toBe('Validation failed');
        expect((error as ValidationError).details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'guest_id',
              code: 'REQUIRED'
            })
          ])
        );
      }
    });

    it('should validate required fields - empty name', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        name: '',
        guest_of: 'Bride'
      })).rejects.toThrow('Validation failed');
    });

    it('should validate required fields - invalid guest_of', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        name: 'Test',
        guest_of: 'InvalidValue' as any
      })).rejects.toThrow('Validation failed');
    });

    it('should validate payment method when amount provided', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        name: 'Test',
        guest_of: 'Bride',
        amount_khr: 100000
        // missing payment_method
      })).rejects.toThrow('Payment method is required when amount is provided');
    });

    it('should validate negative amounts - KHR', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        name: 'Test',
        guest_of: 'Bride',
        amount_khr: -100
      })).rejects.toThrow('KHR amount cannot be negative');
    });

    it('should validate negative amounts - USD', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        name: 'Test',
        guest_of: 'Bride',
        amount_usd: -50
      })).rejects.toThrow('USD amount cannot be negative');
    });

    it('should handle repository errors', async () => {
      const repoError = new Error('Database error');
      mockRepo.createGuest.mockRejectedValue(repoError);

      await expect(service.createGuest(validCreateRequest)).rejects.toThrow('Database error');
    });
  });

  describe('getGuestById', () => {
    it('should get guest successfully', async () => {
      mockRepo.getGuestById.mockResolvedValue(mockGuest);

      const result = await service.getGuestById('TEST001');

      expect(mockRepo.getGuestById).toHaveBeenCalledWith('TEST001');
      expect(result).toEqual(mockGuest);
    });

    it('should validate guest ID', async () => {
      await expect(service.getGuestById('')).rejects.toThrow('Valid guest ID is required');
      await expect(service.getGuestById('   ')).rejects.toThrow('Valid guest ID is required');
    });

    it('should handle not found errors', async () => {
      const notFoundError = new NotFoundError('Guest', 'MISSING');
      mockRepo.getGuestById.mockRejectedValue(notFoundError);

      try {
        await service.getGuestById('MISSING');
        fail('Should have thrown NotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as NotFoundError).name).toBe('NotFoundError');
        expect((error as NotFoundError).message).toBe('Guest with id MISSING not found');
      }
    });
  });

  describe('getAllGuests', () => {
    it('should get all guests successfully', async () => {
      mockRepo.getAllGuests.mockResolvedValue([mockGuest]);

      const result = await service.getAllGuests();

      expect(mockRepo.getAllGuests).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockGuest]);
    });

    it('should pass filters correctly', async () => {
      const filters = { guest_of: 'Bride' as const, has_payment: true };
      mockRepo.getAllGuests.mockResolvedValue([mockGuest]);

      await service.getAllGuests(filters);

      expect(mockRepo.getAllGuests).toHaveBeenCalledWith(filters);
    });
  });

  describe('updateGuest', () => {
    it('should update guest successfully', async () => {
      const updatedGuest = { ...mockGuest, amount_khr: 600000 };
      mockRepo.updateGuest.mockResolvedValue(updatedGuest);

      const result = await service.updateGuest('TEST001', { amount_khr: 600000 });

      expect(mockRepo.updateGuest).toHaveBeenCalledWith('TEST001', { amount_khr: 600000 });
      expect(result).toEqual(updatedGuest);
    });

    it('should validate guest ID', async () => {
      await expect(service.updateGuest('', { name: 'Test' }))
        .rejects.toThrow('Valid guest ID is required');
    });

    it('should validate negative amounts', async () => {
      try {
        await service.updateGuest('TEST001', { amount_khr: -100 });
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toBe('Validation failed');
        expect((error as ValidationError).details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'amount_khr',
              code: 'INVALID_TYPE'
            })
          ])
        );
      }
    });

    it('should require at least one field', async () => {
      await expect(service.updateGuest('TEST001', {}))
        .rejects.toThrow('At least one field must be provided for update');
    });

    it('should validate empty name', async () => {
      await expect(service.updateGuest('TEST001', { name: '' }))
        .rejects.toThrow('Validation failed');
    });

    it('should validate invalid payment method', async () => {
      await expect(service.updateGuest('TEST001', { payment_method: 'InvalidMethod' as any }))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('deleteGuest', () => {
    it('should delete guest successfully', async () => {
      mockRepo.deleteGuest.mockResolvedValue(true);

      const result = await service.deleteGuest('TEST001');

      expect(mockRepo.deleteGuest).toHaveBeenCalledWith('TEST001', true);
      expect(result).toBe(true);
    });

    it('should validate guest ID', async () => {
      await expect(service.deleteGuest('')).rejects.toThrow('Valid guest ID is required');
    });
  });

  describe('getStatistics', () => {
    it('should get statistics successfully', async () => {
      const mockStats = {
        total_guests: 5,
        total_khr: 1000000,
        total_usd: 250,
        paid_guests: 3,
        pending_guests: 2,
        duplicates: 1,
        payment_methods: { qr_code: 2, cash: 1, pending: 2 },
        guest_distribution: { bride: 2, groom: 2, bride_parents: 1, groom_parents: 0 },
      };
      mockRepo.getGuestStatistics.mockResolvedValue(mockStats);

      const result = await service.getStatistics();

      expect(mockRepo.getGuestStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});