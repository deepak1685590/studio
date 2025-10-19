
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import * as UserStore from '@/lib/users'; // We still use this for session management

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  status: 'pending' | 'revoked' | null;
  revocationReason: string | null;
  login: (username: string, password?: string) => { success: boolean, message: string, status: 'pending' | 'revoked' | null };
  register: (username: string, password?: string) => { success: boolean, message: string, status: 'pending' | 'revoked' | null };
  logout: () => void;
  createUser: (username: string, password?: string) => Promise<{ success: boolean, message: string }>;
  approveUser: (username: string) => Promise<void>;
  rejectUser: (username: string) => Promise<void>;
  revokeUser: (username: string, reason: string) => Promise<{ success: boolean, message: string }>;
  restoreUser: (username: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'pending' | 'revoked' | null>(null);
  const [revocationReason, setRevocationReason] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const allUsers = await response.json();
      setUsers(allUsers);
      return allUsers;
    } catch (error) {
      console.error(error);
      // Fallback to localStorage if API fails during initial load
      const localUsers = UserStore.getUsers();
      setUsers(localUsers);
      return localUsers;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const allUsers = await fetchUsers();

      const sessionUser = UserStore.getSessionUser();
      if (sessionUser) {
        const currentUser = allUsers.find((u: User) => u.username === sessionUser.username);
        if (currentUser) {
          if (currentUser.status === 'approved') {
            setUser(currentUser);
            setStatus(null);
            setRevocationReason(null);
          } else {
            setUser(null);
            setStatus(currentUser.status as 'pending' | 'revoked');
            setRevocationReason(currentUser.revocationReason || null);
            UserStore.clearSessionUser(); // Clear invalid session
          }
        } else {
          UserStore.clearSessionUser();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [fetchUsers]);
  
  const login = (username: string, password = "") => {
    const result = UserStore.loginUser(username, password, users);
    if (result.success && result.user) {
      setUser(result.user);
      setStatus(null);
      setRevocationReason(null);
      UserStore.setSessionUser(result.user);
    } else {
      setUser(null);
      setStatus(result.status);
      setRevocationReason(result.revocationReason || null);
    }
    return { success: result.success, message: result.message, status: result.status };
  };

  const register = (username: string) => {
    const result = UserStore.registerUser(username, users);
    setStatus(result.status);
    if (result.success) {
      // In a real app, this would trigger an API call to create a pending user
      console.log("Registration would be sent to admin for approval.");
    }
    return { success: result.success, message: result.message, status: result.status };
  }

  const logout = () => {
    UserStore.clearSessionUser();
    setUser(null);
    setStatus(null);
    setRevocationReason(null);
  };
  
  const createUser = async (username: string, password = "") => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createUser', payload: { username, password } }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchUsers();
      }
      return result;
    } catch (error) {
      return { success: false, message: "Client-side error." };
    }
  }

  const updateUserStatus = async (username: string, status: 'approved' | 'revoked', reason?: string) => {
     try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUserStatus', payload: { username, status, reason } }),
      });
      const result = await response.json();
       if (result.success) {
        if (user?.username === username && status !== 'approved') {
            logout();
        }
        await fetchUsers();
      }
      return result;
    } catch (error) {
      return { success: false, message: "Client-side error." };
    }
  }
  
  const approveUser = async (username: string) => {
    await updateUserStatus(username, 'approved');
  }
  
  const rejectUser = async (username: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  }

  const revokeUser = async (username: string, reason: string) => {
    return await updateUserStatus(username, 'revoked', reason);
  }

  const restoreUser = async (username: string) => {
    await updateUserStatus(username, 'approved');
  }

  const value = {
    user,
    users,
    loading,
    status,
    revocationReason,
    login,
    register,
    logout,
    createUser,
    approveUser,
    rejectUser,
    revokeUser,
    restoreUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
