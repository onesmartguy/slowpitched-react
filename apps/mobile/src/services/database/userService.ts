/**
 * User Service
 * Phase 6: Multi-user support with authentication
 */

import { getDatabase } from './index';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt: number;
  updatedAt: number;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create users table schema
 */
export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

/**
 * Create index on username and email for fast lookups
 */
export const CREATE_USER_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

/**
 * Hash password using SHA-256
 */
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

/**
 * Convert database row to User object
 */
function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name || undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const db = getDatabase();

  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO users (id, username, email, password_hash, display_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, username.toLowerCase(), email.toLowerCase(), passwordHash, displayName || null, now, now]
  );

  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );

  if (!row) {
    throw new Error('Failed to create user');
  }

  return rowToUser(row);
}

/**
 * Authenticate user with username/email and password
 */
export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<User | null> {
  const db = getDatabase();

  const passwordHash = await hashPassword(password);
  const identifier = usernameOrEmail.toLowerCase();

  const row = await db.getFirstAsync<UserRow>(
    `SELECT * FROM users
     WHERE (username = ? OR email = ?) AND password_hash = ?`,
    [identifier, identifier, passwordHash]
  );

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const db = getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE username = ?',
    [username.toLowerCase()]
  );

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDatabase();

  const row = await db.getFirstAsync<UserRow>(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  if (!row) {
    return null;
  }

  return rowToUser(row);
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: {
    displayName?: string;
    email?: string;
  }
): Promise<User> {
  const db = getDatabase();

  const now = new Date().toISOString();
  const updateFields: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.displayName !== undefined) {
    updateFields.push('display_name = ?');
    values.push(updates.displayName);
  }

  if (updates.email !== undefined) {
    updateFields.push('email = ?');
    values.push(updates.email.toLowerCase());
  }

  values.push(userId);

  await db.runAsync(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    values
  );

  const user = await getUserById(userId);

  if (!user) {
    throw new Error('User not found after update');
  }

  return user;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  const db = getDatabase();

  // Verify old password
  const oldHash = await hashPassword(oldPassword);
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM users WHERE id = ? AND password_hash = ?',
    [userId, oldHash]
  );

  if (!row) {
    return false; // Old password incorrect
  }

  // Update to new password
  const newHash = await hashPassword(newPassword);
  const now = new Date().toISOString();

  await db.runAsync(
    'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
    [newHash, now, userId]
  );

  return true;
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const db = getDatabase();

  await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers(): Promise<User[]> {
  const db = getDatabase();

  const rows = await db.getAllAsync<UserRow>('SELECT * FROM users ORDER BY created_at DESC');

  return rows.map(rowToUser);
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const user = await getUserByUsername(username);
  return user === null;
}

/**
 * Check if email is available
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user === null;
}
