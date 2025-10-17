import { GuestService } from '../services/guest-service';
import { GuestRepository } from '../repositories/guest-repository';
import { ValidationError } from '../errors/custom-errors';
import { mockGuest } from './test-helpers';

// Mock repository
jest.mock('../repositories/guest-repository');

describe('GuestService', () => {
  let service: GuestService;
  let mockRepo: jest.Mocked<GuestRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GuestService();
    mockRepo = (service as any).guestRepository;
  });

  describe('createGuest', () => {
    it('should validate required fields', async () => {
      await expect(service.createGuest({
        guest_id: '',
        name: 'Test',
        guest_of: 'Bride'
      })).rejects.toThrow(ValidationError);
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

    it('should create valid guest', async () => {
      mockRepo.createGuest.mockResolvedValue(mockGuest);

      const result = await service.createGuest({
        guest_id: 'TEST001',
        name: 'Test Guest',
        guest_of: 'Bride'
      });

      expect(result).toEqual(mockGuest);
    });
  });

  describe('updateGuest', () => {
    it('should validate negative amounts', async () => {
      await expect(service.updateGuest('TEST001', {
        amount_khr: -100
      })).rejects.toThrow(ValidationError);
    });

    it('should require at least one field', async () => {
      await expect(service.updateGuest('TEST001', {}))
        .rejects.toThrow('At least one field must be provided');
    });
  });
});