import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Las imágenes las guarda la API; se sirven desde el mismo origen de la web.
  async rewrites() {
    const api = process.env.API_URL ?? "http://localhost:3000";
    return [{ source: "/uploads/:archivo", destination: `${api}/uploads/:archivo` }];
  },
  // Hasta 5 imágenes de 5 MB por envío del formulario de lugares turísticos.
  experimental: {
    serverActions: { bodySizeLimit: "26mb" },
    proxyClientMaxBodySize: "26mb",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
