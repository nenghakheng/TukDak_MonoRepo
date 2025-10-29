import { Guest } from '../types/database.types';
import { CreateGuestRequest } from '../types/guest.types';

export const mockGuest: Guest = {
  guest_id: 'TEST001',
  english_name: undefined,
  khmer_name: undefined,
  amount_khr: 500000,
  amount_usd: 125,
  payment_method: 'QR_Code',
  guest_of: 'Bride',
  is_duplicate: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockStats = {
  total_guests: 2,
  total_khr: 500000,
  total_usd: 125,
  paid_guests: 1,
  pending_guests: 1,
  duplicates: 0,
  payment_methods: { qr_code: 1, cash: 0, pending: 1 },
  guest_distribution: { bride: 1, groom: 1, bride_parents: 0, groom_parents: 0 },
};

interface MockGuestService {
  createGuest: jest.MockedFunction<(data: CreateGuestRequest) => Promise<Guest>>;
  getGuestById: jest.MockedFunction<(id: string) => Promise<Guest>>;
  getAllGuests: jest.MockedFunction<(filters?: unknown) => Promise<Guest[]>>;
  updateGuest: jest.MockedFunction<(id: string, updates: unknown) => Promise<Guest>>;
  checkInGuest: jest.MockedFunction<(id: string, paymentData: unknown) => Promise<Guest>>;
  deleteGuest: jest.MockedFunction<(id: string, soft?: boolean) => Promise<boolean>>;
  getStatistics: jest.MockedFunction<() => Promise<unknown>>;
}

export const createMockService = (): MockGuestService => ({
  createGuest: jest.fn(),
  getGuestById: jest.fn(),
  getAllGuests: jest.fn(),
  updateGuest: jest.fn(),
  checkInGuest: jest.fn(),
  deleteGuest: jest.fn(),
  getStatistics: jest.fn(),
});

interface MockGuestRepository {
  createGuest: jest.MockedFunction<(data: CreateGuestRequest) => Promise<Guest>>;
  getGuestById: jest.MockedFunction<(id: string) => Promise<Guest>>;
  getAllGuests: jest.MockedFunction<(filters?: unknown) => Promise<Guest[]>>;
  updateGuest: jest.MockedFunction<(id: string, updates: unknown) => Promise<Guest>>;
  checkInGuest: jest.MockedFunction<(id: string, paymentData: unknown) => Promise<Guest>>;
  deleteGuest: jest.MockedFunction<(id: string, soft?: boolean) => Promise<boolean>>;
  getGuestStatistics: jest.MockedFunction<() => Promise<unknown>>;
}

export const createMockRepository = (): MockGuestRepository => ({
  createGuest: jest.fn(),
  getGuestById: jest.fn(),
  getAllGuests: jest.fn(),
  updateGuest: jest.fn(),
  checkInGuest: jest.fn(),
  deleteGuest: jest.fn(),
  getGuestStatistics: jest.fn(),
});

export const validCreateRequest: CreateGuestRequest = {
  guest_id: 'TEST001',
  english_name: 'Test',
  khmer_name: 'តេស្ត',
  guest_of: 'Bride',
};

export const validCreateRequestWithPayment: CreateGuestRequest = {
  guest_id: 'TEST001',
  english_name: 'Test',
  khmer_name: 'តេស្ត',
  amount_khr: 500000,
  amount_usd: 125,
  payment_method: 'QR_Code',
  guest_of: 'Bride',
};