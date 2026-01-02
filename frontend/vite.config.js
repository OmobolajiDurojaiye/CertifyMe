import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const HOSTNAME = "https://certifyme.com.ng";
// Updated routes to include the new public pages
const ROUTES = [
  "/",
  "/signup",
  "/login",
  "/pricing", // Added
  "/contact", // Added
  "/search", // Added
  "/verify",
  "/docs",
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "manual-sitemap-generator",
      // --- THIS IS THE FIX ---
      // This ensures the plugin runs *after* the 'dist' directory is created.
      enforce: "post",
      // --- END OF FIX ---
      closeBundle() {
        const distPath = path.resolve(__dirname, "dist");
        const sitemapPath = path.resolve(distPath, "sitemap.xml");

        // Ensure the dist directory exists before writing to it
        if (!fs.existsSync(distPath)) {
          fs.mkdirSync(distPath, { recursive: true });
        }

        const urls = ROUTES.map(
          (url) => `
  <url>
    <loc>${HOSTNAME}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url === "/" ? "1.0" : "0.8"}</priority>
  </url>`
        ).join("\n");

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

        fs.writeFileSync(sitemapPath, sitemap.trim());
        console.log("✅ Custom sitemap generated successfully!");
      },
    },
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
