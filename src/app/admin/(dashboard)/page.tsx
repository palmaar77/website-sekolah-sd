"use client";

import * as React from "react";
import Link from "next/link";
import {
  Newspaper,
  Bell,
  Image as ImageIcon,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

interface StatsData {
  newsCount: number;
  announcementCount: number;
  galleryCount: number;
  teacherCount: number;
  ppdbTotal: number;
  ppdbPending: number;
  ppdbVerifying: number;
  ppdbAccepted: number;
  ppdbRejected: number;
  unreadMessages: number;
}

interface RecentPPDB {
  id: string;
  registrationNumber: string;
  fullName: string;
  path: string;
  status: "PENDING" | "VERIFYING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

interface ActivityLogItem {
  id: string;
  adminName: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [recentPPDB, setRecentPPDB] = React.useState<RecentPPDB[]>([]);
  const [recentLogs, setRecentLogs] = React.useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentPPDB(data.recentPPDB || []);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge variant="success">Diterima</Badge>;
      case "VERIFYING":
        return <Badge variant="warning">Sedang Diverifikasi</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Tidak Diterima</Badge>;
      default:
        return <Badge variant="info">Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ringkasan & Dasbor Sekolah
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau publikasi konten, dokumentasi kegiatan, dan proses PPDB secara terpadu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tulis Berita</span>
          </Link>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-l-4 border-l-blue-600 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Berita</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {stats?.newsCount ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Newspaper className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/berita" className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
              <span>Kelola Berita</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-slate-400">Publik & Draft</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengumuman Aktif</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {stats?.announcementCount ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Bell className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/pengumuman" className="text-amber-600 hover:underline font-semibold flex items-center gap-1">
              <span>Kelola Pengumuman</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-slate-400">Info Penting</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendaftar PPDB</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {stats?.ppdbTotal ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/ppdb" className="text-emerald-600 hover:underline font-semibold flex items-center gap-1">
              <span>Verifikasi Berkas</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-emerald-700 font-bold">{stats?.ppdbPending ?? 0} Perlu Tindakan</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Guru & Tenaga Didik</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {stats?.teacherCount ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link href="/admin/guru" className="text-purple-600 hover:underline font-semibold flex items-center gap-1">
              <span>Daftar Guru</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-slate-400">Aktif Mengajar</span>
          </div>
        </Card>
      </div>

      {/* PPDB Status Bar Summary */}
      <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <UserCheck className="h-4 w-4" />
              <span>Status PPDB 2025/2026 Terkini</span>
            </div>
            <h2 className="text-xl font-extrabold mt-1">Ringkasan Seleksi Penerimaan Siswa Baru</h2>
            <p className="text-xs text-blue-200 mt-1 max-w-xl">
              Seluruh pendaftar daring dapat diverifikasi kelengkapan berkasnya oleh tim verifikator panitia.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-[11px] text-blue-200 block font-medium">Menunggu</span>
              <span className="text-xl font-black text-white">{stats?.ppdbPending ?? 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-[11px] text-amber-300 block font-medium">Diverifikasi</span>
              <span className="text-xl font-black text-amber-400">{stats?.ppdbVerifying ?? 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-[11px] text-emerald-300 block font-medium">Diterima</span>
              <span className="text-xl font-black text-emerald-400">{stats?.ppdbAccepted ?? 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-[11px] text-rose-300 block font-medium">Tidak Diterima</span>
              <span className="text-xl font-black text-rose-400">{stats?.ppdbRejected ?? 0}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tables section: Recent PPDB & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent PPDB Applicants */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Pendaftar PPDB Terbaru
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Calon siswa yang baru saja mendaftar melalui website</p>
              </div>
              <Link
                href="/admin/ppdb"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentPPDB.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada pendaftar PPDB terbaru.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentPPDB.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 -mx-4 px-4 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {item.fullName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.registrationNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>Jalur: <strong className="text-slate-700">{item.path}</strong></span>
                          <span>•</span>
                          <span>{formatDateIndo(item.createdAt, true)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                        <Link
                          href={`/admin/ppdb?search=${item.registrationNumber}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Log Aktivitas Admin</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Catatan audit keamanan sistem</p>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Belum ada log aktivitas tercatat.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="text-xs border-l-2 border-slate-200 pl-3 py-0.5">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span className="font-semibold text-slate-700">{log.adminName}</span>
                        <span>{formatDateIndo(log.createdAt, true)}</span>
                      </div>
                      <p className="text-slate-800 font-medium mt-1 leading-snug">
                        {log.details}
                      </p>
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
