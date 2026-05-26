import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    base: mode === "github-pages" ? "/sw_architecture_demo/" : "/",
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: "index.html",
          admin: "admin.html",
          guest: "guest.html"
        }
      }
    },
    server: {
      port: 5173
    }
  };
});
