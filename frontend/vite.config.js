import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const HOSTNAME = "https://certifyme.com.ng";
const ROUTES = [
  "/",
  "/signup",
  "/login",
  "/dashboard",
  "/dashboard/create",
  "/dashboard/bulk-create",
  "/verify",
  "/docs",
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "manual-sitemap-generator",
      closeBundle() {
        const sitemapPath = path.resolve("dist", "sitemap.xml");

        const urls = ROUTES.map(
          (url) => `
  <url>
    <loc>${HOSTNAME}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
        ).join("\n");

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls}
</urlset>`;

        fs.writeFileSync(sitemapPath, sitemap.trim());
        console.log("✅ Custom sitemap generated successfully!");
      },
    },
  ],
});
