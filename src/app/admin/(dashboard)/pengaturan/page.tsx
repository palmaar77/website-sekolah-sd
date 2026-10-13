"use client";

import * as React from "react";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Clock, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateIndo } from "@/lib/utils";

interface LogItem {
  id: string;
  adminName: string;
  action: string;
  details: string;
  ipAddress: string | null;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [logs, setLogs] = React.useState<LogItem[]>([]);
  const [adminUser, setAdminUser] = React.useState<{ name: string; email: string; role: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAdminUser(data.user);
      });

    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.recentLogs || []);
      });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password baru minimal 8 karakter.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Kata sandi berhasil diperbarui dengan aman.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(data.message || "Gagal mengubah kata sandi.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Akun & Log Keamanan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola kredensial akun administrator dan pantau riwayat audit sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Ganti Password */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Profil Administrator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Nama Petugas:</span>
                <span className="font-bold text-slate-900">{adminUser?.name || "Administrator"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Email Akun:</span>
                <span className="font-mono text-slate-900">{adminUser?.email || "-"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Hak Akses:</span>
                <span className="font-bold text-blue-600">{adminUser?.role || "SUPER_ADMIN"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-500" />
                <span>Perbarui Kata Sandi Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input
                  label="Password Saat Ini"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="Password Baru"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                />
                <Input
                  label="Konfirmasi Password Baru"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru..."
                />
                <div className="pt-2">
                  <Button type="submit" variant="primary" isLoading={isSaving} className="w-full">
                    Simpan Password Baru
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-500" />
                <span>Audit Trail & Riwayat Aktivitas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Belum ada aktivitas tercatat.</div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-400 font-mono">
                          {formatDateIndo(log.createdAt, true)}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">{log.details}</p>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Oleh: {log.adminName} {log.ipAddress ? `• IP: ${log.ipAddress}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
