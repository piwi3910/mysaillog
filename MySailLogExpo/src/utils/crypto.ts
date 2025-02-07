import * as Crypto from 'expo-crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hash a password using SHA-256
 * In a production app, you would want to use a proper password hashing algorithm like bcrypt,
 * but for this demo we'll use SHA-256 since it's readily available in Expo
 */
export async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Generate a random string of specified length
 */
export async function generateRandomString(length: number): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(new Uint8Array(randomBytes))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

/**
 * Generate a secure token (useful for reset password tokens, session tokens, etc.)
 */
export async function generateToken(): Promise<string> {
  return generateRandomString(32);
}

/**
 * Hash a string using SHA-256 (useful for general purpose hashing)
 */
export async function hashString(str: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    str
  );
  return hash;
}

/**
 * Generate a unique ID (useful for entities like vessels, trips, etc.)
 */
export function generateId(): string {
  return uuidv4();
}