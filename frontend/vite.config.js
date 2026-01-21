import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- IMPORT THIS

// --- THIS IS THE FIX for __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END OF FIX ---

const HOSTNAME = "https://proofdeck.app";
const ROUTES = [
  "/",
  "/signup",
  "/login",
  "/pricing",
  "/contact",
  "/search",
  "/verify",
  "/docs",
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "manual-sitemap-generator",
      enforce: "post",
      closeBundle() {
        const distPath = path.resolve(__dirname, "dist");
        const sitemapPath = path.resolve(distPath, "sitemap.xml");

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
        target: "http://1227.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
