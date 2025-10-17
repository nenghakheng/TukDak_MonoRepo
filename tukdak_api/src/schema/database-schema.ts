export const DATABASE_SCHEMA = {
  // Guest list table - Updated for gift/money tracking
  GUESTLIST_TABLE: `
    CREATE TABLE IF NOT EXISTS guestlist (
      guest_id TEXT PRIMARY KEY,
      name TEXT NOT NULL COLLATE NOCASE,
      amount_khr DECIMAL(12,2) DEFAULT 0,
      amount_usd DECIMAL(10,2) DEFAULT 0,
      payment_method TEXT CHECK(payment_method IN ('QR_Code', 'Cash')),
      guest_of TEXT CHECK(guest_of IN ('Bride', 'Groom', 'Bride_Parents', 'Groom_Parents')) NOT NULL,
      is_duplicate BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Activity logs table - Updated for gift tracking actions
  ACTIVITY_LOGS_TABLE: `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'payment_received', 'duplicate_marked', 'duplicate_resolved')),
      old_amount_khr DECIMAL(12,2),
      new_amount_khr DECIMAL(12,2),
      old_amount_usd DECIMAL(10,2),
      new_amount_usd DECIMAL(10,2),
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guest_id) REFERENCES guestlist(guest_id) ON DELETE CASCADE
    )
  `,

  // Error logs table - Keep as is
  ERROR_LOGS_TABLE: `
    CREATE TABLE IF NOT EXISTS error_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      error_type TEXT NOT NULL,
      error_message TEXT NOT NULL,
      stack_trace TEXT,
      request_path TEXT,
      request_method TEXT,
      user_agent TEXT,
      ip_address TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      resolved BOOLEAN DEFAULT FALSE
    )
  `,

  // Indexes for performance - Updated for new schema
  INDEXES: [
    'CREATE INDEX IF NOT EXISTS idx_guestlist_name ON guestlist(name)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_guest_of ON guestlist(guest_of)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_payment_method ON guestlist(payment_method)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_is_duplicate ON guestlist(is_duplicate)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_amount_khr ON guestlist(amount_khr)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_amount_usd ON guestlist(amount_usd)',
    'CREATE INDEX IF NOT EXISTS idx_guestlist_created_at ON guestlist(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_guest_id ON activity_logs(guest_id)',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action)',
    'CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type)',
  ],

  // Triggers for updated_at and activity logging
  TRIGGERS: [
    `CREATE TRIGGER IF NOT EXISTS update_guestlist_timestamp 
     AFTER UPDATE ON guestlist
     FOR EACH ROW
     BEGIN
       UPDATE guestlist SET updated_at = CURRENT_TIMESTAMP WHERE guest_id = NEW.guest_id;
     END`,
     
    `CREATE TRIGGER IF NOT EXISTS log_guestlist_changes 
     AFTER UPDATE ON guestlist
     FOR EACH ROW
     WHEN OLD.amount_khr != NEW.amount_khr OR OLD.amount_usd != NEW.amount_usd
     BEGIN
       INSERT INTO activity_logs (guest_id, action, old_amount_khr, new_amount_khr, old_amount_usd, new_amount_usd, details)
       VALUES (NEW.guest_id, 'updated', OLD.amount_khr, NEW.amount_khr, OLD.amount_usd, NEW.amount_usd, 
               'Amount changed from KHR:' || OLD.amount_khr || '/USD:' || OLD.amount_usd || 
               ' to KHR:' || NEW.amount_khr || '/USD:' || NEW.amount_usd);
     END`,
  ],
};