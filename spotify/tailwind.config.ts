import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Base backgrounds ──────────────────────────────────────
        // ── spx-* tokens (canonical) ─────────────────────────────
        "spx-base":        "#121212",
        "spx-surface":     "#181818",
        "spx-elevated":    "#1f1f1f",
        "spx-card":        "#252525",
        "spx-card-alt":    "#272727",
        "spx-green":       "#1ed760",
        "spx-green-dark":  "#1db954",
        "spx-text":        "#ffffff",
        "spx-silver":      "#b3b3b3",
        "spx-near-white":  "#cbcbcb",
        "spx-light":       "#fdfdfd",
        "spx-negative":    "#f3727f",
        "spx-warning":     "#ffa42b",
        "spx-info":        "#539df5",
        "spx-border":      "#4d4d4d",
        "spx-border-lt":   "#7c7c7c",
        "spx-separator":   "#b3b3b3",
        "spx-light-surf":  "#eeeeee",

        // ── spotify-* aliases (match Stitch-generated HTML) ──────
        "spotify-base":    "#121212",
        "spotify-surface": "#181818",
        "spotify-elevated":"#1f1f1f",
        "spotify-card":    "#252525",
        "spotify-green":   "#1ed760",
        "spotify-silver":  "#b3b3b3",
        "spotify-border":  "#2a2a2a",
        "spotify-black":   "#000000",
      },

      fontFamily: {
        spotify: [
          "SpotifyMixUI",
          "CircularSp-Arab",
          "CircularSp-Hebr",
          "CircularSp-Cyrl",
          "CircularSp-Grek",
          "CircularSp-Deva",
          "Helvetica Neue",
          "helvetica",
          "arial",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "MS Gothic",
          "sans-serif",
        ],
        "spotify-title": [
          "SpotifyMixUITitle",
          "CircularSp-Arab",
          "CircularSp-Hebr",
          "CircularSp-Cyrl",
          "CircularSp-Grek",
          "CircularSp-Deva",
          "Helvetica Neue",
          "helvetica",
          "arial",
          "sans-serif",
        ],
      },

      fontSize: {
        "spx-micro":   ["10px",   { lineHeight: "normal", letterSpacing: "normal" }],
        "spx-badge":   ["10.5px", { lineHeight: "1.33",   letterSpacing: "normal" }],
        "spx-small":   ["12px",   { lineHeight: "1.5",    letterSpacing: "normal" }],
        "spx-caption": ["14px",   { lineHeight: "normal", letterSpacing: "normal" }],
        "spx-btn":     ["14px",   { lineHeight: "1",      letterSpacing: "0.14px" }],
        "spx-btn-up":  ["14px",   { lineHeight: "1",      letterSpacing: "1.4px"  }],
        "spx-body":    ["16px",   { lineHeight: "normal", letterSpacing: "normal" }],
        "spx-feature": ["18px",   { lineHeight: "1.3",    letterSpacing: "normal" }],
        "spx-title":   ["24px",   { lineHeight: "normal", letterSpacing: "normal" }],
      },

      borderRadius: {
        "spx-badge":   "2px",
        "spx-input":   "4px",
        "spx-card":    "6px",
        "spx-section": "8px",
        "spx-panel":   "10px",
        "spx-large":   "100px",
        "spx-pill":    "500px",
        "spx-full":    "9999px",
        "spx-circle":  "50%",
      },

      boxShadow: {
        "spx-heavy":      "rgba(0,0,0,0.5) 0px 8px 24px",
        "spx-medium":     "rgba(0,0,0,0.3) 0px 8px 8px",
        "spx-inset":      "rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset",
        // aliases matching Stitch HTML
        "spotify-heavy":  "rgba(0,0,0,0.5) 0px 8px 24px",
        "spotify-medium": "rgba(0,0,0,0.3) 0px 8px 8px",
      },

      spacing: {
        "1":  "1px",
        "2":  "2px",
        "3":  "3px",
        "4":  "4px",
        "5":  "5px",
        "6":  "6px",
        "8":  "8px",
        "10": "10px",
        "12": "12px",
        "14": "14px",
        "15": "15px",
        "16": "16px",
        "20": "20px",
        "24": "24px",
        "32": "32px",
        "40": "40px",
        "48": "48px",
        "56": "56px",
        "64": "64px",
        "96": "96px",
      },

      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.3)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer:   "shimmer 1.5s infinite linear",
        heartbeat: "heartbeat 0.3s ease",
        fadeUp:    "fadeUp 0.25s ease forwards",
        scaleIn:   "scaleIn 0.15s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
