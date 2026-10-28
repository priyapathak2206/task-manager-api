import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/tasks": "http://localhost:5000",
      "/auth": "http://localhost:5000",
      "/api": "http://localhost:5000",
      "/health": "http://localhost:5000",
    },
  },
});

