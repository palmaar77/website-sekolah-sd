import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sdharapanbangsa.sch.id";

  const staticPages = [
    "",
    "/profil",
    "/akademik",
    "/berita",
    "/pengumuman",
    "/galeri",
    "/ppdb",
    "/ppdb/daftar",
    "/ppdb/status",
    "/kontak",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/ppdb") ? 0.9 : 0.8,
  }));

  try {
    const publishedNews = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      take: 50,
    });

    const newsUrls = publishedNews.map((n) => ({
      url: `${baseUrl}/berita/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...newsUrls];
  } catch {
    return staticPages;
  }
}
