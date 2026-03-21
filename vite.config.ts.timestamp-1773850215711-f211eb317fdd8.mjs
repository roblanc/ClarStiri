// vite.config.ts
import { defineConfig } from "file:///sessions/epic-beautiful-fermi/mnt/ClarStiri/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/epic-beautiful-fermi/mnt/ClarStiri/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "/sessions/epic-beautiful-fermi/mnt/ClarStiri";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
            "@radix-ui/react-tooltip"
          ],
          // Framer Motion is large — isolate so it can be cached independently
          "vendor-motion": ["framer-motion"],
          // Recharts / chart deps
          "vendor-charts": ["recharts"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvZXBpYy1iZWF1dGlmdWwtZmVybWkvbW50L0NsYXJTdGlyaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Nlc3Npb25zL2VwaWMtYmVhdXRpZnVsLWZlcm1pL21udC9DbGFyU3Rpcmkvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Nlc3Npb25zL2VwaWMtYmVhdXRpZnVsLWZlcm1pL21udC9DbGFyU3Rpcmkvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgfSxcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gVGFyZ2V0IG1vZGVybiBicm93c2VycyBcdTIwMTQgc21hbGxlciwgZmFzdGVyIG91dHB1dFxuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICAvLyBSYWlzZSB3YXJuaW5nIHRocmVzaG9sZCBzbGlnaHRseTsgYmlnIGNodW5rcyBhcmUgZXhwZWN0ZWQgd2l0aCBtYW55IHJhZGl4LXVpIGRlcHNcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gQ29yZSBSZWFjdCBydW50aW1lIFx1MjAxNCB0aW55LCBjYWNoZWQgbG9uZy10ZXJtXG4gICAgICAgICAgXCJ2ZW5kb3ItcmVhY3RcIjogW1wicmVhY3RcIiwgXCJyZWFjdC1kb21cIiwgXCJyZWFjdC1yb3V0ZXItZG9tXCJdLFxuICAgICAgICAgIC8vIFRhblN0YWNrIFF1ZXJ5XG4gICAgICAgICAgXCJ2ZW5kb3ItcXVlcnlcIjogW1wiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCJdLFxuICAgICAgICAgIC8vIEFsbCBSYWRpeC1VSSBwcmltaXRpdmVzIGJ1bmRsZWQgdG9nZXRoZXJcbiAgICAgICAgICBcInZlbmRvci1yYWRpeFwiOiBbXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1hY2NvcmRpb25cIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWFsZXJ0LWRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtYXZhdGFyXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1jaGVja2JveFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtY29sbGFwc2libGVcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWNvbnRleHQtbWVudVwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtZGlhbG9nXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1ob3Zlci1jYXJkXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1sYWJlbFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtbWVudWJhclwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtbmF2aWdhdGlvbi1tZW51XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1wb3BvdmVyXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1wcm9ncmVzc1wiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtcmFkaW8tZ3JvdXBcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXNjcm9sbC1hcmVhXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zZWxlY3RcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXNlcGFyYXRvclwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2xpZGVyXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zbG90XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zd2l0Y2hcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRhYnNcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvYXN0XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC10b2dnbGVcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvZ2dsZS1ncm91cFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtdG9vbHRpcFwiLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgLy8gRnJhbWVyIE1vdGlvbiBpcyBsYXJnZSBcdTIwMTQgaXNvbGF0ZSBzbyBpdCBjYW4gYmUgY2FjaGVkIGluZGVwZW5kZW50bHlcbiAgICAgICAgICBcInZlbmRvci1tb3Rpb25cIjogW1wiZnJhbWVyLW1vdGlvblwiXSxcbiAgICAgICAgICAvLyBSZWNoYXJ0cyAvIGNoYXJ0IGRlcHNcbiAgICAgICAgICBcInZlbmRvci1jaGFydHNcIjogW1wicmVjaGFydHNcIl0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNULFNBQVMsb0JBQW9CO0FBQ25WLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBO0FBQUEsSUFFUix1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQTtBQUFBLFVBRXpELGdCQUFnQixDQUFDLHVCQUF1QjtBQUFBO0FBQUEsVUFFeEMsZ0JBQWdCO0FBQUEsWUFDZDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUVBLGlCQUFpQixDQUFDLGVBQWU7QUFBQTtBQUFBLFVBRWpDLGlCQUFpQixDQUFDLFVBQVU7QUFBQSxRQUM5QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
