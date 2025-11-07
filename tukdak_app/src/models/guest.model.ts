export interface Guest {
  guest_id: string;
  english_name: string;
  khmer_name: string;
  guest_of: 'Bride' | 'Groom' | string;
  amount_khr: number;
  amount_usd: number;
  payment_method: 'QR_Code' | 'Cash' | 'Bank_Transfer' | string | null;
  is_duplicate: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestsResponse {
  success: boolean;
  data: Guest[];
  total: number;
}

export interface GuestResponse {
  success: boolean;
  data: Guest;
}