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
  { username: 'RAX143', password: 'RAX143' },
  { username: 'supernexus_user001', password: 'Kp8@mN3x369' },
  { username: 'supernexus_user002', password: 'Ft4!qW7n369' },
  { username: 'supernexus_user003', password: 'Xr9#kM2p369' },
  { username: 'supernexus_user004', password: 'Ln3@vQ6m369' },
  { username: 'supernexus_user005', password: 'Gw7!nK4x369' },
  { username: 'supernexus_user006', password: 'Jq5#mP8n369' },
  { username: 'supernexus_user007', password: 'Rt2@kL9v369' },
  { username: 'supernexus_user008', password: 'Wp4!nM7q369' },
  { username: 'supernexus_user009', password: 'Fg8#xK3m369' },
  { username: 'supernexus_user010', password: 'Xn6@rT5p369' },
  { username: 'supernexus_user011', password: 'Mk9!nQ2v369' },
  { username: 'supernexus_user012', password: 'Pl3#jW8m369' },
  { username: 'supernexus_user013', password: 'Ht7@qK4n369' },
  { username: 'supernexus_user014', password: 'Jr5!mP9x369' },
  { username: 'supernexus_user015', password: 'Wk2#nL8q369' },
  { username: 'supernexus_user016', password: 'Fp6@vM4k369' },
  { username: 'supernexus_user017', password: 'Xq8!nR3t369' },
  { username: 'supernexus_user018', password: 'Gt4#mK7p369' },
  { username: 'supernexus_user019', password: 'Rn2@qW9v369' },
  { username: 'supernexus_user020', password: 'Jm7!kP4n369' },
  { username: 'supernexus_user021', password: 'Kq9#xL6m369' },
  { username: 'supernexus_user022', password: 'Fw3@nT8p369' },
  { username: 'supernexus_user023', password: 'Xp5!mK2q369' },
  { username: 'supernexus_user024', password: 'Lt7#jN4v369' },
  { username: 'supernexus_user025', password: 'Hk2@qM9x369' },
  { username: 'supernexus_user026', password: 'Jn8!pL5n369' },
  { username: 'supernexus_user027', password: 'Wq4#rK7m369' },
  { username: 'supernexus_user028', password: 'Fp9@nM3v369' },
  { username: 'supernexus_user029', password: 'Xt2!kQ8p369' },
  { username: 'supernexus_user030', password: 'Gn6#mL4q369' },
  { username: 'supernexus_user031', password: 'Rk3@jP9v369' },
  { username: 'supernexus_user032', password: 'Jq7!nM5x369' },
  { username: 'supernexus_user033', password: 'Ft8#kP2n369' },
  { username: 'supernexus_user034', password: 'Xm4@qL7p369' },
  { username: 'supernexus_user035', password: 'Wn9!rK6v369' },
  { username: 'supernexus_user036', password: 'Hp2#mQ8x369' },
  { username: 'supernexus_user037', password: 'Jk7@nL4q369' },
  { username: 'supernexus_user038', password: 'Fq3!pM9n369' },
  { username: 'supernexus_user039', password: 'Xt8#kR2v369' },
  { username: 'supernexus_user040', password: 'Gn4@qP7x369' },
  { username: 'supernexus_user041', password: 'Rm6!kL5n369' },
  { username: 'supernexus_user042', password: 'Jp9#mQ8p369' },
  { username: 'supernexus_user043', password: 'Fw2@nK3v369' },
  { username: 'supernexus_user044', password: 'Xq7!rL9x369' },
  { username: 'supernexus_user045', password: 'Ht4#mP2n369' },
  { username: 'supernexus_user046', password: 'Jn8@kQ6p369' },
  { username: 'supernexus_user047', password: 'Fp3!mL9v369' },
  { username: 'supernexus_user048', password: 'Xr7#nK4x369' },
  { username: 'supernexus_user049', password: 'Jq5@rM8n369' },
  { username: 'supernexus_user050', password: 'Ft2!kP7p369' },
  { username: 'supernexus_alpha051', password: 'Km8@nQ4x369' },
  { username: 'supernexus_beta052', password: 'Xp3!rL7m369' },
  { username: 'supernexus_gamma053', password: 'Ft6#kM9n369' },
  { username: 'supernexus_delta054', password: 'Wq2@nK4v369' },
  { username: 'supernexus_echo055', password: 'Jr7!mP8x369' },
  { username: 'supernexus_fox056', password: 'Hn4#kQ2p369' },
  { username: 'supernexus_neo057', password: 'Xm9@rL6v369' },
  { username: 'supernexus_viper058', password: 'Kq3!nP7m369' },
  { username: 'supernexus_core059', password: 'Ft8#jM4n369' },
  { username: 'supernexus_flux060', password: 'Wp2@qK9x369' },
  { username: 'supernexus_nova061', password: 'Jn7!mL5p369' },
  { username: 'supernexus_ion062', password: 'Hq4#kP8v369' },
  { username: 'supernexus_phoenix063', password: 'Xr6@nM3x369' },
  { username: 'supernexus_blaze064', password: 'Km2!qL9n369' },
  { username: 'supernexus_storm065', password: 'Fp7#jN4p369' },
  { username: 'supernexus_pulse066', password: 'Wt3@qK8v369' },
  { username: 'supernexus_quantum067', password: 'Jn9!mP2x369' },
  { username: 'supernexus_atom068', password: 'Hk4#rM7n369' },
  { username: 'supernexus_cell069', password: 'Xq8@nP5p369' },
  { username: 'supernexus_dna070', password: 'Kt3!mK9v369' },
  { username: 'supernexus_gene071', password: 'Fp6#nL4x369' },
  { username: 'supernexus_bio072', password: 'Wm2@qP8n369' },
  { username: 'supernexus_vita073', password: 'Jr7!kM5p369' },
  { username: 'supernexus_solar074', password: 'Hn9#qL3v369' },
  { username: 'supernexus_lunar075', password: 'Xp4!mK8x369' },
  { username: 'supernexus_star076', password: 'Kq7@nR2n369' },
  { username: 'supernexus_comet077', password: 'Ft3#jM9p369' },
  { username: 'supernexus_meteor078', password: 'Wn8@qL4v369' },
  { username: 'supernexus_orbit079', password: 'Jm2!kP7x369' },
  { username: 'supernexus_axon080', password: 'Hq6#rN5n369' },
  { username: 'supernexus_neuron081', password: 'Xp9@kM3p369' },
  { username: 'supernexus_synapse082', password: 'Kt4!mL8v369' },
  { username: 'supernexus_cortex083', password: 'Fw7#nQ2x369' },
  { username: 'supernexus_logic084', password: 'Wq3@jP9n369' },
  { username: 'supernexus_code085', password: 'Jn8!kM4p369' },
  { username: 'supernexus_dev086', password: 'Hp2#rL9v369' },
  { username: 'supernexus_script087', password: 'Xm6@qK3x369' },
  { username: 'supernexus_debug088', password: 'Kq9!nP7n369' },
  { username: 'supernexus_app089', password: 'Ft4#mL2p369' },
  { username: 'supernexus_web090', password: 'Wp8@qM6v369' },
  { username: 'supernexus_cloud091', password: 'Jn3!kP9x369' },
  { username: 'supernexus_host092', password: 'Hq7#rN4n369' },
  { username: 'supernexus_server093', password: 'Xt2@kM8p369' },
  { username: 'supernexus_data094', password: 'Km6!qL3v369' },
  { username: 'supernexus_ai095', password: 'Fp9#nQ7x369' },
  { username: 'supernexus_bot096', password: 'Wn4@jM2n369' },
  { username: 'supernexus_chat097', password: 'Jr8!kP6p369' },
  { username: 'supernexus_nexus098', password: 'Hq3#mL9v369' },
  { username: 'supernexus_link099', password: 'Xp7@kN4x369' },
  { username: 'supernexus_hub100', password: 'Kt2!qM8n369' },
];

