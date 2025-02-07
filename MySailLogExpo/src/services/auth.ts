import { User } from '../models/types';
import { query, queryOne, execute, sqlValue, buildSet } from './database';
import { generateId } from '../utils/crypto';
import * as SecureStore from 'expo-secure-store';

export interface AuthResponse {
  user: User;
  token: string;
}

const USER_TOKEN_KEY = 'user_auth_token';
const USER_DATA_KEY = 'user_data';

export async function initializeAuthTable(): Promise<void> {
  const createTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `;

  try {
    await execute(createTable);
    await execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  } catch (error) {
    throw new Error(`Failed to initialize auth table: ${error}`);
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await queryOne<User>(
      `SELECT * FROM users WHERE email = ${sqlValue(email)}`
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    const id = generateId();
    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);

    const user: User = {
      id,
      email,
      name,
      createdAt: now,
    };

    const insertData = {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    const fields = Object.keys(insertData);
    const placeholders = fields.map(field => sqlValue(insertData[field as keyof typeof insertData]));
    const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    await execute(sql);

    const token = generateAuthToken(user);
    await saveAuthData(token, user);

    return { user, token };
  } catch (error) {
    throw new Error(`Failed to register user: ${error}`);
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const sql = `
      SELECT id, email, name, passwordHash, createdAt
      FROM users
      WHERE email = ${sqlValue(email)}
    `;

    const userData = await queryOne<User & { passwordHash: string }>(sql);
    if (!userData) {
      throw new Error('Invalid email or password');
    }

    const isValid = await verifyPassword(password, userData.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const { passwordHash, ...user } = userData;
    const token = generateAuthToken(user);
    await saveAuthData(token, user);

    return { user, token };
  } catch (error) {
    throw new Error(`Failed to login: ${error}`);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    throw new Error(`Failed to logout: ${error}`);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const sql = `UPDATE users SET ${buildSet(updateData)} WHERE id = ${sqlValue(userId)}`;
    await execute(sql);

    const user = await queryOne<User>(`SELECT id, email, name, createdAt FROM users WHERE id = ${sqlValue(userId)}`);
    if (!user) {
      throw new Error('User not found after update');
    }

    // Update stored user data
    const token = await SecureStore.getItemAsync(USER_TOKEN_KEY);
    if (token) {
      await saveAuthData(token, user);
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to update user: ${error}`);
  }
}

// Helper functions

async function hashPassword(password: string): Promise<string> {
  // In a real app, use a proper password hashing library
  // This is just a placeholder
  return password;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In a real app, use a proper password verification
  // This is just a placeholder
  return password === hash;
}

function generateAuthToken(user: User): string {
  // In a real app, generate a proper JWT or other token
  // This is just a placeholder
  return `token_${user.id}`;
}

async function saveAuthData(token: string, user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
}