import "node:module";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
Object.create;
Object.defineProperty;
Object.getOwnPropertyDescriptor;
Object.getOwnPropertyNames;
Object.getPrototypeOf;
Object.prototype.hasOwnProperty;
//#endregion
//#region vite.config.ts
const __vite_injected_original_dirname = "/sessions/epic-beautiful-fermi/mnt/ClarStiri";
var vite_config_default = defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 8080
	},
	plugins: [react()],
	resolve: { alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") } },
	build: {
		target: "es2020",
		chunkSizeWarningLimit: 600,
		rollupOptions: { output: { manualChunks: {
			"vendor-react": [
				"react",
				"react-dom",
				"react-router-dom"
			],
			"vendor-query": ["@tanstack/react-query"],
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
			"vendor-motion": ["framer-motion"],
			"vendor-charts": ["recharts"]
		} } }
	}
}));
//#endregion
export { vite_config_default as default };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZS5jb25maWcuanMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL3Nlc3Npb25zL2VwaWMtYmVhdXRpZnVsLWZlcm1pL21udC9DbGFyU3Rpcmkvdml0ZS5jb25maWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMg4oCUIHNtYWxsZXIsIGZhc3RlciBvdXRwdXRcbiAgICB0YXJnZXQ6IFwiZXMyMDIwXCIsXG4gICAgLy8gUmFpc2Ugd2FybmluZyB0aHJlc2hvbGQgc2xpZ2h0bHk7IGJpZyBjaHVua3MgYXJlIGV4cGVjdGVkIHdpdGggbWFueSByYWRpeC11aSBkZXBzXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA2MDAsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIENvcmUgUmVhY3QgcnVudGltZSDigJQgdGlueSwgY2FjaGVkIGxvbmctdGVybVxuICAgICAgICAgIFwidmVuZG9yLXJlYWN0XCI6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICAvLyBUYW5TdGFjayBRdWVyeVxuICAgICAgICAgIFwidmVuZG9yLXF1ZXJ5XCI6IFtcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiXSxcbiAgICAgICAgICAvLyBBbGwgUmFkaXgtVUkgcHJpbWl0aXZlcyBidW5kbGVkIHRvZ2V0aGVyXG4gICAgICAgICAgXCJ2ZW5kb3ItcmFkaXhcIjogW1xuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtYWNjb3JkaW9uXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1hbGVydC1kaWFsb2dcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWF2YXRhclwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtY2hlY2tib3hcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWNvbGxhcHNpYmxlXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1jb250ZXh0LW1lbnVcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWRpYWxvZ1wiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudVwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtaG92ZXItY2FyZFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtbGFiZWxcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LW1lbnViYXJcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LW5hdmlnYXRpb24tbWVudVwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtcG9wb3ZlclwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtcHJvZ3Jlc3NcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXJhZGlvLWdyb3VwXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zY3JvbGwtYXJlYVwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0XCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1zZXBhcmF0b3JcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXNsaWRlclwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3Qtc2xvdFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3Qtc3dpdGNoXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC10YWJzXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC10b2FzdFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtdG9nZ2xlXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC10b2dnbGUtZ3JvdXBcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXBcIixcbiAgICAgICAgICBdLFxuICAgICAgICAgIC8vIEZyYW1lciBNb3Rpb24gaXMgbGFyZ2Ug4oCUIGlzb2xhdGUgc28gaXQgY2FuIGJlIGNhY2hlZCBpbmRlcGVuZGVudGx5XG4gICAgICAgICAgXCJ2ZW5kb3ItbW90aW9uXCI6IFtcImZyYW1lci1tb3Rpb25cIl0sXG4gICAgICAgICAgLy8gUmVjaGFydHMgLyBjaGFydCBkZXBzXG4gICAgICAgICAgXCJ2ZW5kb3ItY2hhcnRzXCI6IFtcInJlY2hhcnRzXCJdLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLG1DQUE2QjtBQUtuQyxJQUFBLHNCQUFlLGNBQWMsRUFBRSxZQUFZO0NBQ3pDLFFBQVE7RUFDTixNQUFNO0VBQ04sTUFBTTtFQUNQO0NBQ0QsU0FBUyxDQUFDLE9BQU8sQ0FBQztDQUNsQixTQUFTLEVBQ1AsT0FBTyxFQUNMLEtBQUssS0FBSyxRQUFBLGtDQUFtQixRQUFRLEVBQ3RDLEVBQ0Y7Q0FDRCxPQUFPO0VBRUwsUUFBUTtFQUVSLHVCQUF1QjtFQUN2QixlQUFlLEVBQ2IsUUFBUSxFQUNOLGNBQWM7R0FFWixnQkFBZ0I7SUFBQztJQUFTO0lBQWE7SUFBbUI7R0FFMUQsZ0JBQWdCLENBQUMsd0JBQXdCO0dBRXpDLGdCQUFnQjtJQUNkO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDRDtHQUVELGlCQUFpQixDQUFDLGdCQUFnQjtHQUVsQyxpQkFBaUIsQ0FBQyxXQUFXO0dBQzlCLEVBQ0YsRUFDRjtFQUNGO0NBQ0YsRUFBRSJ9