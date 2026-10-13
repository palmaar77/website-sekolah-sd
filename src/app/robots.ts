import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sdharapanbangsa.sch.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/api/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
