import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { host: true },
  base: "./",
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor")) return "charts";
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          if (id.includes("react-admin") || id.includes("ra-") || id.includes("@tanstack") || id.includes("react-hook-form")) return "admin";
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) return "react";
          return undefined;
        },
      },
    },
  },
});
