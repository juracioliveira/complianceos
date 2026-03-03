import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Paleta Guinle / ComplianceOS
                brand: {
                    50: 'hsl(220, 100%, 97%)',
                    100: 'hsl(220, 96%, 93%)',
                    200: 'hsl(220, 85%, 84%)',
                    300: 'hsl(220, 80%, 72%)',
                    400: 'hsl(220, 74%, 60%)',
                    500: 'hsl(220, 70%, 50%)',
                    600: 'hsl(220, 72%, 42%)',
                    700: 'hsl(220, 76%, 34%)',
                    800: 'hsl(220, 80%, 26%)',
                    900: 'hsl(220, 84%, 18%)',
                    950: 'hsl(220, 90%, 10%)',
                },
                // Design System Harmonization
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                    primary: '#00E5FF',
                    secondary: '#F5A623',
                },
                // Risk levels
                risk: {
                    low: 'hsl(142, 71%, 45%)',
                    'low-bg': 'hsl(142, 71%, 95%)',
                    medium: 'hsl(38, 92%, 50%)',
                    'medium-bg': 'hsl(38, 92%, 95%)',
                    high: 'hsl(25, 95%, 53%)',
                    'high-bg': 'hsl(25, 95%, 95%)',
                    critical: 'hsl(0, 84%, 50%)',
                    'critical-bg': 'hsl(0, 84%, 96%)',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
                secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-dm-serif)', 'serif'],
                ui: ['var(--font-ibm-plex)', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
            },
            keyframes: {
                'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
                'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
                'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
                pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
            },
        },
    },
    plugins: [tailwindAnimate],
}

export default config
