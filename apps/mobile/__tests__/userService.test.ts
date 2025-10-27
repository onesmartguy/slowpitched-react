/**
 * Tests for User Service
 * Phase 7.1: Testing Strategy - Database Services (Authentication)
 */

// Mock the database module
jest.mock('../src/services/database/index', () => {
  const mockDb = {
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  };
  return {
    getDatabase: jest.fn(() => mockDb),
  };
});

import {
  createUser,
  authenticateUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUser,
  changePassword,
  deleteUser,
  getAllUsers,
  isUsernameAvailable,
  isEmailAvailable,
} from '../src/services/database/userService';
import type { User } from '../src/services/database/userService';
import * as Crypto from 'expo-crypto';
import { getDatabase } from '../src/services/database';

describe('UserService', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = getDatabase();
    // Default mock for password hashing
    (Crypto.digestStringAsync as jest.Mock).mockResolvedValue('hashed_password_123');
  });

  const mockUserRow = {
    id: 'user_123',
    username: 'testuser',
    email: 'test@example.com',
    password_hash: 'hashed_password_123',
    display_name: 'Test User',
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  };

  describe('createUser', () => {
    it('should create a new user with all fields', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await createUser('testuser', 'test@example.com', 'password123', 'Test User');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['testuser', 'test@example.com', 'hashed_password_123', 'Test User'])
      );
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
    });

    it('should create user without display name', async () => {
      const rowWithoutDisplayName = { ...mockUserRow, display_name: null };
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(rowWithoutDisplayName);

      const user = await createUser('testuser', 'test@example.com', 'password123');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([null]) // display_name as null
      );
      expect(user.displayName).toBeUndefined();
    });

    it('should lowercase username and email', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await createUser('TestUser', 'TEST@EXAMPLE.COM', 'password123');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['testuser', 'test@example.com'])
      );
    });

    it('should hash password before storing', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await createUser('testuser', 'test@example.com', 'plaintext_password');

      expect(Crypto.digestStringAsync).toHaveBeenCalledWith('SHA256', 'plaintext_password');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['hashed_password_123'])
      );
    });

    it('should throw error if user creation fails', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(null);

      await expect(
        createUser('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Failed to create user');
    });

    it('should convert timestamps to milliseconds', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await createUser('testuser', 'test@example.com', 'password123');

      expect(typeof user.createdAt).toBe('number');
      expect(typeof user.updatedAt).toBe('number');
      expect(user.createdAt).toBe(new Date('2025-01-01').getTime());
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate with username', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await authenticateUser('testuser', 'password123');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE (username = ? OR email = ?) AND password_hash = ?'),
        ['testuser', 'testuser', 'hashed_password_123']
      );
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
    });

    it('should authenticate with email', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await authenticateUser('test@example.com', 'password123');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com', 'test@example.com', 'hashed_password_123']
      );
      expect(user).not.toBeNull();
    });

    it('should return null for incorrect password', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const user = await authenticateUser('testuser', 'wrong_password');

      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const user = await authenticateUser('nonexistent', 'password123');

      expect(user).toBeNull();
    });

    it('should lowercase username/email for lookup', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await authenticateUser('TestUser', 'password123');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['testuser', 'testuser', expect.any(String)]
      );
    });
  });

  describe('getUserById', () => {
    it('should retrieve user by ID', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await getUserById('user_123');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['user_123']
      );
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user_123');
    });

    it('should return null if user not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const user = await getUserById('nonexistent');

      expect(user).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should retrieve user by username', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await getUserByUsername('testuser');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['testuser']
      );
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
    });

    it('should lowercase username for lookup', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await getUserByUsername('TestUser');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['testuser']
      );
    });

    it('should return null if user not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const user = await getUserByUsername('nonexistent');

      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should retrieve user by email', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const user = await getUserByEmail('test@example.com');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com']
      );
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    it('should lowercase email for lookup', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await getUserByEmail('TEST@EXAMPLE.COM');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com']
      );
    });

    it('should return null if user not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const user = await getUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update display name', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue({
        ...mockUserRow,
        display_name: 'Updated Name',
      });

      const user = await updateUser('user_123', { displayName: 'Updated Name' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining(['Updated Name', 'user_123'])
      );
      expect(user.displayName).toBe('Updated Name');
    });

    it('should update email', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue({
        ...mockUserRow,
        email: 'newemail@example.com',
      });

      const user = await updateUser('user_123', { email: 'newemail@example.com' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['newemail@example.com', 'user_123'])
      );
      expect(user.email).toBe('newemail@example.com');
    });

    it('should update both display name and email', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue({
        ...mockUserRow,
        display_name: 'New Name',
        email: 'newemail@example.com',
      });

      const user = await updateUser('user_123', {
        displayName: 'New Name',
        email: 'newemail@example.com',
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['New Name', 'newemail@example.com', 'user_123'])
      );
    });

    it('should lowercase email on update', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      await updateUser('user_123', { email: 'NEWEMAIL@EXAMPLE.COM' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['newemail@example.com'])
      );
    });

    it('should throw error if user not found after update', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });
      mockDb.getFirstAsync.mockResolvedValue(null);

      await expect(
        updateUser('nonexistent', { displayName: 'Test' })
      ).rejects.toThrow('User not found after update');
    });
  });

  describe('changePassword', () => {
    it('should change password with correct old password', async () => {
      // Mock old password verification
      mockDb.getFirstAsync.mockResolvedValueOnce({ id: 'user_123' });
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await changePassword('user_123', 'oldpassword', 'newpassword');

      expect(result).toBe(true);
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith('SHA256', 'oldpassword');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith('SHA256', 'newpassword');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET password_hash = ?'),
        expect.arrayContaining(['hashed_password_123', expect.any(String), 'user_123'])
      );
    });

    it('should return false for incorrect old password', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await changePassword('user_123', 'wrongpassword', 'newpassword');

      expect(result).toBe(false);
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });

    it('should hash both old and new passwords', async () => {
      mockDb.getFirstAsync.mockResolvedValue({ id: 'user_123' });
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      (Crypto.digestStringAsync as jest.Mock)
        .mockResolvedValueOnce('old_hash')
        .mockResolvedValueOnce('new_hash');

      await changePassword('user_123', 'oldpassword', 'newpassword');

      expect(Crypto.digestStringAsync).toHaveBeenNthCalledWith(1, 'SHA256', 'oldpassword');
      expect(Crypto.digestStringAsync).toHaveBeenNthCalledWith(2, 'SHA256', 'newpassword');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['new_hash'])
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      await deleteUser('user_123');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        ['user_123']
      );
    });
  });

  describe('getAllUsers', () => {
    it('should retrieve all users ordered by creation date', async () => {
      const mockRows = [
        mockUserRow,
        { ...mockUserRow, id: 'user_456', username: 'anotheruser' },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const users = await getAllUsers();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      expect(users).toHaveLength(2);
      expect(users[0].id).toBe('user_123');
      expect(users[1].id).toBe('user_456');
    });

    it('should return empty array if no users', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const users = await getAllUsers();

      expect(users).toEqual([]);
    });

    it('should handle users without display names', async () => {
      const mockRows = [{ ...mockUserRow, display_name: null }];
      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const users = await getAllUsers();

      expect(users[0].displayName).toBeUndefined();
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return true if username is available', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const available = await isUsernameAvailable('newuser');

      expect(available).toBe(true);
    });

    it('should return false if username is taken', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const available = await isUsernameAvailable('testuser');

      expect(available).toBe(false);
    });
  });

  describe('isEmailAvailable', () => {
    it('should return true if email is available', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const available = await isEmailAvailable('new@example.com');

      expect(available).toBe(true);
    });

    it('should return false if email is taken', async () => {
      mockDb.getFirstAsync.mockResolvedValue(mockUserRow);

      const available = await isEmailAvailable('test@example.com');

      expect(available).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle database errors in createUser', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        createUser('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in authenticateUser', async () => {
      mockDb.getFirstAsync.mockRejectedValue(new Error('Query failed'));

      await expect(
        authenticateUser('testuser', 'password123')
      ).rejects.toThrow('Query failed');
    });

    it('should handle database errors in updateUser', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Update failed'));

      await expect(
        updateUser('user_123', { displayName: 'Test' })
      ).rejects.toThrow('Update failed');
    });

    it('should handle hashing errors', async () => {
      (Crypto.digestStringAsync as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

      await expect(
        createUser('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Hashing failed');
    });
  });
});
