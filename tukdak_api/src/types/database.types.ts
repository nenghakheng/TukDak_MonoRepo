export interface Guest {
  guest_id: string;
  english_name?: string;  // Added for English name search
  khmer_name?: string;    // Added for Khmer name search
  amount_khr: number;
  amount_usd: number;
  payment_method: 'QR_Code' | 'Cash' | null;
  guest_of: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  is_duplicate: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id?: number;
  guest_id: string;
  action: 'created' | 'updated' | 'deleted' | 'payment_received' | 'duplicate_marked' | 'duplicate_resolved' | 'searched';
  old_amount_khr?: number;
  new_amount_khr?: number;
  old_amount_usd?: number;
  new_amount_usd?: number;
  details?: string;
  timestamp?: string;
}

export interface ErrorLog {
  id?: number;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  request_path?: string;
  request_method?: string;
  user_agent?: string;
  ip_address?: string;
  timestamp?: string;
  resolved: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    statusCode: number;
    name: string;
    message: string;
    details?: unknown[];
    timestamp: string;
    path?: string;
  };
}

export interface SearchResult {
  guests: Guest[];
  total_count: number;
  search_time_ms: number;
  query_used: string;
  search_type: 'guest_id' | 'english_name' | 'khmer_name';
}

export type SearchType = 'guest_id' | 'english_name' | 'khmer_name';