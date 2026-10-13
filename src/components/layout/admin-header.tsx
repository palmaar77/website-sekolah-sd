"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState<{ name: string; email: string; role: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari panel admin?")) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          Admin Portal v1.0
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200 font-bold text-xs">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-none">
              {adminUser?.name || "Administrator"}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>{adminUser?.role || "SUPER_ADMIN"}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer"
          title="Keluar dari akun admin"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
