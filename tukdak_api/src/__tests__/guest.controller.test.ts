/// <reference types="jest" />
import { GuestService } from '../services/guest-service';
import { GuestRepository } from '../repositories/guest-repository';
import { ValidationError, NotFoundError } from '../errors/custom-errors';
import { mockGuest, createMockRepository, validCreateRequest, validCreateRequestWithPayment } from './test-helpers';
import { SearchType } from '../types/database.types';

// Mock repository
jest.mock('../repositories/guest-repository');

describe('GuestService - Search Functionality', () => {
  let service: GuestService;
  let mockRepo: jest.Mocked<GuestRepository>;

  const mockSearchResult = {
    guests: [
      {
        guest_id: 'WED001',
        english_name: 'John Doe',
        khmer_name: 'ជន ដូ',
        amount_khr: 500000,
        amount_usd: 125,
        payment_method: 'QR_Code' as const,
        guest_of: 'Bride' as const,
        is_duplicate: false,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }
    ],
    total_count: 1,
    search_time_ms: 15.5,
    query_used: 'john',
    search_type: 'english_name' as SearchType
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const repo = {
      searchGuests: jest.fn(),
    } as unknown as jest.Mocked<GuestRepository>;
    
    (GuestRepository as jest.MockedClass<typeof GuestRepository>).mockImplementation(() => repo);
    service = new GuestService();
    mockRepo = (service as unknown as { guestRepository: jest.Mocked<GuestRepository> }).guestRepository;
  });

  describe('searchGuests', () => {
    it('should search guests successfully', async () => {
      mockRepo.searchGuests.mockResolvedValue(mockSearchResult);

      const result = await service.searchGuests({
        query: 'john',
        searchType: 'english_name'
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('john', 'english_name', 50, 0);
      expect(result).toEqual(mockSearchResult);
    });

    it('should validate search query is required', async () => {
      await expect(service.searchGuests({
        query: '',
        searchType: 'english_name'
      })).rejects.toThrow('Validation failed');
    });

    it('should validate search query is string', async () => {
      await expect(service.searchGuests({
        query: null as unknown as string,
        searchType: 'english_name'
      })).rejects.toThrow('Validation failed');
    });

    it('should validate search query length', async () => {
      const longQuery = 'a'.repeat(101);
      await expect(service.searchGuests({
        query: longQuery,
        searchType: 'english_name'
      })).rejects.toThrow('Validation failed');
    });

    it('should validate search type', async () => {
      await expect(service.searchGuests({
        query: 'john',
        searchType: 'invalid_type' as SearchType
      })).rejects.toThrow('Validation failed');
    });

    it('should validate limit parameter', async () => {
      await expect(service.searchGuests({
        query: 'john',
        searchType: 'english_name',
        limit: 0
      })).rejects.toThrow('Validation failed');

      await expect(service.searchGuests({
        query: 'john',
        searchType: 'english_name',
        limit: 101
      })).rejects.toThrow('Validation failed');
    });

    it('should validate offset parameter', async () => {
      await expect(service.searchGuests({
        query: 'john',
        searchType: 'english_name',
        offset: -1
      })).rejects.toThrow('Validation failed');
    });

    it('should warn about slow search performance', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const slowResult = { ...mockSearchResult, search_time_ms: 250 };
      mockRepo.searchGuests.mockResolvedValue(slowResult);

      await service.searchGuests({
        query: 'john',
        searchType: 'english_name'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Search performance warning: 250ms')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('quickSearch', () => {
    it('should perform quick search', async () => {
      mockRepo.searchGuests.mockResolvedValue(mockSearchResult);

      const result = await service.quickSearch('john', 'english_name');

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('john', 'english_name', 20, 0);
      expect(result).toEqual(mockSearchResult.guests);
    });
  });

  describe('search types', () => {
    it('should support guest_id search', async () => {
      const guestIdResult = { ...mockSearchResult, search_type: 'guest_id' as SearchType };
      mockRepo.searchGuests.mockResolvedValue(guestIdResult);

      await service.searchGuests({
        query: 'WED001',
        searchType: 'guest_id'
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('WED001', 'guest_id', 50, 0);
    });

    it('should support english_name search', async () => {
      mockRepo.searchGuests.mockResolvedValue(mockSearchResult);

      await service.searchGuests({
        query: 'john',
        searchType: 'english_name'
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('john', 'english_name', 50, 0);
    });

    it('should support khmer_name search', async () => {
      const khmerResult = { ...mockSearchResult, search_type: 'khmer_name' as SearchType };
      mockRepo.searchGuests.mockResolvedValue(khmerResult);

      await service.searchGuests({
        query: 'ជន',
        searchType: 'khmer_name'
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('ជន', 'khmer_name', 50, 0);
    });
  });

  describe('pagination', () => {
    it('should handle pagination parameters', async () => {
      mockRepo.searchGuests.mockResolvedValue(mockSearchResult);

      await service.searchGuests({
        query: 'john',
        searchType: 'english_name',
        limit: 10,
        offset: 20
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('john', 'english_name', 10, 20);
    });

    it('should use default pagination values', async () => {
      mockRepo.searchGuests.mockResolvedValue(mockSearchResult);

      await service.searchGuests({
        query: 'john',
        searchType: 'english_name'
      });

      expect(mockRepo.searchGuests).toHaveBeenCalledWith('john', 'english_name', 50, 0);
    });
  });
});

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
          english_name: 'Test',
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
        english_name: '',
        khmer_name: '',
        guest_of: 'Bride'
      })).rejects.toThrow('Validation failed');
    });

    it('should validate required fields - invalid guest_of', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        english_name: 'Test',
        khmer_name: 'តេស្ត',
        guest_of: 'InvalidValue' as any
      })).rejects.toThrow('Validation failed');
    });

    it('should validate payment method when amount provided', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        english_name: 'Test',
        khmer_name: 'តេស្ត',
        guest_of: 'Bride',
        amount_khr: 100000
        // missing payment_method
      })).rejects.toThrow('Payment method is required when amount is provided');
    });

    it('should validate negative amounts - KHR', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        english_name: 'Test',
        khmer_name: 'តេស្ត',
        guest_of: 'Bride',
        amount_khr: -100
      })).rejects.toThrow('KHR amount cannot be negative');
    });

    it('should validate negative amounts - USD', async () => {
      await expect(service.createGuest({
        guest_id: 'TEST001',
        english_name: 'Test',
        khmer_name: 'តេស្ត',
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
      await expect(service.updateGuest('', { english_name: 'Test' }))
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
      await expect(service.updateGuest('TEST001', { english_name: '', khmer_name: '' }))
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