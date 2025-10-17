-- Migration: Initial database schema
-- Created: 2024-10-17
-- Description: Creates the initial guestlist, activity_logs, and error_logs tables

-- Create guestlist table
CREATE TABLE IF NOT EXISTS guestlist (
  guest_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount_khr INTEGER DEFAULT 0,
  amount_usd INTEGER DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('QR_Code', 'Cash')) NULL,
  guest_of TEXT NOT NULL CHECK (guest_of IN ('Bride', 'Groom', 'Bride_Parents', 'Groom_Parents')),
  is_duplicate INTEGER DEFAULT 0 CHECK (is_duplicate IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'payment_received', 'duplicate_marked', 'duplicate_resolved', 'searched')),
  old_amount_khr INTEGER,
  new_amount_khr INTEGER,
  old_amount_usd INTEGER,
  new_amount_usd INTEGER,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guestlist(guest_id)
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_guestlist_guest_of ON guestlist (guest_of);
CREATE INDEX IF NOT EXISTS idx_guestlist_payment_method ON guestlist (payment_method);
CREATE INDEX IF NOT EXISTS idx_activity_logs_guest_id ON activity_logs (guest_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs (timestamp);