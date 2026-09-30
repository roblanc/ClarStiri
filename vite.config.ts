import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Fills the `/*HOME_ROUTE_CHUNKS*\/[]` placeholder of the inline script in
 * index.html with the homepage route chunk (pages/Index.tsx) and the chunks it
 * statically imports, minus what the entry already modulepreloads. The inline
 * script only preloads them on "/" so other routes don't pay for them.
 */
function preloadHomeRoute(): Plugin {
  const placeholder = "/*HOME_ROUTE_CHUNKS*/[]";
  return {
    name: "thesite:preload-home-route",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        if (!html.includes(placeholder)) throw new Error("preloadHomeRoute: placeholder missing in index.html");

        const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
        const byFile = new Map(chunks.map((c) => [c.fileName, c]));
        const collect = (fileName: string, into: Set<string>) => {
          if (into.has(fileName)) return;
          into.add(fileName);
          const chunk = byFile.get(fileName);
          if (chunk && chunk.type === "chunk") chunk.imports.forEach((f) => collect(f, into));
        };

        const entry = chunks.find((c) => c.type === "chunk" && c.isEntry);
        const home = chunks.find(
          (c) => c.type === "chunk" && c.facadeModuleId?.replace(/\\/g, "/").endsWith("/src/pages/Index.tsx"),
        );
        if (!entry || !home) throw new Error("preloadHomeRoute: entry or pages/Index.tsx chunk not found");

        const alreadyLoaded = new Set<string>();
        collect(entry.fileName, alreadyLoaded);
        const homeFiles = new Set<string>();
        collect(home.fileName, homeFiles);
        const extra = [...homeFiles].filter((f) => !alreadyLoaded.has(f)).map((f) => `/${f}`);

        return html.replace(placeholder, JSON.stringify(extra));
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
  plugins: [react(), preloadHomeRoute()],
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
    // Raise warning threshold slightly (the lazily loaded archive JSON chunks are big)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Only long-lived vendor code that every page needs gets a named chunk.
        // Everything else (Radix primitives, page-specific libs) is left to
        // Rollup so each route only downloads what it imports — a single
        // "vendor-radix" chunk used to put ~33 KB gz on every page.
        manualChunks: {
          // Core React runtime — tiny, cached long-term
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // TanStack Query
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
}));
