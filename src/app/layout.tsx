import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SD Negeri Harapan Bangsa",
    default: "SD Negeri Harapan Bangsa - Sekolah Ramah Anak Berkarakter Pancasila",
  },
  description:
    "Website resmi SD Negeri Harapan Bangsa. Institusi pendidikan dasar modern, unggul, ramah anak, dan berbudaya mutu dengan Kurikulum Merdeka di Indonesia.",
  keywords: [
    "Sekolah Dasar",
    "SD Negeri Harapan Bangsa",
    "PPDB SD 2025",
    "Kurikulum Merdeka",
    "Pendidikan Anak",
    "Sekolah Ramah Anak",
  ],
  authors: [{ name: "SD Negeri Harapan Bangsa" }],
  openGraph: {
    title: "SD Negeri Harapan Bangsa - Sekolah Ramah Anak Berkarakter Pancasila",
    description:
      "Institusi pendidikan dasar modern, ramah anak, dan berprestasi dengan penerapan Kurikulum Merdeka.",
    siteName: "SD Negeri Harapan Bangsa",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
