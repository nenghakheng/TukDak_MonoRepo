import {DatabaseService} from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Ensure data directory exists with correct permissions
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
      console.log('📁 Created data directory');
    }

    // Initialize database service
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // Perform health check
    const health = await dbService.healthCheck();
    console.log('🏥 Database health check:', health);

    if (health.connected && health.tablesExist) {
      console.log('✅ Database initialization completed successfully!');
      
      // Insert sample data if tables are empty
      const db = dbService.getConnection().getDatabase();
      const guestCount = db.prepare('SELECT COUNT(*) as count FROM guestlist').get() as {count: number};
      
      if (guestCount.count === 0) {
        console.log('📝 Inserting sample data...');
        await insertSampleData(db);
      }
    } else {
      throw new Error('Database initialization failed - health check failed');
    }

    await dbService.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function insertSampleData(db: any) {
  const insertGuest = db.prepare(`
    INSERT INTO guestlist 
    (guest_id, name, amount_khr, amount_usd, payment_method, guest_of, is_duplicate) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activity_logs (guest_id, action, details) 
    VALUES (?, ?, ?)
  `);

  // Fixed: Convert boolean to integer (0 for false, 1 for true)
  const sampleGuests = [
    ['G001', 'Sok Pisey', 500000.00, 125.00, 'QR_Code', 'Bride', 0],        // 0 = false
    ['G002', 'Chan Dara', 200000.00, 50.00, 'Cash', 'Groom', 0],            // 0 = false
    ['G003', 'Lim Sophea', 1000000.00, 250.00, 'QR_Code', 'Bride_Parents', 0], // 0 = false
    ['G004', 'Pov Samnang', 300000.00, 75.00, 'Cash', 'Groom_Parents', 0],  // 0 = false
    ['G005', 'Keo Malika', 400000.00, 100.00, 'QR_Code', 'Bride', 0],       // 0 = false
    ['G006', 'Heng Rithea', 0.00, 0.00, 'QR_Code', 'Groom', 0],                  // 0 = false
    // Add a duplicate example
    ['G007', 'Sok Pisey', 300000.00, 75.00, 'Cash', 'Bride', 1],            // 1 = true (duplicate)
  ];

  const transaction = db.transaction(() => {
    sampleGuests.forEach((guest) => {
      try {
        const result = insertGuest.run(...guest);
        const guestId = guest[0] as string; // guest_id is the first element
        
        // Log the creation
        insertActivity.run(guestId, 'created', 'Sample guest created during initialization');
        
        // If they have given money, log the payment
        const amountKhr = guest[2] as number;
        const amountUsd = guest[3] as number;
        const isDuplicate = guest[6] as number; // 0 or 1
        
        if (amountKhr > 0 || amountUsd > 0) {
          const paymentMethod = guest[4] as string;
          insertActivity.run(
            guestId, 
            'payment_received', 
            `Payment received: ${amountKhr} KHR / ${amountUsd} USD via ${paymentMethod}`
          );
        }
        
        // If marked as duplicate, log it
        if (isDuplicate === 1) {
          insertActivity.run(
            guestId, 
            'duplicate_marked', 
            'Guest marked as potential duplicate during initialization'
          );
        }
      } catch (error) {
        console.error(`Failed to insert guest ${guest[0]}:`, error);
        throw error;
      }
    });
  });

  transaction();
  console.log('✅ Sample data inserted successfully');
  
  // Display summary
  const summary = db.prepare(`
    SELECT 
      COUNT(*) as total_guests,
      SUM(amount_khr) as total_khr,
      SUM(amount_usd) as total_usd,
      COUNT(CASE WHEN amount_khr > 0 OR amount_usd > 0 THEN 1 END) as paid_guests,
      COUNT(CASE WHEN payment_method = 'QR_Code' THEN 1 END) as qr_payments,
      COUNT(CASE WHEN payment_method = 'Cash' THEN 1 END) as cash_payments,
      COUNT(CASE WHEN is_duplicate = 1 THEN 1 END) as duplicates
    FROM guestlist
  `).get();
  
  console.log('📊 Sample data summary:', summary);
  
  // Show individual guests
  const guests = db.prepare(`
    SELECT guest_id, name, amount_khr, amount_usd, payment_method, guest_of, 
           CASE WHEN is_duplicate = 1 THEN 'Yes' ELSE 'No' END as is_duplicate
    FROM guestlist 
    ORDER BY guest_id
  `).all();
  
  console.log('👥 Inserted guests:');
  console.table(guests);
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export {initializeDatabase};