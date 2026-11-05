import type { Config } from "tailwindcss";

/**
 * Plusmark design system.
 *
 * Every colour is a CSS variable so the storefront can switch between the
 * three client-review palettes (clean-retail, premium-corporate, warm-modern)
 * without touching a component. Defaults live in globals.css under :root.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        sand: {
          DEFAULT: "rgb(var(--c-sand) / <alpha-value>)",
          deep: "rgb(var(--c-sand-deep) / <alpha-value>)"
        },
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          soft: "rgb(var(--c-ink-soft) / <alpha-value>)"
        },
        graphite: {
          DEFAULT: "rgb(var(--c-graphite) / <alpha-value>)",
          light: "rgb(var(--c-graphite-light) / <alpha-value>)"
        },
        navy: {
          DEFAULT: "rgb(var(--c-navy) / <alpha-value>)",
          deep: "rgb(var(--c-navy-deep) / <alpha-value>)",
          wash: "rgb(var(--c-navy-wash) / <alpha-value>)"
        },
        blue: {
          DEFAULT: "rgb(var(--c-blue) / <alpha-value>)",
          deep: "rgb(var(--c-blue-deep) / <alpha-value>)",
          wash: "rgb(var(--c-blue-wash) / <alpha-value>)"
        },
        brand: {
          DEFAULT: "rgb(var(--c-brand) / <alpha-value>)",
          deep: "rgb(var(--c-brand-deep) / <alpha-value>)",
          wash: "rgb(var(--c-brand-wash) / <alpha-value>)"
        },
        terra: {
          DEFAULT: "rgb(var(--c-terra) / <alpha-value>)",
          deep: "rgb(var(--c-terra-deep) / <alpha-value>)",
          wash: "rgb(var(--c-terra-wash) / <alpha-value>)"
        },
        hair: {
          DEFAULT: "rgb(var(--c-hair) / <alpha-value>)",
          strong: "rgb(var(--c-hair-strong) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          wash: "rgb(var(--c-danger-wash) / <alpha-value>)"
        },
        success: {
          DEFAULT: "rgb(var(--c-success) / <alpha-value>)",
          wash: "rgb(var(--c-success-wash) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "rgb(var(--c-warning) / <alpha-value>)",
          wash: "rgb(var(--c-warning-wash) / <alpha-value>)"
        }
      },
      fontFamily: {
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      fontSize: {
        display: ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.06", letterSpacing: "-0.015em" }],
        h1: ["clamp(2rem, 3.5vw, 3rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        h2: ["clamp(1.5rem, 2.4vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        h4: ["1.0625rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.65" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.6" }],
        caption: ["0.8125rem", { lineHeight: "1.5" }],
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
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
        xs: "2px",
        sm: "3px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
        "3xl": "18px"
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--c-shadow) / 0.06)",
        lift: "0 12px 32px -16px rgb(var(--c-shadow) / 0.20)",
        drawer: "-24px 0 48px -24px rgb(var(--c-shadow) / 0.24)"
      },
      transitionDuration: {
        DEFAULT: "200ms"
      },
      maxWidth: {
        reading: "68ch",
        page: "84rem"
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
