import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/types';
import * as authService from '../services/auth';
import { useAnalytics } from '../hooks/useAnalytics';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { user } = await authService.loginUser(email, password);
      setUser(user);
      void trackEvent('user_login', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      setIsLoading(true);
      const { user } = await authService.registerUser(email, password, name);
      setUser(user);
      void trackEvent('user_register', {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      await authService.logoutUser();
      void trackEvent('user_logout', {
        userId: user?.id,
        email: user?.email,
      });
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserProfile(updates: Partial<User>) {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setIsLoading(true);
      const updatedUser = await authService.updateUser(user.id, updates);
      setUser(updatedUser);
      void trackEvent('user_update', {
        userId: user.id,
        updatedFields: Object.keys(updates),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
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