"use client";

import * as React from "react";
import { Mail, CheckCircle, Trash2, ExternalLink, Clock, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateIndo } from "@/lib/utils";

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = React.useState<ContactMsg[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pesan ini?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchMessages();
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Pesan Masuk dari Masyarakat
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pertanyaan, konsultasi, dan aspirasi dari orang tua murid melalui formulir kontak.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat pesan masuk...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-100">
            Belum ada pesan masuk.
          </div>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg.id}
              className={`p-5 transition-all ${
                !msg.isRead ? "border-l-4 border-l-blue-600 bg-blue-50/20" : "bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!msg.isRead ? (
                      <Badge variant="info">Pesan Baru</Badge>
                    ) : (
                      <Badge variant="outline">Sudah Dibaca</Badge>
                    )}
                    <span className="text-xs font-bold text-slate-900">{msg.name}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{msg.email}</span>
                    {msg.phone && (
                      <>
                        <span className="text-xs text-slate-400">•</span>
                        <a
                          href={`https://wa.me/${msg.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{msg.phone}</span>
                        </a>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{msg.subject}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {msg.message}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Diterima pada: {formatDateIndo(msg.createdAt, true)}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRead(msg.id, msg.isRead)}
                    className="text-xs"
                  >
                    {msg.isRead ? "Tandai Belum Dibaca" : "Tandai Selesai Dibaca"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(msg.id)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
