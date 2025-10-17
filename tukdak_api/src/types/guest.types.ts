// Base Guest interface - make sure this matches the database schema
export interface Guest {
  guest_id: string;
  english_name?: string | null;
  khmer_name?: string | null;
  amount_khr: number;
  amount_usd: number;
  payment_method?: 'QR_Code' | 'Cash' | null;
  guest_of: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  is_duplicate: boolean;
  created_at: string;  // Make this required and always string
  updated_at: string;  // Make this required and always string
}

// Request interfaces
export interface CreateGuestRequest {
  guest_id: string;
  english_name?: string;
  khmer_name?: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: 'QR_Code' | 'Cash';
  guest_of: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
}

export interface UpdateGuestRequest {
  english_name?: string;
  khmer_name?: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: 'QR_Code' | 'Cash' | null;
  guest_of?: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  is_duplicate?: boolean;
}

// Search related types
export type SearchType = 'guest_id' | 'english_name' | 'khmer_name';

export interface SearchGuestsRequest {
  query: string;
  searchType: SearchType;
  limit?: number;
  offset?: number;
  includeDuplicates?: boolean;
}

// Filter interface
export interface GuestFilters {
  guest_of?: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  payment_method?: 'QR_Code' | 'Cash';
  has_payment?: boolean;
  is_duplicate?: boolean;
}

// Statistics interface
export interface GuestStatistics {
  total_guests: number;
  total_khr: number;
  total_usd: number;
  paid_guests: number;
  pending_guests: number;
  duplicates: number;
  payment_methods: {
    qr_code: number;
    cash: number;
    pending: number;
  };
  guest_distribution: {
    bride: number;
    groom: number;
    bride_parents: number;
    groom_parents: number;
  };
}

// Response interfaces
export interface SearchResult {
  guests: Guest[];
  total_count: number;
  search_time_ms: number;
  query_used: string;
  search_type: SearchType;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}