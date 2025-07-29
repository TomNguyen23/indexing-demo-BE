import Database from 'better-sqlite3';
import path from 'path';

// Database configuration
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'petstore.db');
const DB: Database.Database = new Database(DB_PATH);

// Enable WAL mode for better performance
DB.pragma('journal_mode = WAL');

// Create tables
DB.exec(`
  CREATE TABLE IF NOT EXISTS pet_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop TEXT NOT NULL,
    buyer TEXT NOT NULL,
    pet_name TEXT NOT NULL,
    signature TEXT UNIQUE NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

// Interface for pet event data
export interface PetEventData {
  shop: string;
  buyer: string;
  pet_name: string;
  signature: string;
  timestamp: Date;
}

// Interface for shop statistics
export interface ShopStats {
  pet_name: string;
  sold_count: number;
}

// Interface for pet event with ID
export interface PetEventWithId extends PetEventData {
  id: number;
  created_at: string;
}

/**
 * Store a new pet purchase event
 */
export const storeEvent = (event: PetEventData): void => {
  try {
    const stmt = DB.prepare(`
      INSERT OR IGNORE INTO pet_events (shop, buyer, pet_name, signature, timestamp)
      VALUES (@shop, @buyer, @pet_name, @signature, @timestamp)
    `);
    
    const result = stmt.run({
      shop: event.shop,
      buyer: event.buyer,
      pet_name: event.pet_name,
      signature: event.signature,
      timestamp: event.timestamp.toISOString()
    });
    
    if (result.changes > 0) {
      console.log(`Stored event with ID: ${result.lastInsertRowid}`);
    } else {
      console.log(`Event with signature ${event.signature} already exists`);
    }
  } catch (error) {
    console.error('Error storing event:', error);
    throw error;
  }
};

/**
 * Get shop statistics (pet sales count by pet name)
 */
export const getShopStats = (shop: string): ShopStats[] => {
  try {
    const stmt = DB.prepare(`
      SELECT pet_name, COUNT(*) as sold_count
      FROM pet_events
      WHERE shop = ?
      GROUP BY pet_name
      ORDER BY sold_count DESC
    `);
    
    return stmt.all(shop) as ShopStats[];
  } catch (error) {
    console.error('Error getting shop stats:', error);
    throw error;
  }
};

// Export database instance for advanced operations
export { DB };