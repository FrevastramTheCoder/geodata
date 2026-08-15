import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 5173,
    },
  },
});
