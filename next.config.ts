import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // The dev server is bound to 0.0.0.0. Browsers that open it as 127.0.0.1
  // send that host as the websocket Origin, and Next blocks it unless listed.
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/drillbook_compose.zip",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="drillbook_compose.zip"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
