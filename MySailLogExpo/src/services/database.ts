import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Custom type definitions for SQLite
export interface DatabaseRow {
  [key: string]: any;
}

export interface SQLResultSet {
  insertId: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (index: number) => DatabaseRow;
    _array: DatabaseRow[];
  };
}

export interface SQLError {
  code: number;
  message: string;
}

export type SQLStatement = {
  sql: string;
  args?: unknown[];
};

// Use the correct method to open the database
const db = SQLite.openDatabaseSync('mysaillog.db');

const SCHEMA_VERSION = 1;

const createTables = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    vesselId TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    distance REAL,
    duration INTEGER,
    notes TEXT,
    startLocation TEXT,
    endLocation TEXT,
    waypoints TEXT NOT NULL,
    weatherRecords TEXT NOT NULL,
    crewMembers TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vessels (
    id TEXT PRIMARY KEY NOT NULL,
    ownerId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    length REAL NOT NULL,
    homePort TEXT,
    registrationNumber TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    userId TEXT PRIMARY KEY NOT NULL,
    settings TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_trips_owner ON trips(ownerId);
  CREATE INDEX IF NOT EXISTS idx_trips_vessel ON trips(vesselId);
  CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
  CREATE INDEX IF NOT EXISTS idx_vessels_owner ON vessels(ownerId);
`;

// Database query methods
export async function query<T = any>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    try {
      db.execAsync(sql);
      resolve([]);
    } catch (error) {
      reject(new Error(`Query failed: ${error}`));
    }
  });
}

export async function queryOne<T = any>(sql: string): Promise<T | null> {
  const results = await query<T>(sql);
  return results[0] || null;
}

export async function execute(sql: string): Promise<void> {
  try {
    await db.execAsync(sql);
  } catch (error) {
    throw new Error(`Execute failed: ${error}`);
  }
}

export async function executeBatch(statements: string[]): Promise<void> {
  for (const sql of statements) {
    await execute(sql);
  }
}

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') {
    console.warn('SQLite is not supported on web platform');
    return;
  }

  const statements = createTables
    .split(';')
    .map((sql) => sql.trim())
    .filter((sql) => sql.length > 0);

  await executeBatch(statements);

  // Initialize schema version
  await execute(
    `INSERT OR REPLACE INTO schema_version (version) VALUES (${SCHEMA_VERSION})`
  );
}

export async function enableForeignKeys(): Promise<void> {
  await execute('PRAGMA foreign_keys = ON');
}

export async function initializeDatabaseAsync(): Promise<void> {
  try {
    // Enable foreign keys first
    await enableForeignKeys();

    // Initialize database schema
    await initDatabase();

    // Add any additional initialization steps here
    // For example, creating default settings for existing users

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Helper function to format SQL values
export function sqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  }
  return String(value);
}

// Helper function to build WHERE clause
export function buildWhere(conditions: Record<string, any>): string {
  const clauses = Object.entries(conditions)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key} = ${sqlValue(value)}`);
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
}

// Helper function to build SET clause
export function buildSet(values: Record<string, any>): string {
  return Object.entries(values)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key} = ${sqlValue(value)}`)
    .join(', ');
}

// Export the database instance
export { db as database };
export type Database = typeof db;