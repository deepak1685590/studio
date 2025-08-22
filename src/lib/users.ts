import { User } from '@/types';

const USERS_KEY = 'nexus_users';
const SESSION_KEY = 'nexus_current_user';

const preapprovedUsers = [
  { username: 'supernexus7098', password: 'xkQ2!9mP@vR3' },
  { username: 'user_supernexus231', password: 'Lp8#nM4*sWqA' },
  { username: 'supernexus_alpha445', password: 'Zt6&dF1%nKcX' },
  { username: 'elite_supernexus112', password: 'Ra9@wE7^yHjN' },
  { username: 'supernexus_zeta555', password: 'Gt3$mK8&nPvB' },
  { username: 'supernexus_user887', password: 'Qw2!sX5%pLmV' },
  { username: 'supernexus_rocks321', password: 'Wn7#kD9@rTgY' },
  { username: 'power_supernexus409', password: 'Mb4%nJ2^xKpL' },
  { username: 'supernexus_core666', password: 'Ft1@qW8#sNmP' },
  { username: 'supernexus_dynamix293', password: 'Kj5$rT7&vBnX' },
  { username: 'supernexus_quantum114', password: 'Pl9!mK3%nVcR' },
  { username: 'supernexus_pulse778', password: 'Xg6@wQ4^tMfN' },
  { username: 'supernexus_viper532', password: 'Hn2#kL8$rPvM' },
  { username: 'supernexus_fusion801', password: 'Wq7%nJ5@xKtB' },
  { username: 'supernexus_nebula394', password: 'Rt3!mP9#vLgX' },
  { username: 'supernexus_storm627', password: 'Fk8@nD4^qWpM' },
  { username: 'supernexus_blaze156', password: 'Jm5$rT7&nKvP' },
  { username: 'supernexus_orbit489', password: 'Gw2!kL9%mNqX' },
  { username: 'supernexus_flux733', password: 'Pt6@nM4#vBkR' },
  { username: 'supernexus_echo502', password: 'Mf8$rK3^nWqL' },
  { username: 'supernexus_apex267', password: 'Xn1!tP7%jGvM' },
  { username: 'supernexus_ion914', password: 'Kq5@mW9#rTnF' },
  { username: 'supernexus_vertex378', password: 'Hg3!nK6@vPmX' },
  { username: 'supernexus_nova641', password: 'Wt7$rM2%nKqP' },
  { username: 'supernexus_aura825', password: 'Jn4@kL8#mVfX' },
  { username: 'supernexus_cyber593', password: 'Rp6!mT9%nKvG' },
  { username: 'supernexus_pulse107', password: 'Fw2@nK4^qLmP' },
  { username: 'supernexus_core884', password: 'Xq8$rM5%tKvN' },
  { username: 'supernexus_zeta219', password: 'Gt3!nJ7@vPmR' },
  { username: 'supernexus_drive652', password: 'Mk9$rN4#qWfX' },
  { username: 'supernexus_wave308', password: 'Pl6@nM2!vKtG' },
  { username: 'supernexus_flux971', password: 'Jw4$rK8%nMqX' },
  { username: 'supernexus_star546', password: 'Ft2!mP7#vNkR' },
  { username: 'supernexus_moon283', password: 'Wn5@qL9$rKvM' },
  { username: 'supernexus_sun710', password: 'Kp8!mT4%nGvX' },
  { username: 'supernexus_atom437', password: 'Hq6$rN2@vMkP' },
  { username: 'supernexus_cell964', password: 'Xt3!nK7#mPvR' },
  { username: 'supernexus_gene528', password: 'Gm4@qW9%nKtX' },
  { username: 'supernexus_bio773', password: 'Jn7$rP2!vKmF' },
  { username: 'supernexus_dna105', password: 'Rt5@nM8#qWvX' },
  { username: 'supernexus_life669', password: 'Fw3!kP7%nMqR' },
  { username: 'supernexus_code412', password: 'Xn8@rT4$vKmP' },
  { username: 'supernexus_dev897', password: 'Kq2!mN6#vGtX' },
  { username: 'supernexus_app354', password: 'Hp7@nK3%qWvM' },
  { username: 'supernexus_web720', password: 'Jt4$rM8!nKqX' },
  { username: 'supernexus_cloud586', password: 'Wn9@kP2#vMtR' },
  { username: 'supernexus_data139', password: 'Gq3!mT7%nKvX' },
  { username: 'supernexus_ai604', password: 'Fk8@rN4$qWmP' },
  { username: 'supernexus_bot271', password: 'Xt5!nK9#vPqR' },
  { username: 'supernexus_robot948', password: 'Jm2@qW7%nKvX' },
  { username: 'RAX143', password: 'RAX143' }
];

const initializeUsers = () => {
  if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        username: "DG143",
        password: "DG143",
        isAdmin: true,
        status: "approved",
        joined: new Date().toISOString()
      }
    ];

    preapprovedUsers.forEach(user => {
      defaultUsers.push({
        username: user.username,
        password: user.password,
        isAdmin: false,
        status: 'approved',
        joined: new Date().toISOString()
      });
    });
    
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
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

export const loginUser = (username: string, password = "") => {
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
