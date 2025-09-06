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
        body: ['"Space Mono"', 'monospace'],
        headline: ['Orbitron', 'sans-serif'],
        code: ['"Roboto Mono"', 'monospace'],
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
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.5)' },
          '50%': { boxShadow: '0 0 30px hsl(var(--primary) / 0.7)' },
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'flicker': 'flicker 3s infinite alternate',
        'pulse-glow': 'pulse-glow 2.5s infinite alternate',
        'neon-blue': 'neon-blue 2s ease-in-out infinite alternate',
        'neon-purple': 'neon-purple 2.5s ease-in-out infinite alternate',
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
