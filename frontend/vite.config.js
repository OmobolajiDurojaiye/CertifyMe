import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://certifyme.com.ng",
      // We will manually define the exact routes you want.
      routes: [
        { url: "/", priority: 1.0 },
        { url: "/signup", priority: 0.9 },
        { url: "/dashboard/create", priority: 0.8 },
        { url: "/dashboard/bulk-create", priority: 0.8 },
        { url: "/docs", priority: 0.7 },
      ],
    }),
  ],
});
