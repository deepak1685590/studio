"use client";

import React, { useState } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface RevokeModalProps {
  user: User;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const RevokeModal: React.FC<RevokeModalProps> = ({ user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="bg-black border-destructive text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-destructive">
            <AlertTriangle /> Decommission Agent
          </DialogTitle>
        </DialogHeader>
        <p>Enter reason for decommissioning agent <strong className="text-destructive">{user.username}</strong>:</p>
        <Textarea 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
          placeholder="Reason for decommissioning..." 
          className="bg-input border-destructive text-destructive placeholder:text-destructive/50 resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="font-headline">Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!reason.trim()} className="font-headline bg-destructive/80 hover:bg-destructive">Decommission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevokeModal;
