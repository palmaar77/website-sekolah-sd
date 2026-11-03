import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FloatingWhatsApp } from "@/components/ui/floating-whatsapp";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 lg:pb-0 transition-colors">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FloatingWhatsApp />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

