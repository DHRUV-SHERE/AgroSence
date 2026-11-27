import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Build notes:
// - Route-level code splitting happens in src/App.jsx (React.lazy).
// - Vendor chunks are split so the shell caches well between deploys.
// - Hashed filenames => safe to cache forever (see vercel.json).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // Optional: set VITE_DEV_PROXY=true and leave VITE_API_URL empty to call /api on the same origin.
      proxy:
        env.VITE_DEV_PROXY === 'true'
          ? { '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } }
          : undefined,
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
            if (/node_modules\/(react-router|react-router-dom|@remix-run)\//.test(id)) return 'router'
            if (/node_modules\/react-icons\//.test(id)) return 'icons'
            if (/node_modules\/axios\//.test(id)) return 'http'
          },
        },
      },
    },
  }
})
