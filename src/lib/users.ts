import { User } from '@/types';

// This file will now primarily handle client-side session and login logic.
// The source of truth for the user list is now the API.

const SESSION_KEY = 'nexus_current_user';

const preapprovedUsers = [
  { username: 'supernexus7098', password: 'xkQ2!9mP@vR3' },
  { username: 'user_supernexus231', password: 'Lp8#nM4*sWqA' },
  // ... (the rest of the pre-approved users can be managed in a database seeding script)
];

// This function is kept for local testing or as a fallback.
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const defaultAdmin: User = {
    username: "DG143",
    password: "DG143",
    isAdmin: true,
    status: "approved",
    joined: new Date().toISOString()
  };
  return [defaultAdmin];
};

export const getSessionUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(SESSION_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const setSessionUser = (user: User) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, isAdmin: user.isAdmin }));
};

export const clearSessionUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const loginUser = (username: string, password = "", allUsers: User[]) => {
  const user = allUsers.find(u => u.username === username);

  if (!user) {
    return { success: false, message: 'User not found.', status: null };
  }
  
  if (user.password && user.password !== password) {
    return { success: false, message: 'Incorrect password.', status: null };
  }

  if (user.status !== 'approved') {
    return { success: false, message: `Account status: ${user.status}`, status: user.status as 'pending' | 'revoked', revocationReason: user.revocationReason };
  }
  
  return { success: true, message: 'Login successful.', user, status: user.status as 'approved' };
};

// Registration now just checks against the current list for duplicates
// The actual creation of a pending user would be an API call.
export const registerUser = (username: string, allUsers: User[]) => {
    if (allUsers.some(u => u.username === username)) {
        return { success: false, message: 'Username already exists.', status: null };
    }
    // In a real app with server-side pending users, you would make an API call here.
    // For this app, we'll simulate the "pending" state on the client.
    return { success: true, message: 'Registration successful, awaiting approval.', status: 'pending' as 'pending' };
};
