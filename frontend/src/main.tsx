import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureTollbooth } from "@tollbooth-dpyc/web";
import { ErrorBoundary } from "@tollbooth-dpyc/web/react";
import App from "./App";
import { registerCommission } from "./i18n";
import "./index.css";

configureTollbooth({
  slug: "taskbooth",
  appName: "CommissionMarket",
  mcpUrl: import.meta.env.VITE_MCP_URL || "/mcp",
  operatorUrl: "https://taskbooth-mcp.fastmcp.app",
  // Public reading takes no npub, so none is sent: Bitcoin's price, and the Standard Terms.
  extraBootstrapTools: ["btc_price", "standard_terms", "reputation"],
});

void registerCommission();

const crash = {
  root: "flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center",
  title: "text-xl font-semibold",
  message: "max-w-md text-sm text-[var(--tb-muted)]",
  detail: "max-h-48 w-full max-w-md overflow-auto rounded-lg bg-[var(--tb-surface-2)] p-3 text-left font-mono text-xs",
  actions: "flex flex-wrap justify-center gap-2",
  chip: "chip",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary classNames={crash}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
