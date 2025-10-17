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
    (guest_id, name, english_name, khmer_name, amount_khr, amount_usd, payment_method, guest_of, is_duplicate) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertActivity = db.prepare(`
    INSERT INTO activity_logs (guest_id, action, details) 
    VALUES (?, ?, ?)
  `);

  // Enhanced sample data with proper English and Khmer names
  const sampleGuests = [
    ['G001', 'Sok Pisey', 'Sok Pisey', 'សុខ ពិសី', 500000.00, 125.00, 'QR_Code', 'Bride', 0],
    ['G002', 'Chan Dara', 'Chan Dara', 'ច័ន្ទ ដារា', 200000.00, 50.00, 'Cash', 'Groom', 0],
    ['G003', 'Lim Sophea', 'Lim Sophea', 'លឹម សុភា', 1000000.00, 250.00, 'QR_Code', 'Bride_Parents', 0],
    ['G004', 'Pov Samnang', 'Pov Samnang', 'ពៅ សំណាង', 300000.00, 75.00, 'Cash', 'Groom_Parents', 0],
    ['G005', 'Keo Malika', 'Keo Malika', 'កែវ ម៉ាលីកា', 400000.00, 100.00, 'QR_Code', 'Bride', 0],
    ['G006', 'Heng Rithea', 'Heng Rithea', 'ហេង រិទ្ធា', 0.00, 0.00, null, 'Groom', 0],
    ['G007', 'Sok Pisey Duplicate', 'Sok Pisey', 'សុខ ពិសី', 300000.00, 75.00, 'Cash', 'Bride', 1],
    ['G008', 'John Smith', 'John Smith', 'ចន ស្មីត', 200000.00, 50.00, 'QR_Code', 'Groom', 0],
    ['G009', 'Mary Johnson', 'Mary Johnson', 'ម៉ារី ចនសុន', 150000.00, 37.50, 'Cash', 'Bride', 0],
    ['G010', 'David Wilson', 'David Wilson', 'ដាវីត វីលសុន', 0.00, 0.00, null, 'Groom_Parents', 0],
  ];

  const transaction = db.transaction(() => {
    sampleGuests.forEach((guest) => {
      try {
        const result = insertGuest.run(...guest);
        const guestId = guest[0] as string;
        
        // Log the creation
        insertActivity.run(guestId, 'created', 'Sample guest created during initialization');
        
        // If they have given money, log the payment
        const amountKhr = guest[4] as number;
        const amountUsd = guest[5] as number;
        const isDuplicate = guest[8] as number;
        const paymentMethod = guest[6] as string | null;
        
        if (amountKhr > 0 || amountUsd > 0) {
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
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export {initializeDatabase};