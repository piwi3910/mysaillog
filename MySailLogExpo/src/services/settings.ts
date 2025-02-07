import { UserSettings } from '../models/types';
import { query, queryOne, execute, sqlValue, buildSet } from './database';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  units: {
    distance: 'nm',
    speed: 'kts',
    temperature: 'C',
    pressure: 'hPa',
    windSpeed: 'kts',
  },
  notifications: {
    enabled: true,
    weatherAlerts: true,
    tripReminders: true,
  },
  sync: {
    autoBackup: true,
    backupFrequency: 'daily',
  },
  privacy: {
    shareLocation: true,
    shareWeather: true,
    publicProfile: false,
  },
  display: {
    showGrid: true,
    compactView: false,
    dateFormat: 'local',
    timeFormat: '24h',
  },
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const sql = `SELECT settings FROM user_settings WHERE userId = ${sqlValue(userId)}`;
    const result = await queryOne<{ settings: string }>(sql);
    
    if (!result) {
      // If no settings exist, create default settings
      await createUserSettings(userId, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }

    const settings = JSON.parse(result.settings);
    // Ensure all required fields are present by merging with defaults
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      units: {
        ...DEFAULT_SETTINGS.units,
        ...settings.units,
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...settings.notifications,
      },
      sync: {
        ...DEFAULT_SETTINGS.sync,
        ...settings.sync,
      },
      privacy: {
        ...DEFAULT_SETTINGS.privacy,
        ...settings.privacy,
      },
      display: {
        ...DEFAULT_SETTINGS.display,
        ...settings.display,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get user settings: ${error}`);
  }
}

export async function createUserSettings(
  userId: string,
  settings: UserSettings = DEFAULT_SETTINGS
): Promise<void> {
  try {
    const insertData = {
      userId,
      settings: JSON.stringify(settings),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const fields = Object.keys(insertData);
    const placeholders = fields.map(field => sqlValue(insertData[field as keyof typeof insertData]));
    const sql = `INSERT INTO user_settings (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    await execute(sql);
  } catch (error) {
    throw new Error(`Failed to create user settings: ${error}`);
  }
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  try {
    // Get current settings
    const currentSettings = await getUserSettings(userId);
    
    // Merge updates with current settings
    const newSettings = {
      ...currentSettings,
      ...updates,
      units: {
        ...currentSettings.units,
        ...(updates.units || {}),
      },
      notifications: {
        ...currentSettings.notifications,
        ...(updates.notifications || {}),
      },
      sync: {
        ...currentSettings.sync,
        ...(updates.sync || {}),
      },
      privacy: {
        ...currentSettings.privacy,
        ...(updates.privacy || {}),
      },
      display: {
        ...currentSettings.display,
        ...(updates.display || {}),
      },
    };

    const updateData = {
      settings: JSON.stringify(newSettings),
      updatedAt: new Date().toISOString(),
    };

    const sql = `UPDATE user_settings SET ${buildSet(updateData)} WHERE userId = ${sqlValue(userId)}`;
    await execute(sql);

    return newSettings;
  } catch (error) {
    throw new Error(`Failed to update user settings: ${error}`);
  }
}

// Initialize the user_settings table
export async function initializeSettingsTable(): Promise<void> {
  const createTable = `
    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY NOT NULL,
      settings TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `;

  try {
    await execute(createTable);
  } catch (error) {
    throw new Error(`Failed to initialize settings table: ${error}`);
  }
}