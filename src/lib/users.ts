import { User } from '@/types';

const USERS_KEY = 'nexus_users';
const SESSION_KEY = 'nexus_current_user';

const initializeUsers = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
    const defaultAdmin: User = {
      username: "DG143",
      password: "DG143",
      isAdmin: true,
      status: "approved",
      joined: new Date().toISOString()
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  initializeUsers();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

export const loginUser = (username: string, password?: string) => {
  const users = getUsers();
  const user = users.find(u => u.username === username);

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

export const registerUser = (username: string) => {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return { success: false, message: 'Username already exists.', status: null };
    }
    const newUser: User = {
        username,
        password: '',
        isAdmin: false,
        status: 'pending',
        joined: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Registration successful, awaiting approval.', status: 'pending' as 'pending' };
};

export const createUser = (username: string, password = "") => {
  const users = getUsers();
  if (users.some(u => u.username === username)) {
    return { success: false, message: `User "${username}" already exists.` };
  }
  const newUser: User = {
    username,
    password,
    isAdmin: false,
    status: 'approved',
    joined: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, message: `User "${username}" created successfully.` };
}

export const updateUserStatus = (username: string, status: 'approved' | 'revoked' | 'pending', reason?: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex === -1) {
    return { success: false, message: "User not found."};
  }
  if (users[userIndex].isAdmin) {
    return { success: false, message: "Cannot change admin status." };
  }

  users[userIndex].status = status;
  if (status === 'revoked') {
    users[userIndex].revocationReason = reason;
    users[userIndex].revokedAt = new Date().toISOString();
  } else {
    delete users[userIndex].revocationReason;
    delete users[userIndex].revokedAt;
  }
  saveUsers(users);
  return { success: true, message: "User status updated." };
};

export const deleteUser = (username: string) => {
    let users = getUsers();
    users = users.filter(u => u.username !== username);
    saveUsers(users);
}
