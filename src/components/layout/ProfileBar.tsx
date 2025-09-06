"use client";

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

const ProfileBar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center bg-black/50 border border-primary/30 rounded-lg p-3 px-4 mb-5 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-primary font-headline">
        <User />
        <span>{user?.username}</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <Button variant="ghost" onClick={logout} className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfileBar;
