import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDb } from './DatabaseContext';
import { User } from '../services/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'umkm-pintar-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { db, addUser, setCurrentUserId } = useDb();
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setCurrentUserId(parsedUser.id);
      } catch (e) {
        console.error('Failed to parse auth user', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [setCurrentUserId]);

  // Update current user ID when user changes
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, [user, setCurrentUserId]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = db.users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const userExists = db.users.some(u => u.email === email);
    
    if (userExists) {
      return false; // Email already registered
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password, // Note: In a real app we should hash this!
      name,
      role: 'User', // Default to regular user
      createdAt: Date.now(),
    };

    addUser(newUser);
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
