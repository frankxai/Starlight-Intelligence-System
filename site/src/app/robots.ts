import type { MetadataRoute } from "next";

const HOST = "https://starlightintelligence.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/internal/"],
      },
    ],
    sitemap: `${HOST}/sitemap.xml`,
    host: HOST,
  };
}
