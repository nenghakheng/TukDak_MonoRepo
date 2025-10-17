-- Migration: Add english_name and khmer_name columns
-- Created: 2025-10-17
-- Description: Adds english_name and khmer_name columns for multi-language guest name support

-- Add new columns for multi-language name support
ALTER TABLE guestlist ADD COLUMN english_name TEXT COLLATE NOCASE;
ALTER TABLE guestlist ADD COLUMN khmer_name TEXT;

-- Update existing data to populate the new columns
-- Copy existing name to english_name for all records
UPDATE guestlist SET english_name = name WHERE english_name IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_guestlist_english_name ON guestlist(english_name);
CREATE INDEX IF NOT EXISTS idx_guestlist_khmer_name ON guestlist(khmer_name);

-- Search optimization indexes
CREATE INDEX IF NOT EXISTS idx_guestlist_guest_id_lower ON guestlist(LOWER(guest_id));
CREATE INDEX IF NOT EXISTS idx_guestlist_name_lower ON guestlist(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_guestlist_english_name_lower ON guestlist(LOWER(english_name));
CREATE INDEX IF NOT EXISTS idx_guestlist_khmer_name_lower ON guestlist(LOWER(khmer_name));

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_guestlist_search_active ON guestlist(is_duplicate, created_at) WHERE is_duplicate = 0;
CREATE INDEX IF NOT EXISTS idx_guestlist_guest_of_active ON guestlist(guest_of, is_duplicate) WHERE is_duplicate = 0;