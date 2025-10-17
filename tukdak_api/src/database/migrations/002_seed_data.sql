-- Migration: Seed initial data
-- Created: 2024-10-17
-- Description: Adds sample guest data for testing

INSERT OR IGNORE INTO guestlist (guest_id, english_name, khmer_name, amount_khr, amount_usd, payment_method, guest_of) VALUES
('WED001', 'John Doe', 'John Doe', 'ជន ដូ', 500000, 125, 'QR_Code', 'Bride'),
('WED002', 'Jane Smith', 'Jane Smith', 'ជេន ស្មីត', 300000, 75, 'Cash', 'Groom'),
('WED003', 'Robert Johnson', 'Robert Johnson', 'រ៉ូបឺត ចន្សុន', 0, 0, NULL, 'Bride_Parents'),
('WED004', 'សុខ ច័ន្ទ', 'Sok Chan', 'សុខ ច័ន្ទ', 200000, 50, 'QR_Code', 'Groom_Parents');