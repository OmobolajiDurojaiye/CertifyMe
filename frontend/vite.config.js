import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://certifyme.com.ng",
      // Exclude protected/dynamic routes that are not useful for SEO
      exclude: [
        "/dashboard",
        "/admin",
        "/reset-password/*",
        "/verify/*",
        "/edit/*",
        "/view/*",
        "/support/*",
      ],
      // Manually define routes with their priorities for better SEO control
      routes: [
        { url: "/", priority: 1.0 },
        { url: "/verify", priority: 0.9 },
        { url: "/login", priority: 0.8 },
        { url: "/signup", priority: 0.8 },
        { url: "/docs", priority: 0.7 },
        { url: "/forgot-password", priority: 0.6 },
      ],
    }),
  ],
});
