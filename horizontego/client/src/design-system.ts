/**
 * Design System Tokens - Dark Professional Theme
 * 
 * Inspired by premium Figma templates with dark, neutral palette
 */

export const typography = {
  // Heading sizes (mobile → desktop) - Bolder for dark theme
  headingXL: "text-4xl md:text-6xl font-bold tracking-tight",
  headingL: "text-3xl md:text-5xl font-bold tracking-tight",
  headingM: "text-2xl md:text-4xl font-semibold tracking-tight",
  headingS: "text-xl md:text-3xl font-semibold",
  headingXS: "text-lg md:text-2xl font-medium",
  
  // Body text
  bodyL: "text-lg leading-relaxed text-foreground/90",
  body: "text-base leading-normal text-foreground/80",
  bodyS: "text-sm leading-normal text-muted-foreground",
  
  // Captions and labels
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium text-foreground",
} as const;

export const spacing = {
  xs: "0.5rem",  // 8px
  sm: "0.75rem", // 12px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
  "4xl": "6rem", // 96px
} as const;

export const colors = {
  // Primary - Vibrant cyan for CTAs
  primary: {
    base: "oklch(0.65 0.19 195)",
    light: "oklch(0.70 0.19 195)",
    dark: "oklch(0.60 0.19 195)",
  },
  
  // Secondary - Purple for highlights
  secondary: {
    base: "oklch(0.62 0.18 280)",
    light: "oklch(0.67 0.18 280)",
    dark: "oklch(0.57 0.18 280)",
  },
  
  // Semantic colors
  success: "oklch(0.68 0.17 150)",
  error: "oklch(0.58 0.22 25)",
  warning: "oklch(0.70 0.20 60)",
  info: "oklch(0.65 0.19 195)",
  
  // Dark neutrals
  background: {
    base: "oklch(0.09 0.01 240)",
    elevated: "oklch(0.12 0.01 240)",
    hover: "oklch(0.16 0.01 240)",
  },
  
  foreground: {
    base: "oklch(0.95 0.01 240)",
    muted: "oklch(0.55 0.01 240)",
    subtle: "oklch(0.40 0.01 240)",
  },
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)",
  glow: "0 0 20px oklch(0.65 0.19 195 / 0.3)",
} as const;

export const transitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const gradients = {
  hero: "linear-gradient(135deg, oklch(0.12 0.01 240) 0%, oklch(0.09 0.01 240) 100%)",
  card: "linear-gradient(135deg, oklch(0.14 0.01 240) 0%, oklch(0.11 0.01 240) 100%)",
  primary: "linear-gradient(135deg, oklch(0.65 0.19 195) 0%, oklch(0.62 0.18 280) 100%)",
  accent: "linear-gradient(135deg, oklch(0.62 0.18 280) 0%, oklch(0.60 0.21 340) 100%)",
} as const;
