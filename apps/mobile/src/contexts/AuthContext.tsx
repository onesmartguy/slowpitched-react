/**
 * Authentication Context
 * Phase 6: Multi-user authentication
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authenticateUser,
  createUser,
  getUserById,
  type User,
} from '../services/database/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@pitch_tracker_auth';

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUserId) {
        const loadedUser = await getUserById(storedUserId);
        setUser(loadedUser);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await authenticateUser(usernameOrEmail, password);

      if (authenticatedUser) {
        setUser(authenticatedUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, authenticatedUser.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      return false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ): Promise<boolean> => {
    try {
      const newUser = await createUser(username, email, password, displayName);
      setUser(newUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
      return true;
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
