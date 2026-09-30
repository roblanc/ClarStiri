import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { installGlobalErrorHandlers } from "./lib/errorReporting";
import "./index.css";

installGlobalErrorHandlers();

// Outer boundary catches errors in the providers around the router;
// App.tsx has a per-route boundary for page errors.
createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);
