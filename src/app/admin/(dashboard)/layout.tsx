import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-Side Authorization Check (Defense-in-Depth)
  // Menjamin halaman admin tidak bisa dirender sama sekali tanpa sesi admin yang valid
  const session = await getSession();

  if (!session || !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