const initializeUsers = () => {
  if (typeof window === 'undefined') return;

  const existingUsers: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  const defaultAdmin: User = {
    username: "DG143",
    password: "DG143",
    isAdmin: true,
    status: "approved",
    joined: new Date().toISOString()
  };

  // Create a map of existing users for quick lookup
  const existingUsersMap = new Map(existingUsers.map(u => [u.username, u]));

  // Add or update the default admin
  existingUsersMap.set(defaultAdmin.username, { ...existingUsersMap.get(defaultAdmin.username), ...defaultAdmin });

  // Add all preapproved users, overwriting duplicates to ensure passwords are correct
  preapprovedUsers.forEach(preapprovedUser => {
    const existingUser = existingUsersMap.get(preapprovedUser.username);
    if (!existingUser) {
        existingUsersMap.set(preapprovedUser.username, {
            ...preapprovedUser,
            isAdmin: false,
            status: 'approved',
            joined: new Date().toISOString()
        });
    } else {
        // If user exists, ensure password and status are updated from the preapproved list
        existingUsersMap.set(preapprovedUser.username, {
            ...existingUser,
            password: preapprovedUser.password,
            status: 'approved'
        });
    }
  });
  
  const usersToSave = Array.from(existingUsersMap.values());
  localStorage.setItem(USERS_KEY, JSON.stringify(usersToSave));
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
