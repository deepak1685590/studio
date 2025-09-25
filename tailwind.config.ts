
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-space-mono)', 'monospace'],
        headline: ['var(--font-orbitron)', 'sans-serif'],
        code: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        flicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': {
            textShadow: '0 0 4px hsl(var(--primary)), 0 0 11px hsl(var(--primary)), 0 0 19px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 80px #fff, 0 0 90px #fff, 0 0 100px hsl(var(--primary)), 0 0 150px hsl(var(--primary))',
          },
          '20%, 24%, 55%': {
            textShadow: 'none',
          },
        },
         'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 15px hsl(var(--primary) / 0.7))' },
        },
        'neon-blue': {
          '0%, 100%': {
            'text-shadow': '0 0 5px #22d3ee, 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #0891b2, 0 0 80px #0891b2',
            color: '#e0f2fe',
          },
          '50%': {
            'text-shadow': '0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 40px #0891b2, 0 0 80px #0891b2, 0 0 100px #0891b2',
            color: '#f0f9ff',
          },
        },
        'neon-purple': {
          '0%, 100%': {
            'text-shadow': '0 0 5px #d8b4fe, 0 0 10px #d8b4fe, 0 0 20px #d8b4fe, 0 0 40px #a855f7, 0 0 80px #a855f7',
            color: '#f3e8ff',
          },
          '50%': {
            'text-shadow': '0 0 10px #d8b4fe, 0 0 20px #d8b4fe, 0 0 40px #a855f7, 0 0 80px #a855f7, 0 0 100px #a855f7',
            color: '#fae8ff',
          },
        },
        'neon-red': {
          '0%, 100%': {
            'text-shadow': '0 0 5px #fda4af, 0 0 10px #fda4af, 0 0 20px #fda4af, 0 0 40px #f43f5e, 0 0 80px #f43f5e',
            color: '#fff1f2',
          },
          '50%': {
            'text-shadow': '0 0 10px #fda4af, 0 0 20px #fda4af, 0 0 40px #f43f5e, 0 0 80px #f43f5e, 0 0 100px #f43f5e',
            color: '#fff1f2',
          },
        },
        'neon-color-cycle': {
            '0%': { color: 'hsl(180, 100%, 50%)', textShadow: '0 0 5px hsl(180, 100%, 50%), 0 0 10px hsl(180, 100%, 50%)' },
            '25%': { color: 'hsl(270, 100%, 60%)', textShadow: '0 0 5px hsl(270, 100%, 60%), 0 0 10px hsl(270, 100%, 60%)' },
            '50%': { color: 'hsl(340, 100%, 55%)', textShadow: '0 0 5px hsl(340, 100%, 55%), 0 0 10px hsl(340, 100%, 55%)' },
            '75%': { color: 'hsl(38, 92%, 50%)', textShadow: '0 0 5px hsl(38, 92%, 50%), 0 0 10px hsl(38, 92%, 50%)' },
            '100%': { color: 'hsl(180, 100%, 50%)', textShadow: '0 0 5px hsl(180, 100%, 50%), 0 0 10px hsl(180, 100%, 50%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'neon-glow': {
            '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
            '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        'neon-glow-green': {
            '0%, 100%': { textShadow: '0 0 5px theme("colors.green.500"), 0 0 10px theme("colors.green.400")' },
            '50%': { textShadow: '0 0 10px theme("colors.green.400"), 0 0 20px theme("colors.green.300")' },
        },
        'neon-glow-red': {
            '0%, 100%': { textShadow: '0 0 5px theme("colors.red.500"), 0 0 10px theme("colors.red.400")' },
            '50%': { textShadow: '0 0 10px theme("colors.red.400"), 0 0 20px theme("colors.red.300")' },
        },
        'bar-pulse-green': {
            '0%, 100%': { opacity: '0.8', filter: 'saturate(1)' },
            '50%': { opacity: '1', filter: 'saturate(1.5)' },
        },
        'float-slow': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        flicker: 'flicker 3s infinite alternate',
        'pulse-glow': 'pulse-glow 2.5s infinite alternate',
        'neon-blue': 'neon-blue 2s ease-in-out infinite alternate',
        'neon-purple': 'neon-purple 2.5s ease-in-out infinite alternate',
        'neon-red': 'neon-red 2.2s ease-in-out infinite alternate',
        'neon-color-cycle': 'neon-color-cycle 5s linear infinite',
        marquee: 'marquee 40s linear infinite',
        'neon-glow': 'neon-glow 4s ease-in-out infinite alternate',
        'neon-glow-green': 'neon-glow-green 3s ease-in-out infinite alternate',
        'neon-glow-red': 'neon-glow-red 3s ease-in-out infinite alternate',
        'bar-pulse-green': 'bar-pulse-green 2s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      },
      textShadow: {
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        sm: '0 1px 2px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
