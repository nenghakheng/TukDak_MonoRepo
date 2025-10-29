import {DatabaseService} from '../database/database.service';
import {Guest, ActivityLog, SearchResult} from '../types/database.types';
import {CheckInGuestRequest, CreateGuestRequest, SearchType, UpdateGuestRequest} from '../types/guest.types';
import {ValidationError, NotFoundError, ConflictError} from '../errors/custom-errors';

export class GuestRepository {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  private getDb() {
    return this.dbService.getConnection().getDatabase();
  }

  /**
   * Search for guests - Updated to match test expectations
   */
  async searchGuests(
    query: string, 
    searchType: SearchType, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<SearchResult> {
    const db = this.getDb();
    const startTime = performance.now();
    
    try {
      // Sanitize and validate input
      const sanitizedQuery = this.sanitizeSearchQuery(query);
      if (!sanitizedQuery || sanitizedQuery.length < 1) {
        return {
          guests: [],
          total_count: 0,
          search_time_ms: performance.now() - startTime,
          query_used: sanitizedQuery,
          search_type: searchType
        };
      }

      let sqlQuery: string;
      let params: any[];
      let countQuery: string;
      let countParams: any[];

      switch (searchType) {
        case 'guest_id':
          // Exact match, case-insensitive for guest_id
          sqlQuery = `
            SELECT guest_id, english_name, khmer_name, amount_khr, amount_usd, 
                   payment_method, guest_of, is_duplicate, created_at, updated_at
            FROM guestlist 
            WHERE LOWER(guest_id) = LOWER(?) 
              AND is_duplicate = 0
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
          `;
          params = [sanitizedQuery, limit, offset];
          
          countQuery = `
            SELECT COUNT(*) as count 
            FROM guestlist 
            WHERE LOWER(guest_id) = LOWER(?) 
              AND is_duplicate = 0
          `;
          countParams = [sanitizedQuery];
          break;

        case 'english_name':
          // Partial match, case-insensitive for English names
          sqlQuery = `
            SELECT guest_id, english_name, khmer_name, amount_khr, amount_usd, 
                   payment_method, guest_of, is_duplicate, created_at, updated_at
            FROM guestlist 
            WHERE LOWER(english_name) LIKE LOWER(?)
              AND is_duplicate = 0
            ORDER BY 
              CASE 
                WHEN LOWER(english_name) = LOWER(?) THEN 1
                WHEN LOWER(english_name) LIKE LOWER(?) THEN 2
                ELSE 3
              END,
              created_at DESC
            LIMIT ? OFFSET ?
          `;
          const likePattern = `%${sanitizedQuery}%`;
          params = [likePattern, sanitizedQuery, likePattern, limit, offset];
          
          countQuery = `
            SELECT COUNT(*) as count 
            FROM guestlist 
            WHERE (LOWER(english_name) LIKE LOWER(?))
              AND is_duplicate = 0
          `;
          countParams = [likePattern];
          break;

        case 'khmer_name':
          // Partial match for Khmer names
          sqlQuery = `
            SELECT guest_id, english_name, khmer_name, amount_khr, amount_usd, 
                   payment_method, guest_of, is_duplicate, created_at, updated_at
            FROM guestlist 
            WHERE (LOWER(khmer_name) LIKE LOWER(?))
              AND is_duplicate = 0
            ORDER BY 
              CASE 
                WHEN LOWER(khmer_name) = LOWER(?) THEN 1
                WHEN LOWER(khmer_name) LIKE LOWER(?) THEN 2
                ELSE 3
              END,
              created_at DESC
            LIMIT ? OFFSET ?
          `;
          const khmerLikePattern = `%${sanitizedQuery}%`;
           params = [khmerLikePattern, sanitizedQuery, khmerLikePattern, limit, offset];
          
          countQuery = `
            SELECT COUNT(*) as count 
            FROM guestlist 
            WHERE (LOWER(khmer_name) LIKE LOWER(?))
              AND is_duplicate = 0
          `;
          countParams = [khmerLikePattern];
          break;

        default:
          throw new ValidationError(`Invalid search type: ${searchType}`);
      }

      // Execute search query
      const guests = db.prepare(sqlQuery).all(...params) as any[];
      
      // Get total count
      const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
      const totalCount = countResult.count;

      // Convert and normalize the guests to match Guest type
      const normalizedGuests: Guest[] = guests.map(guest => ({
        guest_id: guest.guest_id,
        english_name: guest.english_name || null,
        khmer_name: guest.khmer_name || null,
        amount_khr: guest.amount_khr || 0,
        amount_usd: guest.amount_usd || 0,
        payment_method: guest.payment_method || null,
        guest_of: guest.guest_of,
        is_duplicate: Boolean(guest.is_duplicate),
        created_at: guest.created_at || new Date().toISOString(),
        updated_at: guest.updated_at || new Date().toISOString(),
      }));

      const searchTime = performance.now() - startTime;

      // Log search activity
      this.logSearchActivity(sanitizedQuery, searchType, totalCount, searchTime);

      return {
        guests: normalizedGuests,
        total_count: totalCount,
        search_time_ms: Math.round(searchTime * 100) / 100,
        query_used: sanitizedQuery,
        search_type: searchType
      };
      
    } catch (error) {
      this.logError('SEARCH_GUESTS_ERROR', error as Error, { 
        query: query, 
        searchType: searchType, 
        limit: limit, 
        offset: offset 
      });
      throw error;
    }
  }

  /**
   * Sanitize search query to prevent SQL injection and handle special characters
   */
  private sanitizeSearchQuery(query: string): string {
    if (typeof query !== 'string') {
      return '';
    }

    // Remove dangerous characters and normalize
    let sanitized = query
      .trim()
      .replace(/['"`;\\]/g, '') // Remove SQL injection characters
      .replace(/[%_]/g, '\\$&')  // Escape LIKE wildcards
      .substring(0, 100);        // Limit query length

    return sanitized;
  }

  /**
   * Log search activity for analytics and monitoring
   */
  private logSearchActivity(query: string, searchType: SearchType, resultCount: number, searchTimeMs: number): void {
    const db = this.getDb();
    
    try {
      const insertActivity = db.prepare(`
        INSERT INTO activity_logs (guest_id, action, details) 
        VALUES (?, ?, ?)
      `);

      const searchDetails = JSON.stringify({
        query: query,
        search_type: searchType,
        result_count: resultCount,
        search_time_ms: searchTimeMs,
        timestamp: new Date().toISOString()
      });

      insertActivity.run(
        'SEARCH', // Use 'SEARCH' as guest_id for search activities
        'searched',
        `Search: ${searchType} - "${query}" - ${resultCount} results (${searchTimeMs.toFixed(2)}ms)`
      );
    } catch (error) {
      console.error('Failed to log search activity:', error);
    }
  }

  async createGuest(guestData: CreateGuestRequest): Promise<Guest> {
    const db = this.getDb();
    
    try {
      // Check for duplicate guest_id
      const existingGuest = db.prepare('SELECT guest_id FROM guestlist WHERE guest_id = ?').get(guestData.guest_id);
      if (existingGuest) {
        throw new ConflictError(`Guest with ID ${guestData.guest_id} already exists`);
      }

      // Convert CreateGuestRequest to Guest format with defaults
      const guestToInsert: Omit<Guest, 'created_at' | 'updated_at'> = {
        guest_id: guestData.guest_id,
        english_name: guestData.english_name,
        khmer_name: guestData.khmer_name,
        amount_khr: guestData.amount_khr || 0,
        amount_usd: guestData.amount_usd || 0,
        payment_method: guestData.payment_method || null,
        guest_of: guestData.guest_of,
        is_duplicate: false,
      };

      // Insert guest with timestamps
      const insertGuest = db.prepare(`
        INSERT INTO guestlist 
        (guest_id, english_name, khmer_name, amount_khr, amount_usd, payment_method, guest_of, is_duplicate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertActivity = db.prepare(`
        INSERT INTO activity_logs (guest_id, action, details) 
        VALUES (?, ?, ?)
      `);

      const transaction = db.transaction(() => {
        // Insert guest
        const result = insertGuest.run(
          guestToInsert.guest_id,
          guestToInsert.english_name,
          guestToInsert.khmer_name,
          guestToInsert.amount_khr,
          guestToInsert.amount_usd,
          guestToInsert.payment_method,
          guestToInsert.guest_of,
          guestToInsert.is_duplicate ? 1 : 0
        );

        // Log activity
        insertActivity.run(
          guestToInsert.guest_id,
          'created',
          `Guest created: ${guestToInsert.english_name} (${guestToInsert.guest_of})`
        );

        // If payment provided, log payment activity
        if (guestToInsert.amount_khr > 0 || guestToInsert.amount_usd > 0) {
          insertActivity.run(
            guestToInsert.guest_id,
            'payment_received',
            `Initial payment: ${guestToInsert.amount_khr} KHR / ${guestToInsert.amount_usd} USD`
          );
        }
      });

      transaction();

      // Return the created guest
      return this.getGuestById(guestToInsert.guest_id);
      
    } catch (error) {
      this.logError('CREATE_GUEST_ERROR', error as Error, {guest_id: guestData.guest_id});
      throw error;
    }
  }

  async getGuestById(guestId: string): Promise<Guest> {
    const db = this.getDb();
    
    try {
      const guest = db.prepare(`
        SELECT guest_id, khmer_name, english_name, amount_khr, amount_usd, payment_method, 
               guest_of, is_duplicate, created_at, updated_at
        FROM guestlist 
        WHERE guest_id = ?
      `).get(guestId) as Guest | undefined;

      if (!guest) {
        throw new NotFoundError('Guest', guestId);
      }

      // Convert integer back to boolean for is_duplicate
      guest.is_duplicate = Boolean(guest.is_duplicate);

      return guest;
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logError('GET_GUEST_ERROR', error as Error, {guest_id: guestId});
      throw error;
    }
  }

  async getAllGuests(filters?: {
    guest_of?: string;
    payment_method?: string;
    has_payment?: boolean;
    is_duplicate?: boolean;
  }): Promise<Guest[]> {
    const db = this.getDb();
    
    try {
      let query = `
        SELECT guest_id, khmer_name, english_name, amount_khr, amount_usd, payment_method, 
               guest_of, is_duplicate, created_at, updated_at
        FROM guestlist 
        WHERE 1=1
      `;
      const params: any[] = [];

      // Apply filters
      if (filters?.guest_of) {
        query += ' AND guest_of = ?';
        params.push(filters.guest_of);
      }

      if (filters?.payment_method) {
        query += ' AND payment_method = ?';
        params.push(filters.payment_method);
      }

      if (filters?.has_payment !== undefined) {
        if (filters.has_payment) {
          query += ' AND (amount_khr > 0 OR amount_usd > 0)';
        } else {
          query += ' AND (amount_khr = 0 AND amount_usd = 0)';
        }
      }

      if (filters?.is_duplicate !== undefined) {
        query += ' AND is_duplicate = ?';
        params.push(filters.is_duplicate ? 1 : 0);
      }

      query += ' ORDER BY created_at DESC';

      const guests = db.prepare(query).all(...params) as Guest[];

      // Convert integer back to boolean for is_duplicate
      return guests.map(guest => ({
        ...guest,
        is_duplicate: Boolean(guest.is_duplicate)
      }));
      
    } catch (error) {
      this.logError('GET_ALL_GUESTS_ERROR', error as Error);
      throw error;
    }
  }

  async updateGuest(guestId: string, updates: UpdateGuestRequest): Promise<Guest> {
    const db = this.getDb();
    
    try {
      // Get current guest data for logging
      const currentGuest = await this.getGuestById(guestId);

      // Build dynamic update query
      const allowedFields = ['name', 'amount_khr', 'amount_usd', 'payment_method', 'is_duplicate'];
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key as keyof UpdateGuestRequest] !== undefined) {
          updateFields.push(`${key} = ?`);
          let value = updates[key as keyof UpdateGuestRequest];
          
          // Convert boolean to integer for is_duplicate
          if (key === 'is_duplicate' && typeof value === 'boolean') {
            value = value ? 1 : 0;
          }
          
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        throw new ValidationError('No valid fields provided for update');
      }

      // Add updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(guestId); // For WHERE clause

      const updateGuest = db.prepare(`
        UPDATE guestlist 
        SET ${updateFields.join(', ')} 
        WHERE guest_id = ?
      `);

      const insertActivity = db.prepare(`
        INSERT INTO activity_logs (guest_id, action, old_amount_khr, new_amount_khr, 
                                 old_amount_usd, new_amount_usd, details) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction(() => {
        const result = updateGuest.run(...params);
        
        if (result.changes === 0) {
          throw new NotFoundError('Guest', guestId);
        }

        // Log the update activity with detailed changes
        const changedFields: string[] = [];
        Object.keys(updates).forEach(key => {
          if (updates[key as keyof UpdateGuestRequest] !== currentGuest[key as keyof Guest]) {
            changedFields.push(`${key}: ${currentGuest[key as keyof Guest]} → ${updates[key as keyof UpdateGuestRequest]}`);
          }
        });

        insertActivity.run(
          guestId,
          'updated',
          updates.amount_khr !== undefined ? currentGuest.amount_khr : null,
          updates.amount_khr !== undefined ? updates.amount_khr : null,
          updates.amount_usd !== undefined ? currentGuest.amount_usd : null,
          updates.amount_usd !== undefined ? updates.amount_usd : null,
          `Guest updated: ${changedFields.join(', ')}`
        );
      });

      transaction();

      // Return updated guest
      return this.getGuestById(guestId);
      
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logError('UPDATE_GUEST_ERROR', error as Error, {guest_id: guestId});
      throw error;
    }
  }

  /**
   * Check-in guest with payment information
   */
  async checkInGuest(
    guestId: string, 
    paymentData: CheckInGuestRequest,
  ): Promise<Guest> {
    const db = this.getDb();
    
    try {
      // Get current guest data
      const currentGuest = await this.getGuestById(guestId);

      // Validate payment data
      if (!paymentData.payment_method) {
        throw new ValidationError('Payment method is required for check-in');
      }

      if (!paymentData.amount_khr && !paymentData.amount_usd) {
        throw new ValidationError('At least one payment amount (KHR or USD) is required');
      }

      if (paymentData.amount_khr !== undefined && paymentData.amount_khr < 0) {
        throw new ValidationError('Amount KHR cannot be negative');
      }

      if (paymentData.amount_usd !== undefined && paymentData.amount_usd < 0) {
        throw new ValidationError('Amount USD cannot be negative');
      }

      // Check if guest already checked in (has payment)
      const alreadyCheckedIn = currentGuest.amount_khr > 0 || currentGuest.amount_usd > 0;
      
      const amount_khr = paymentData.amount_khr || 0;
      const amount_usd = paymentData.amount_usd || 0;

      // Update guest with payment information
      const updateGuest = db.prepare(`
        UPDATE guestlist 
        SET amount_khr = ?,
            amount_usd = ?,
            payment_method = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE guest_id = ?
      `);

      const insertActivity = db.prepare(`
        INSERT INTO activity_logs (guest_id, action, old_amount_khr, new_amount_khr, 
                                old_amount_usd, new_amount_usd, details) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = db.transaction(() => {
        const result = updateGuest.run(
          amount_khr,
          amount_usd,
          paymentData.payment_method,
          guestId
        );
        
        if (result.changes === 0) {
          throw new NotFoundError('Guest', guestId);
        }

        // Log check-in activity
        const action = alreadyCheckedIn ? 'payment_updated' : 'checked_in';
        const details = alreadyCheckedIn 
          ? `Payment updated: ${amount_khr} KHR / ${amount_usd} USD via ${paymentData.payment_method}`
          : `Guest checked in: ${amount_khr} KHR / ${amount_usd} USD via ${paymentData.payment_method}`;

        insertActivity.run(
          guestId,
          action,
          currentGuest.amount_khr,
          amount_khr,
          currentGuest.amount_usd,
          amount_usd,
          details
        );
      });

      transaction();

      // Return updated guest
      return this.getGuestById(guestId);
      
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      this.logError('CHECK_IN_GUEST_ERROR', error as Error, {
        guest_id: guestId,
        payment_data: paymentData
      });
      throw error;
    }
  }

  async deleteGuest(guestId: string, softDelete: boolean = true): Promise<boolean> {
    const db = this.getDb();
    
    try {
      // Check if guest exists
      const existingGuest = await this.getGuestById(guestId);

      const insertActivity = db.prepare(`
        INSERT INTO activity_logs (guest_id, action, details) 
        VALUES (?, ?, ?)
      `);

      if (softDelete) {
        // Soft delete: mark as duplicate/inactive
        const softDeleteGuest = db.prepare(`
          UPDATE guestlist 
          SET is_duplicate = 1, updated_at = CURRENT_TIMESTAMP 
          WHERE guest_id = ?
        `);

        const transaction = db.transaction(() => {
          const result = softDeleteGuest.run(guestId);
          
          if (result.changes === 0) {
            throw new NotFoundError('Guest', guestId);
          }

          // Log soft delete
          insertActivity.run(guestId, 'deleted', `Guest soft deleted: ${existingGuest.english_name}`);
        });

        transaction();
      } else {
        // Hard delete: remove from database
        const hardDeleteGuest = db.prepare('DELETE FROM guestlist WHERE guest_id = ?');

        const transaction = db.transaction(() => {
          // Log before deletion (activities will be cascade deleted)
          insertActivity.run(guestId, 'deleted', `Guest hard deleted: ${existingGuest.english_name}`);
          
          const result = hardDeleteGuest.run(guestId);
          
          if (result.changes === 0) {
            throw new NotFoundError('Guest', guestId);
          }
        });

        transaction();
      }

      return true;
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logError('DELETE_GUEST_ERROR', error as Error, {guest_id: guestId});
      throw error;
    }
  }

  async getGuestStatistics(): Promise<{
    total_guests: number;
    total_khr: number;
    total_usd: number;
    paid_guests: number;
    pending_guests: number;
    duplicates: number;
    payment_methods: {qr_code: number; cash: number; pending: number};
    guest_distribution: {bride: number; groom: number; bride_parents: number; groom_parents: number};
  }> {
    const db = this.getDb();
    
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_guests,
          SUM(amount_khr) as total_khr,
          SUM(amount_usd) as total_usd,
          COUNT(CASE WHEN amount_khr > 0 OR amount_usd > 0 THEN 1 END) as paid_guests,
          COUNT(CASE WHEN (amount_khr = 0 AND amount_usd = 0) OR (amount_khr IS NULL AND amount_usd IS NULL) THEN 1 END) as pending_guests,
          COUNT(CASE WHEN is_duplicate = 1 THEN 1 END) as duplicates,
          COUNT(CASE WHEN payment_method = 'QR_Code' THEN 1 END) as qr_code,
          COUNT(CASE WHEN payment_method = 'Cash' THEN 1 END) as cash,
          COUNT(CASE WHEN payment_method IS NULL THEN 1 END) as pending_payment,
          COUNT(CASE WHEN guest_of = 'Bride' THEN 1 END) as bride,
          COUNT(CASE WHEN guest_of = 'Groom' THEN 1 END) as groom,
          COUNT(CASE WHEN guest_of = 'Bride_Parents' THEN 1 END) as bride_parents,
          COUNT(CASE WHEN guest_of = 'Groom_Parents' THEN 1 END) as groom_parents
        FROM guestlist
        WHERE is_duplicate = 0
      `).get() as any;

      return {
        total_guests: stats.total_guests || 0,
        total_khr: stats.total_khr || 0,
        total_usd: stats.total_usd || 0,
        paid_guests: stats.paid_guests || 0,
        pending_guests: stats.pending_guests || 0,
        duplicates: stats.duplicates || 0,
        payment_methods: {
          qr_code: stats.qr_code || 0,
          cash: stats.cash || 0,
          pending: stats.pending_payment || 0,
        },
        guest_distribution: {
          bride: stats.bride || 0,
          groom: stats.groom || 0,
          bride_parents: stats.bride_parents || 0,
          groom_parents: stats.groom_parents || 0,
        },
      };
      
    } catch (error) {
      this.logError('GET_STATISTICS_ERROR', error as Error);
      throw error;
    }
  }

  private logError(errorType: string, error: Error, context?: any): void {
    const db = this.getDb();
    
    try {
      const insertError = db.prepare(`
        INSERT INTO error_logs (error_type, error_message, stack_trace, timestamp) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);

      insertError.run(
        errorType,
        `${error.message} ${context ? `Context: ${JSON.stringify(context)}` : ''}`,
        error.stack || ''
      );
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
      console.error('Original error:', error);
    }
  }
}