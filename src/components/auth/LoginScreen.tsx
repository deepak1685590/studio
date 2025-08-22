"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, LogIn, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginScreenProps {
  initialStatus?: 'pending' | 'revoked' | null;
  revocationReason?: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ initialStatus, revocationReason }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const { login, register } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleAuth = () => {
    if (!username) {
      toast({ title: "Error", description: "Please enter a username.", variant: "destructive" });
      return;
    }

    const isExistingUser = !!password;
    if (isExistingUser) {
      const result = login(username, password);
      if (!result.success) {
        setStatus(result.status);
        if (result.status === 'revoked' || result.status === 'pending') {
          // Message will be shown in the component
        } else {
          toast({ title: "Authentication Failed", description: result.message, variant: "destructive" });
        }
      }
    } else {
      const result = register(username);
      setStatus(result.status);
      if (result.success) {
        toast({ title: "Account Created", description: "Awaiting admin approval." });
      } else {
        toast({ title: "Registration Failed", description: result.message, variant: "destructive" });
      }
    }
  };

  const Message = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-4 p-4 text-sm bg-yellow-900/50 border border-dashed border-yellow-500 rounded-lg text-yellow-300 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <div>{children}</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-4 border-2 border-primary rounded-xl bg-black/70 backdrop-blur-sm text-center shadow-[0_0_25px_rgba(0,230,230,0.5)]">
        <h1 className="font-headline text-5xl text-primary animate-flicker" style={{ textShadow: '0 0 5px var(--primary), 0 0 15px var(--primary)' }}>
          <span className="text-foreground">[</span>NEXUS·AI<span className="text-foreground">]</span>
        </h1>
        <h2 className="font-headline text-2xl flex items-center justify-center gap-2 text-primary/80">
          <KeyRound /> System Access
        </h2>
        
        <div className="space-y-4">
          <Input 
            type="text" 
            id="username" 
            placeholder="Enter Callsign" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]" 
          />
          <Input 
            type="password" 
            id="password" 
            placeholder="Enter Passcode (optional for new users)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          />
        </div>
        
        <Button onClick={handleAuth} className="w-full font-headline uppercase bg-primary/20 border-2 border-primary hover:bg-primary hover:text-background transition-all duration-300">
          <LogIn className="mr-2" /> Authenticate
        </Button>
        
        {status === 'pending' && (
          <Message>
            Your access is pending authorization.<br />
            Awaiting administrator approval.
          </Message>
        )}
        {status === 'revoked' && (
          <Message>
            Access has been revoked by administrator.<br />
            {revocationReason && `Reason: ${revocationReason}`}
          </Message>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
