export interface CreateGuestRequest {
  guest_id: string;
  name: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: 'QR_Code' | 'Cash';
  guest_of: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  is_duplicate?: boolean;
}

export interface UpdateGuestRequest {
  name?: string;
  amount_khr?: number;
  amount_usd?: number;
  payment_method?: 'QR_Code' | 'Cash' | null;
  is_duplicate?: boolean;
}

export interface GuestFilters {
  guest_of?: 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents';
  payment_method?: 'QR_Code' | 'Cash';
  has_payment?: boolean;
  is_duplicate?: boolean;
}