// Type aliases for better maintainability
export type PaymentMethod = 'QR_Code' | 'Cash';
export type GuestOf = 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents' | 'Bride_Sibling' | 'Groom_Sibling';

// Base Guest interface - matches the database schema
export interface Guest {
  guest_id: string;
  english_name: string | null;
  khmer_name: string | null;
  amount_khr: number;
  amount_usd: number;
  payment_method: PaymentMethod | null;
  guest_of: GuestOf | null; // Allow null
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
}

// Request interfaces
export interface CreateGuestRequest {
  english_name: string;
  khmer_name?: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: PaymentMethod | null;
  guest_of?: GuestOf | null; // Allow null
}

export interface UpdateGuestRequest {
  english_name?: string;
  khmer_name?: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: PaymentMethod | null;
  guest_of?: GuestOf | null; // Allow null
  is_duplicate?: boolean;
}

export interface CheckInGuestRequest {
  amount_khr?: number;
  amount_usd?: number;
  payment_method: PaymentMethod; // Required for check-in
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
  guest_of?: GuestOf;
  payment_method?: PaymentMethod;
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
    bride_sibling: number;
    groom_sibling: number;
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

// Pagination response
export interface PaginatedGuestsResponse {
  data: Guest[];
  total: number;
  page: number;
  totalPages: number;
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

// Activity log types
export interface ActivityLog {
  id: number;
  guest_id: string;
  action: 'created' | 'updated' | 'deleted' | 'payment_received' | 'duplicate_marked' | 'duplicate_resolved' | 'searched';
  old_amount_khr?: number | null;
  new_amount_khr?: number | null;
  old_amount_usd?: number | null;
  new_amount_usd?: number | null;
  details?: string;
  timestamp: string;
}
