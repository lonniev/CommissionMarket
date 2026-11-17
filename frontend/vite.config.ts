import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { agentGuide } from '@tollbooth-dpyc/web/agent-guide'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

function resolveCommit(): string {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA.slice(0, 7)
  if (process.env.COMMIT_SHA) return process.env.COMMIT_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [
    react(), tailwindcss(),
    agentGuide({
      name: "CommissionMarket",
      summary: "Commissioned work paid in sats: both parties sign one offer under the Standard Terms, then a deposit, dated milestones and a graded award are each paid by Lightning invoice.",
      site: "https://commissionmarket.tollbooth-dpyc.com",
      mcpUrl: "https://taskbooth-mcp.fastmcp.app/mcp",
      toolPrefix: "taskbooth",
      source: "https://github.com/lonniev/CommissionMarket",
      registryName: "io.github.lonniev/taskbooth-mcp",
      body: "agent-guide.md",
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(resolveCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    allowedHosts: ['.ts.net'],
    proxy: {
      '/mcp': {
        target: 'https://taskbooth-mcp.fastmcp.app',
        changeOrigin: true,
        configure: (proxy) => proxy.on('proxyReq', (req) => {
          if (!req.getHeader('authorization')) req.setHeader('authorization', 'Bearer anonymous')
        }),
      },
    },
  },
  build: { outDir: 'dist' },
})
