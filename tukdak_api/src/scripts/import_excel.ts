import * as path from 'path';
import * as XLSX from 'xlsx';
import {DatabaseService} from '../database/database.service';
import {GuestRepository} from '../repositories/guest-repository';
import {CreateGuestRequest} from '../types/guest.types';

interface ExcelRow {
  Code?: string | number;
  Name?: string;
  Other?: string;
  Group?: string;
}

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    data: ExcelRow;
    error: string;
  }>;
  skippedRows: number;
}

class ExcelImporter {
  private guestRepository: GuestRepository;
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
    this.guestRepository = new GuestRepository();
  }

  /**
   * Map Excel column to GuestOf enum
   * Returns null for unrecognized or empty groups
   */
  private mapGuestOf(group: string | undefined): 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents' | 'Bride_Sibling' | 'Groom_Sibling' | null {
    if (!group || group.trim() === '') {
      return null; // Allow nullable group
    }

    const normalized = group.trim().toLowerCase();

    const mapping: Record<string, 'Bride' | 'Groom' | 'Bride_Parents' | 'Groom_Parents' | 'Bride_Sibling' | 'Groom_Sibling'> = {
      // Bride
      'bride': 'Bride',
      'bride list': 'Bride',
      'brides list': 'Bride',
      "bride's list": 'Bride',
      'b': 'Bride',

      // Groom
      'groom': 'Groom',
      'groom list': 'Groom',
      'grooms list': 'Groom',
      "groom's list": 'Groom',
      'g': 'Groom',

      // Bride Parents
      'bride parents': 'Bride_Parents',
      'bride_parents': 'Bride_Parents',
      "bride's parents": 'Bride_Parents',
      "bride's parents list": 'Bride_Parents',
      'bp': 'Bride_Parents',

      // Groom Parents
      'groom parents': 'Groom_Parents',
      'groom_parents': 'Groom_Parents',
      "groom's parents": 'Groom_Parents',
      "groom's parents list": 'Groom_Parents',
      'gp': 'Groom_Parents',

      // Bride Sibling
      'bride sibling': 'Bride_Sibling',
      'bride_sibling': 'Bride_Sibling',
      "bride's sibling": 'Bride_Sibling',
      "sibling's bride lists": 'Bride_Sibling',
      "bride's siblings": 'Bride_Sibling',
      'sister list': 'Bride_Sibling',
      'sister': 'Bride_Sibling',
      'bs': 'Bride_Sibling',

      // Groom Sibling
      'groom sibling': 'Groom_Sibling',
      'groom_sibling': 'Groom_Sibling',
      "groom's sibling": 'Groom_Sibling',
      "groom's siblings": 'Groom_Sibling',
      'brother list': 'Groom_Sibling',
      'brother': 'Groom_Sibling',
      'gs': 'Groom_Sibling',
    };

    const result = mapping[normalized];

    if (!result) {
      // Return null instead of throwing error for unrecognized groups
      console.warn(`⚠️  Unrecognized Group value: "${group}" - will use null`);
      return null;
    }

    return result;
  }

  /**
   * Validate and transform Excel row to CreateGuestRequest
   */
  private transformRow(row: ExcelRow, rowNumber: number): Omit<CreateGuestRequest, 'guest_id'> | null {
    // Skip empty rows (no name)
    if (!row.Name || row.Name.trim() === '') {
      console.log(`⏭️  Row ${rowNumber}: Skipping empty row`);
      return null;
    }

    // Map Excel columns to database fields
    const guestOf = this.mapGuestOf(row.Group);

    // If group is null, use 'Bride' as default or skip based on your preference
    return {
      english_name: row.Name.trim(),
      khmer_name: "N/A",
      guest_of: guestOf,
      amount_khr: 0,
      amount_usd: 0,
      payment_method: null,
    };
  }

  /**
   * Read Excel file and parse data
   */
  private readExcelFile(filePath: string): ExcelRow[] {
    console.log(`📖 Reading Excel file: ${filePath}`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      defval: undefined,
      blankrows: false,
    });

    console.log(`✅ Found ${data.length} rows in Excel file`);
    return data;
  }

  /**
   * Import guests from Excel file
   */
  async importFromExcel(filePath: string): Promise<ImportResult> {
    const result: ImportResult = {
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      skippedRows: 0,
      errors: [],
    };

    try {
      // Initialize database
      await this.dbService.initialize();
      console.log('✅ Database initialized');

      // Read Excel file
      const excelData = this.readExcelFile(filePath);
      result.totalRows = excelData.length;

      console.log(`\n🔄 Starting import of ${result.totalRows} guests...\n`);

      // Process each row
      for (let i = 0; i < excelData.length; i++) {
        const row = excelData[i];
        const rowNumber = i + 2; // +2 because Excel is 1-indexed and has header row

        try {
          // Transform and validate row
          const guestData = this.transformRow(row, rowNumber);

          // Skip null rows (empty rows)
          if (!guestData) {
            result.skippedRows++;
            continue;
          }

          // Create guest in database
          await this.guestRepository.createGuest(guestData);

          result.successCount++;
          console.log(`✅ Row ${rowNumber}: Created guest "${guestData.english_name}" (${guestData.guest_of})`);

        } catch (error) {
          result.errorCount++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          result.errors.push({
            row: rowNumber,
            data: row,
            error: errorMessage,
          });

          console.error(`❌ Row ${rowNumber}: ${errorMessage}`);
        }
      }

      // Print summary
      console.log('\n' + '='.repeat(50));
      console.log('📊 IMPORT SUMMARY');
      console.log('='.repeat(50));
      console.log(`Total Rows:     ${result.totalRows}`);
      console.log(`✅ Successful:  ${result.successCount}`);
      console.log(`⏭️  Skipped:     ${result.skippedRows}`);
      console.log(`❌ Failed:      ${result.errorCount}`);
      console.log('='.repeat(50));

      if (result.errors.length > 0) {
        console.log('\n❌ ERRORS:');
        result.errors.forEach(err => {
          console.log(`\nRow ${err.row}:`);
          console.log(`  Data: ${JSON.stringify(err.data)}`);
          console.log(`  Error: ${err.error}`);
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Fatal error during import:', error);
      throw error;
    } finally {
      // Close database connection
      await this.dbService.close();
      console.log('\n✅ Database connection closed');
    }
  }

  /**
   * Generate a sample Excel file for testing
   */
  async generateSampleExcel(outputPath: string): Promise<void> {
    const sampleData = [
      {
        Code: '',
        Name: 'John Doe',
        Other: 'ចន ដូ',
        Group: 'Bride',
      },
      {
        Code: '',
        Name: 'Jane Smith',
        Other: 'ជែន ស្មីធ',
        Group: "Groom's list",
      },
      {
        Code: '',
        Name: 'Bob Johnson',
        Other: 'បប ចនសុន',
        Group: 'Bride_Parents',
      },
      {
        Code: '',
        Name: 'Alice Williams',
        Other: 'អាលីស វីលៀម',
        Group: "Groom's parents list",
      },
      {
        Code: '',
        Name: 'Sarah Connor',
        Other: 'សារ៉ា កនណ័រ',
        Group: 'Sister list',
      },
      {
        Code: '',
        Name: 'Mike Ross',
        Other: 'ម៉ៃឃ រ៉ុស',
        Group: 'Brother list',
      },
      {
        Code: '',
        Name: 'Emma Watson',
        Other: 'អិមម៉ា វ៉ាតសុន',
        Group: "Sibling's bride lists",
      },
      {
        Code: '',
        Name: 'No Group Guest',
        Other: 'គ្មានក្រុម',
        Group: '', // Empty group - will default to Bride
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');

    XLSX.writeFile(workbook, outputPath);
    console.log(`✅ Sample Excel file created: ${outputPath}`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const importer = new ExcelImporter();

  if (args[0] === '--generate-sample') {
    const outputPath = args[1] || path.join(__dirname, '../../data/sample_guests.xlsx');
    await importer.generateSampleExcel(outputPath);
    return;
  }

  if (args.length === 0) {
    console.error('❌ Error: Please provide the Excel file path');
    console.log('\nUsage:');
    console.log('  npm run import:excel <file-path>');
    console.log('  npm run import:excel --generate-sample [output-path]');
    console.log('\nExample:');
    console.log('  npm run import:excel ./data/guests.xlsx');
    console.log('  npm run import:excel --generate-sample ./data/sample.xlsx');
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);

  try {
    await importer.importFromExcel(filePath);
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  void main();
}

export {ExcelImporter, ImportResult};
