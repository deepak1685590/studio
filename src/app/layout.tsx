
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import MatrixBackground from '@/components/MatrixBackground';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Orbitron, Space_Mono } from 'next/font/google';

export const metadata: Metadata = {
  title: 'NexusAI',
  description: 'Quantum Analysis Engine',
};

// Font optimization with next/font
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-orbitron',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased min-h-screen",
        orbitron.variable,
        spaceMono.variable
      )}>
        <ThemeProvider>
          <AuthProvider>
              <MatrixBackground />
              <div className="relative z-10">{children}</div>
              <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
