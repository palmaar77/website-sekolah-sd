"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
        <AlertCircle className="h-9 w-9" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Terjadi Kendala Teknis</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
        Sistem sedang mengalami sedikit hambatan. Silakan muat ulang halaman atau kembali ke beranda utama.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Coba Muat Ulang</span>
        </Button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm"
        >
          <Home className="h-4 w-4" />
          <span>Ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
