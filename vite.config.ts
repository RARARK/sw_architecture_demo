import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: env.GITHUB_PAGES === "true" || mode === "github-pages" ? "/sw_architecture_demo/" : "/",
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
