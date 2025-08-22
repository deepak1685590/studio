"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import StatCard from './StatCard';
import UserList from './UserList';
import RevokeModal from './RevokeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { users, createUser, approveUser, rejectUser, revokeUser, restoreUser } = useAuth();
  const { toast } = useToast();

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userToRevoke, setUserToRevoke] = useState<User | null>(null);

  // Filter out the admin user from the lists that are managed.
  const manageableUsers = users.filter(u => !u.isAdmin);

  const pendingUsers = manageableUsers.filter(u => u.status === 'pending');
  const approvedUsers = manageableUsers.filter(u => u.status === 'approved');
  const revokedUsers = manageableUsers.filter(u => u.status === 'revoked');

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) {
      toast({ title: "Error", description: "Please enter both username and password.", variant: "destructive" });
      return;
    }
    const result = createUser(newUsername, newPassword);
    if (result.success) {
      toast({ title: "Success", description: `User "${newUsername}" created successfully!` });
      setNewUsername('');
      setNewPassword('');
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleRevoke = (reason: string) => {
    if (userToRevoke) {
      const result = revokeUser(userToRevoke.username, reason);
      if(result.success) {
         toast({ title: "Success", description: `Access revoked for ${userToRevoke.username}!` });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setUserToRevoke(null);
    }
  };
  
  const cardStyles = "border border-primary/20 bg-primary/5 p-4 rounded-lg";
  const headerStyles = "font-headline text-lg text-primary mb-4 border-b border-primary/20 pb-2";

  return (
    <div className="admin-dashboard p-4 md:p-6 my-5 max-w-5xl mx-auto border-2 border-primary rounded-xl bg-black/70 backdrop-blur-sm text-foreground shadow-[0_0_25px_rgba(0,230,230,0.5)]">
      <h3 className="font-headline text-2xl text-primary text-shadow-[0_0_10px_var(--primary)] text-center mb-6 flex items-center justify-center gap-2">
        <ShieldCheck size={28} /> ADMIN CONTROL MATRIX
      </h3>
      
      <div className={cardStyles + " mb-6"}>
        <h4 className={headerStyles}>➕ Provision New Agent</h4>
        <div className="space-y-4">
          <Input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
          <Button onClick={handleCreateUser} className="w-full font-headline uppercase bg-primary/20 border-2 border-primary hover:bg-primary hover:text-background transition-all duration-300">Create User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Agents" value={manageableUsers.length} />
        <StatCard label="Pending Authorization" value={pendingUsers.length} />
        <StatCard label="Active Agents" value={approvedUsers.length} />
        <StatCard label="Decommissioned" value={revokedUsers.length} />
      </div>

      <div className="space-y-6">
        <div className={cardStyles}>
            <h4 className={headerStyles}>⏳ Pending Connections</h4>
            <UserList users={pendingUsers} onApprove={approveUser} onReject={rejectUser} type="pending" />
        </div>
        <div className={cardStyles}>
            <h4 className={headerStyles}>✅ Authorized Agents</h4>
            <UserList users={approvedUsers} onRevoke={(user) => setUserToRevoke(user)} type="approved" />
        </div>
        <div className={cardStyles}>
            <h4 className={headerStyles}>❌ Decommissioned Agents</h4>
            <UserList users={revokedUsers} onRestore={restoreUser} type="revoked" />
        </div>
      </div>

      {userToRevoke && <RevokeModal user={userToRevoke} onConfirm={handleRevoke} onCancel={() => setUserToRevoke(null)} />}
    </div>
  );
};

export default AdminDashboard;
