import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbSetup = async () => {
  const db = await open({
    filename: path.resolve(__dirname, '../data/mysaillog.db'),
    driver: sqlite3.Database
  });

  // Create tables based on schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created DATETIME DEFAULT CURRENT_TIMESTAMP,
      settings TEXT
    );

    CREATE TABLE IF NOT EXISTS vessels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      length REAL,
      registration_number TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      last_maintenance DATETIME,
      notes TEXT,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      start_location TEXT NOT NULL,
      end_location TEXT,
      crew_members TEXT,
      engine_hours REAL,
      fuel_usage REAL,
      notes TEXT,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id)
    );

    CREATE TABLE IF NOT EXISTS weather_data (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      temperature REAL,
      wind_speed REAL,
      wind_direction REAL,
      pressure REAL,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );

    CREATE TABLE IF NOT EXISTS route_points (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      speed REAL,
      heading REAL,
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );
  `);

  return db;
};

// Basic routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Ensure data directory exists
    await new Promise<void>((resolve, reject) => {
      const dataDir = path.resolve(__dirname, '../data');
      require('fs').mkdir(dataDir, { recursive: true }, (err: any) => {
        if (err && err.code !== 'EEXIST') reject(err);
        else resolve();
      });
    });

    const db = await dbSetup();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;