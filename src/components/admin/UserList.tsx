import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldOff, RotateCcw } from 'lucide-react';

interface UserListProps {
  users: User[];
  type: 'pending' | 'approved' | 'revoked';
  onApprove?: (username: string) => void;
  onReject?: (username: string) => void;
  onRevoke?: (user: User) => void;
  onRestore?: (username: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, type, onApprove, onReject, onRevoke, onRestore }) => {
  if (users.length === 0) {
    return <p className="text-center text-foreground/50 italic py-4">No users in this category.</p>;
  }

  const renderActions = (user: User) => {
    switch (type) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onApprove?.(user.username)} className="bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/50"><Check size={16} className="mr-1"/>Approve</Button>
            <Button size="sm" onClick={() => onReject?.(user.username)} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/50"><X size={16} className="mr-1"/>Reject</Button>
          </div>
        );
      case 'approved':
        return !user.isAdmin && (
          <Button size="sm" onClick={() => onRevoke?.(user)} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 border border-red-500/50"><ShieldOff size={16} className="mr-1"/>Revoke Access</Button>
        );
      case 'revoked':
        return (
          <Button size="sm" onClick={() => onRestore?.(user.username)} className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/50"><RotateCcw size={16} className="mr-1"/>Restore Access</Button>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'pending': return <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">Pending</Badge>;
        case 'approved': return <Badge variant="outline" className="text-green-400 border-green-400/50">Approved</Badge>;
        case 'revoked': return <Badge variant="outline" className="text-red-400 border-red-400/50">Revoked</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
      {users.map(user => (
        <div key={user.username} className="p-4 bg-black/30 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 border border-primary/20">
          <div className="flex-1">
            <div className="flex items-center gap-2">
                <strong className='font-headline'>{user.username} {user.isAdmin ? '(ADMIN)' : ''}</strong>
                {getStatusBadge(user.status)}
            </div>
            <div className="text-xs text-foreground/60 mt-1">
              {type === 'revoked' 
                ? `Reason: ${user.revocationReason || 'N/A'} | Revoked: ${user.revokedAt ? new Date(user.revokedAt).toLocaleString() : 'N/A'}`
                : `Joined: ${new Date(user.joined).toLocaleString()}`
              }
            </div>
          </div>
          <div className="flex-shrink-0">
            {renderActions(user)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
