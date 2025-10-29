import { GuestService } from '../services/guest-service';
import { GuestRepository } from '../repositories/guest-repository';
import { ValidationError, NotFoundError } from '../errors/custom-errors';
import { mockGuest, createMockRepository } from './test-helpers';
import { CheckInGuestRequest } from '../types/guest.types';

// Mock repository
jest.mock('../repositories/guest-repository');

describe('GuestService - Check-in Functionality', () => {
  let service: GuestService;
  let mockRepo: jest.Mocked<GuestRepository>;

  const mockCheckedInGuest = {
    ...mockGuest,
    amount_khr: 500000,
    amount_usd: 125,
    payment_method: 'QR_Code' as const,
    updated_at: '2024-10-29T10:30:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const repo = createMockRepository();
    (GuestRepository as jest.MockedClass<typeof GuestRepository>).mockImplementation(() => repo as any);
    service = new GuestService();
    mockRepo = (service as any).guestRepository;
  });

  describe('checkInGuest', () => {
    describe('Successful check-ins', () => {
      it('should check in guest with KHR payment successfully', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(mockRepo.checkInGuest).toHaveBeenCalledWith('TEST001', checkInData);
        expect(result.amount_khr).toBe(500000);
        expect(result.payment_method).toBe('Cash');
      });

      it('should check in guest with USD payment successfully', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_usd: 125,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_usd: 125,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(mockRepo.checkInGuest).toHaveBeenCalledWith('TEST001', checkInData);
        expect(result.amount_usd).toBe(125);
        expect(result.payment_method).toBe('QR_Code');
      });

      it('should check in guest with both KHR and USD successfully', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          amount_usd: 125,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          amount_usd: 125,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(mockRepo.checkInGuest).toHaveBeenCalledWith('TEST001', checkInData);
        expect(result.amount_khr).toBe(500000);
        expect(result.amount_usd).toBe(125);
        expect(result.payment_method).toBe('Cash');
      });

      it('should check in guest with QR_Code payment method', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 300000,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 300000,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.payment_method).toBe('QR_Code');
      });

      it('should check in guest with zero USD when only KHR provided', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          amount_usd: 0,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_khr).toBe(500000);
        expect(result.amount_usd).toBe(0);
      });

      it('should check in guest with zero KHR when only USD provided', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_usd: 100,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 0,
          amount_usd: 100,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_khr).toBe(0);
        expect(result.amount_usd).toBe(100);
      });
    });

    describe('Validation errors', () => {
      it('should validate guest ID is required', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        await expect(service.checkInGuest('', checkInData))
          .rejects.toThrow('Valid guest ID is required');
      });

      it('should validate guest ID is not whitespace only', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        await expect(service.checkInGuest('   ', checkInData))
          .rejects.toThrow('Valid guest ID is required');
      });

      it('should validate negative KHR amount', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: -100,
          payment_method: 'Cash',
        };

        try {
          await service.checkInGuest('TEST001', checkInData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toBe('Validation failed');
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'amount_khr',
                message: 'Amount KHR must be non-negative',
                code: 'INVALID_TYPE',
              }),
            ])
          );
        }
      });

      it('should validate negative USD amount', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_usd: -50,
          payment_method: 'Cash',
        };

        try {
          await service.checkInGuest('TEST001', checkInData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toBe('Validation failed');
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'amount_usd',
                message: 'Amount USD must be non-negative',
                code: 'INVALID_TYPE',
              }),
            ])
          );
        }
      });

      it('should validate KHR amount is a number', async () => {
        const checkInData: any = {
          amount_khr: 'invalid',
          payment_method: 'Cash',
        };

        try {
          await service.checkInGuest('TEST001', checkInData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toBe('Validation failed');
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'amount_khr',
                code: 'INVALID_TYPE',
              }),
            ])
          );
        }
      });

      it('should validate USD amount is a number', async () => {
        const checkInData: any = {
          amount_usd: 'invalid',
          payment_method: 'Cash',
        };

        try {
          await service.checkInGuest('TEST001', checkInData);
          fail('Should have thrown ValidationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).message).toBe('Validation failed');
          expect((error as ValidationError).details).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                field: 'amount_usd',
                code: 'INVALID_TYPE',
              }),
            ])
          );
        }
      });

      it('should validate invalid payment method', async () => {
        const checkInData: any = {
          amount_khr: 500000,
          payment_method: 'InvalidMethod',
        };

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Validation failed');
      });

      it('should validate payment method is one of allowed values', async () => {
        const invalidMethods = ['cash', 'qr_code', 'Bank', 'Credit', ''];
        
        for (const method of invalidMethods) {
          const checkInData: any = {
            amount_khr: 500000,
            payment_method: method,
          };

          await expect(service.checkInGuest('TEST001', checkInData))
            .rejects.toThrow('Validation failed');
        }
      });

      it('should reject non-allowed fields', async () => {
        const checkInData: any = {
          amount_khr: 500000,
          payment_method: 'Cash',
          english_name: 'Should not be allowed',
        };

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Validation failed');
      });

      it('should reject guest_of field in check-in', async () => {
        const checkInData: any = {
          amount_khr: 500000,
          payment_method: 'Cash',
          guest_of: 'Bride',
        };

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Validation failed');
      });

      it('should reject is_duplicate field in check-in', async () => {
        const checkInData: any = {
          amount_khr: 500000,
          payment_method: 'Cash',
          is_duplicate: false,
        };

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Validation failed');
      });
    });

    describe('Not found errors', () => {
      it('should handle guest not found', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        const notFoundError = new NotFoundError('Guest', 'NONEXISTENT');
        mockRepo.checkInGuest.mockRejectedValue(notFoundError);

        try {
          await service.checkInGuest('NONEXISTENT', checkInData);
          fail('Should have thrown NotFoundError');
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundError);
          expect((error as NotFoundError).message).toBe('Guest with id NONEXISTENT not found');
        }
      });
    });

    describe('Edge cases', () => {
      it('should handle zero amounts (both KHR and USD)', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 0,
          amount_usd: 0,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 0,
          amount_usd: 0,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_khr).toBe(0);
        expect(result.amount_usd).toBe(0);
      });

      it('should handle large KHR amounts', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 10000000, // 10 million
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 10000000,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_khr).toBe(10000000);
      });

      it('should handle large USD amounts', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_usd: 10000,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_usd: 10000,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_usd).toBe(10000);
      });

      it('should handle decimal USD amounts', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_usd: 125.50,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_usd: 125.50,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        expect(result.amount_usd).toBe(125.50);
      });

      it('should normalize guest data after check-in', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        // Mock repository returns data without proper defaults
        mockRepo.checkInGuest.mockResolvedValue({
          guest_id: 'TEST001',
          english_name: 'Test Guest',
          khmer_name: null as any,
          amount_khr: 500000,
          amount_usd: null as any,
          payment_method: 'Cash',
          guest_of: 'Bride',
          is_duplicate: 0 as any,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-10-29T10:30:00.000Z',
        });

        const result = await service.checkInGuest('TEST001', checkInData);

        // Should normalize null values
        expect(result.khmer_name).toBe(null);
        expect(result.amount_usd).toBe(0);
        expect(result.is_duplicate).toBe(false);
      });
    });

    describe('Repository errors', () => {
      it('should handle repository errors', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        const repoError = new Error('Database connection failed');
        mockRepo.checkInGuest.mockRejectedValue(repoError);

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Database connection failed');
      });

      it('should handle constraint violation errors', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        const constraintError = new Error('SQLITE_CONSTRAINT');
        mockRepo.checkInGuest.mockRejectedValue(constraintError);

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('SQLITE_CONSTRAINT');
      });
    });

    describe('Multiple check-ins (payment updates)', () => {
      it('should allow updating payment for already checked-in guest', async () => {
        // First check-in
        const firstCheckIn: CheckInGuestRequest = {
          amount_khr: 300000,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 300000,
          payment_method: 'Cash',
        });

        const firstResult = await service.checkInGuest('TEST001', firstCheckIn);
        expect(firstResult.amount_khr).toBe(300000);

        // Second check-in (payment update)
        const secondCheckIn: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          payment_method: 'QR_Code',
        });

        const secondResult = await service.checkInGuest('TEST001', secondCheckIn);
        expect(secondResult.amount_khr).toBe(500000);
        expect(secondResult.payment_method).toBe('QR_Code');
      });

      it('should allow changing payment method', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);
        expect(result.payment_method).toBe('QR_Code');
      });
    });

    describe('Payment method validation', () => {
      it('should accept QR_Code payment method', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'QR_Code',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          payment_method: 'QR_Code',
        });

        const result = await service.checkInGuest('TEST001', checkInData);
        expect(result.payment_method).toBe('QR_Code');
      });

      it('should accept Cash payment method', async () => {
        const checkInData: CheckInGuestRequest = {
          amount_khr: 500000,
          payment_method: 'Cash',
        };

        mockRepo.checkInGuest.mockResolvedValue({
          ...mockGuest,
          amount_khr: 500000,
          payment_method: 'Cash',
        });

        const result = await service.checkInGuest('TEST001', checkInData);
        expect(result.payment_method).toBe('Cash');
      });

      it('should reject null payment method', async () => {
        const checkInData: any = {
          amount_khr: 500000,
          payment_method: null,
        };

        await expect(service.checkInGuest('TEST001', checkInData))
          .rejects.toThrow('Validation failed');
      });

      it('should reject undefined payment method', async () => {
        const checkInData: any = {
            amount_khr: 500000,
        };

        try {
            await service.checkInGuest('TEST001', checkInData);
            fail('Should have thrown ValidationError');
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect((error as ValidationError).message).toBe('Payment method is required for check-in');
        }
      });
    });
  });
});