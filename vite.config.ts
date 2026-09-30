import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Self-hosted fonts from @fontsource get hashed file names at build time, so
 * they can't be preloaded from index.html by hand. Without a preload the
 * browser only discovers them once React has rendered text (after all JS has
 * run), which delays them by ~2s on mobile and makes the swap visible.
 * Only the latin subsets of the two families used above the fold everywhere
 * (body text + serif headings) are preloaded; latin-ext / italic still load
 * on demand through their unicode-range'd @font-face rules.
 */
const FONT_PRELOADS = [
  /\/ibm-plex-sans-latin-wght-normal-[\w-]+\.woff2$/,
  /\/playfair-display-latin-wght-normal-[\w-]+\.woff2$/,
];

function preloadFonts(): Plugin {
  return {
    name: "thesite:preload-fonts",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        if (!ctx.bundle) return;
        const files = Object.keys(ctx.bundle);
        return FONT_PRELOADS.map((pattern) => {
          const file = files.find((f) => pattern.test(`/${f}`));
          if (!file) throw new Error(`preloadFonts: no emitted font matches ${pattern}`);
          return {
            tag: "link",
            attrs: { rel: "preload", href: `/${file}`, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head" as const,
          };
        });
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), preloadFonts()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Strip console.log/warn in production — keep console.error for real failures
    drop: mode === "production" ? ["debugger"] : [],
    pure: mode === "production" ? ["console.log", "console.warn"] : [],
  },
  build: {
    // Target modern browsers — smaller, faster output
    target: "es2020",
    // Raise warning threshold slightly; big chunks are expected with many radix-ui deps
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, cached long-term
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // TanStack Query
          "vendor-query": ["@tanstack/react-query"],
          // All Radix-UI primitives bundled together
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          // Framer Motion is large — isolate so it can be cached independently
          "vendor-motion": ["framer-motion"],
          // Recharts / chart deps
          "vendor-charts": ["recharts"],
        },
      },
    },
  },
}));
