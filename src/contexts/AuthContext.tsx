"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import * as UserStore from '@/lib/users';

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  status: 'pending' | 'revoked' | null;
  revocationReason: string | null;
  login: (username: string, password?: string) => { success: boolean, message: string, status: 'pending' | 'revoked' | null };
  register: (username: string, password?: string) => { success: boolean, message: string, status: 'pending' | 'revoked' | null };
  logout: () => void;
  createUser: (username: string, password?: string) => { success: boolean, message: string };
  approveUser: (username: string) => void;
  rejectUser: (username: string) => void;
  revokeUser: (username: string, reason: string) => { success: boolean, message: string };
  restoreUser: (username: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // Start in a loading state
  const [status, setStatus] = useState<'pending' | 'revoked' | null>(null);
  const [revocationReason, setRevocationReason] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client side
    const allUsers = UserStore.getUsers();
    setUsers(allUsers);

    const sessionUser = UserStore.getSessionUser();
    if (sessionUser) {
      const currentUser = allUsers.find(u => u.username === sessionUser.username);
      if (currentUser) {
        if (currentUser.status === 'approved') {
          setUser(currentUser);
          setStatus(null);
          setRevocationReason(null);
        } else {
          setUser(null);
          setStatus(currentUser.status as 'pending' | 'revoked');
          setRevocationReason(currentUser.revocationReason || null);
        }
      } else {
        // Session user not found in user list, treat as logged out
        UserStore.clearSessionUser();
        setUser(null);
      }
    } else {
      setUser(null);
      setStatus(null);
      setRevocationReason(null);
    }
    
    setLoading(false); // Finished loading
  }, []);
  
  const refreshUsers = () => {
    const allUsers = UserStore.getUsers();
    setUsers(allUsers);
  }

  const login = (username: string, password = "") => {
    const result = UserStore.loginUser(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      setStatus(null);
      UserStore.setSessionUser(result.user);
    } else {
      setUser(null);
      setStatus(result.status);
      setRevocationReason(result.revocationReason || null);
    }
    refreshUsers();
    return { success: result.success, message: result.message, status: result.status };
  };

  const register = (username: string) => {
    const result = UserStore.registerUser(username);
    setStatus(result.status);
    refreshUsers();
    return { success: result.success, message: result.message, status: result.status };
  }

  const logout = () => {
    UserStore.clearSessionUser();
    setUser(null);
    setStatus(null);
  };
  
  const createUser = (username: string, password = "") => {
    const result = UserStore.createUser(username, password);
    refreshUsers();
    return result;
  }
  
  const approveUser = (username: string) => {
    UserStore.updateUserStatus(username, 'approved');
    refreshUsers();
  }
  
  const rejectUser = (username: string) => {
    UserStore.deleteUser(username);
    refreshUsers();
  }

  const revokeUser = (username: string, reason: string) => {
    const result = UserStore.updateUserStatus(username, 'revoked', reason);
    if (user?.username === username) {
        logout();
    }
    refreshUsers();
    return result;
  }

  const restoreUser = (username: string) => {
    UserStore.updateUserStatus(username, 'approved');
    refreshUsers();
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
