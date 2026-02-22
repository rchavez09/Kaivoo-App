import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        serif: ['Spectral', 'Merriweather', 'Georgia', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        charcoal: "hsl(var(--charcoal, 228 19% 21%))",
        silver: "hsl(var(--silver, 218 11% 65%))",
        "storm-blue": "hsl(var(--storm-blue, 214 24% 38%))",
        "dusk-rose": "hsl(var(--dusk-rose, 23 33% 65%))",
        // Ocean Gradient System — Kaivoo Design System v2.0
        "ocean-foam": "#D4EDE4",
        "ocean-shallow": "#7EC8C8",
        "ocean-surface": "#3B8C8C",
        "ocean-mid": "#2B6E8A",
        "ocean-deep": "#1E4D7A",
        "ocean-twilight": "#1E3364",
        "ocean-abyss": "#2A1B4E",
        "ocean-trench": "#1A1232",
        // Brand accents
        "sage-mist": "#8FA89A",
        "sage-deep": "#6B8F7A",
        "resonance-teal": "#3B8C8C",
        "sunlit-amber": "#D4A952",
        "twilight-lavender": "#9B8EB0",
        "ember": "#C75C3A",
        "clarity-blue": "#5B7FBF",
        panel: {
          "task-from": "hsl(var(--panel-task-from))",
          "task-to": "hsl(var(--panel-task-to))",
          "task-accent": "hsl(var(--panel-task-accent))",
          "task-section": "hsl(var(--panel-task-section))",
          "meeting-from": "hsl(var(--panel-meeting-from))",
          "meeting-to": "hsl(var(--panel-meeting-to))",
          "meeting-accent": "hsl(var(--panel-meeting-accent))",
          "meeting-section": "hsl(var(--panel-meeting-section))",
          "default-from": "hsl(var(--panel-default-from))",
          "default-to": "hsl(var(--panel-default-to))",
          "default-accent": "hsl(var(--panel-default-accent))",
          "default-section": "hsl(var(--panel-default-section))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background, 36 38% 97%))",
          foreground: "hsl(var(--sidebar-foreground, 225 28% 14%))",
          primary: "hsl(var(--sidebar-primary, 180 41% 39%))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground, 0 0% 100%))",
          accent: "hsl(var(--sidebar-accent, 220 14% 95%))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground, 225 28% 14%))",
          border: "hsl(var(--sidebar-border, 220 14% 91%))",
          ring: "hsl(var(--sidebar-ring, 180 41% 39%))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in-right 0.25s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
