import type { Config } from "tailwindcss";

/**
 * Plusmark design system.
 *
 * Semantic tokens (page, surface, ink, muted, line, primary, shell, scrim…)
 * are owned by the theme layer in globals.css. Components consume the
 * semantic names. The legacy palette names (canvas, sand, navy, blue, brand,
 * terra, hair) are kept as aliases so older markup inherits the same values.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--c-bg) / <alpha-value>)",
        canvas: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        subtle: "rgb(var(--c-surface-muted) / <alpha-value>)",
        sunken: "rgb(var(--c-sunken) / <alpha-value>)",
        sand: {
          DEFAULT: "rgb(var(--c-surface-muted) / <alpha-value>)",
          deep: "rgb(var(--c-sunken) / <alpha-value>)"
        },
        ink: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          soft: "rgb(var(--c-text) / <alpha-value>)"
        },
        muted: "rgb(var(--c-text-muted) / <alpha-value>)",
        graphite: {
          DEFAULT: "rgb(var(--c-text-muted) / <alpha-value>)",
          light: "rgb(var(--c-text-muted) / <alpha-value>)"
        },
        primary: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          strong: "rgb(var(--c-primary-strong) / <alpha-value>)",
          soft: "rgb(var(--c-primary-soft) / <alpha-value>)"
        },
        onprimary: "rgb(var(--c-on-primary) / <alpha-value>)",
        navy: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          deep: "rgb(var(--c-text) / <alpha-value>)",
          wash: "rgb(var(--c-primary-soft) / <alpha-value>)"
        },
        blue: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          deep: "rgb(var(--c-primary-strong) / <alpha-value>)",
          wash: "rgb(var(--c-primary-soft) / <alpha-value>)"
        },
        brand: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          deep: "rgb(var(--c-primary-strong) / <alpha-value>)",
          wash: "rgb(var(--c-primary-soft) / <alpha-value>)"
        },
        shell: {
          DEFAULT: "rgb(var(--c-shell) / <alpha-value>)",
          on: "rgb(var(--c-on-shell) / <alpha-value>)"
        },
        scrim: "rgb(var(--c-scrim) / <alpha-value>)",
        terra: {
          DEFAULT: "rgb(var(--c-rating) / <alpha-value>)",
          deep: "rgb(var(--c-rating) / <alpha-value>)",
          wash: "rgb(var(--c-warning-soft) / <alpha-value>)"
        },
        rating: "rgb(var(--c-rating) / <alpha-value>)",
        hair: {
          DEFAULT: "rgb(var(--c-border) / <alpha-value>)",
          strong: "rgb(var(--c-border-strong) / <alpha-value>)"
        },
        line: {
          DEFAULT: "rgb(var(--c-border) / <alpha-value>)",
          strong: "rgb(var(--c-border-strong) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          wash: "rgb(var(--c-danger-soft) / <alpha-value>)",
          soft: "rgb(var(--c-danger-soft) / <alpha-value>)"
        },
        success: {
          DEFAULT: "rgb(var(--c-success) / <alpha-value>)",
          wash: "rgb(var(--c-success-soft) / <alpha-value>)",
          soft: "rgb(var(--c-success-soft) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "rgb(var(--c-warning) / <alpha-value>)",
          wash: "rgb(var(--c-warning-soft) / <alpha-value>)",
          soft: "rgb(var(--c-warning-soft) / <alpha-value>)"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      fontSize: {
        display: ["clamp(3.5rem, 7vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(2.75rem, 5vw, 4rem)", { lineHeight: "1.06", letterSpacing: "-0.025em" }],
        h1: ["clamp(2.25rem, 4vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.75rem, 2.6vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h4: ["1.0625rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6" }],
        caption: ["0.8125rem", { lineHeight: "1.5" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        price: ["1.375rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "price-xl": ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }]
      },
      spacing: {
        "4xs": "0.125rem",
        "2xs": "0.25rem",
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
        "4xl": "6rem",
        "5xl": "8rem"
      },
      borderRadius: {
        none: "0",
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--c-shadow) / 0.05), 0 12px 32px -24px rgb(var(--c-shadow) / 0.12)",
        lift: "0 12px 32px -8px rgb(var(--c-shadow) / 0.12)",
        drawer: "0 24px 64px -12px rgb(var(--c-shadow) / 0.24)"
      },
      transitionDuration: {
        DEFAULT: "200ms"
      },
      maxWidth: {
        reading: "44rem",
        page: "80rem"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" }
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "fade-up": "fade-up 420ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slide-in-right 260ms cubic-bezier(0.16,1,0.3,1) both",
        "slide-up": "slide-up 240ms cubic-bezier(0.16,1,0.3,1) both"
      }
    }
  },
  plugins: []
};

export default config;
