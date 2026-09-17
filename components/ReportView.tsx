"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Download, MessageCircle, RefreshCcw, TrendingUp } from "lucide-react";
import { Storage, DailyLog } from "@/lib/storage";
import { STUDENTS_11_BD_1 } from "@/lib/students";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportView() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadData = () => {
    const allLogs = Storage.getAllLogs();
    setLogs(allLogs);

    // Process for chart (last 7 days)
    const recent = allLogs.slice(0, 7).reverse();
    const cData = recent.map(l => {
      let s = 0, i = 0, a = 0;
      l.records.forEach(r => {
        if (r.status === "S") s++;
        if (r.status === "I") i++;
        if (r.status === "A") a++;
      });
      return {
        name: format(new Date(l.date), "dd MMM", { locale: id }),
        Sakit: s,
        Izin: i,
        Alpa: a
      };
    });
    setChartData(cData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const downloadCSV = () => {
    if (logs.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Nama,Status,Catatan\n";

    logs.forEach(log => {
      log.records.forEach(r => {
        // Find student name
        const student = STUDENTS_11_BD_1.find(s => s.id === r.studentId);
        csvContent += `${log.date},"${student?.name}","${r.status}","${r.notes || "-"}"\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Absensi_11_BD_1_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV berhasil diunduh");
  };

  const copyToWA = async () => {
    if (logs.length === 0) {
      toast.error("Belum ada absen hari ini.");
      return;
    }
    const latest = logs[0]; // Most recent
    
    const sakitNames = latest.records.filter(r => r.status === "S").map(r => STUDENTS_11_BD_1.find(s => s.id === r.studentId)?.name).join(", ");
    const izinNames = latest.records.filter(r => r.status === "I").map(r => STUDENTS_11_BD_1.find(s => s.id === r.studentId)?.name).join(", ");
    const alpaNames = latest.records.filter(r => r.status === "A").map(r => STUDENTS_11_BD_1.find(s => s.id === r.studentId)?.name).join(", ");

    const text = `*Laporan Absensi Kelas 11 BD 1* 📝
🗓️ Tanggal: ${format(new Date(latest.date), "EEEE, dd MMMM yyyy", { locale: id })}

*Status Kehadiran:*
🤒 Sakit: ${sakitNames ? sakitNames.split(", ").length : 0} (${sakitNames || "Nihil"})
📩 Izin: ${izinNames ? izinNames.split(", ").length : 0} (${izinNames || "Nihil"})
❌ Alpa: ${alpaNames ? alpaNames.split(", ").length : 0} (${alpaNames || "Nihil"})

*💵 Uang Kas:* Rp ${latest.kasTotal.toLocaleString("id-ID")}

_Dilaporkan oleh: ${latest.submittedBy}_`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Format WhatsApp berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin teks");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Ringkasan & Ekspor Data.</p>
        </div>
        <button onClick={loadData} className="rounded-full bg-white p-2 shadow-sm border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800">
          <RefreshCcw className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
      </header>

      {/* Chart Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Tren Ketidakhadiran (7 Hari)</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Sakit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Izin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Alpa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={copyToWA}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 p-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Copy WA</span>
        </button>
        <button
          onClick={downloadCSV}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Download className="h-4 w-4" />
          <span>Ekspor CSV</span>
        </button>
      </div>

      {/* Audit Log (Riwayat) */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-zinc-100">Riwayat Pengiriman</h3>
        <div className="flex flex-col gap-3">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada riwayat.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{format(new Date(log.date), "dd MMMM yyyy", { locale: id })}</span>
                  <span className="text-xs text-slate-400">{log.isSynced ? "✅ Tersinkron" : "⏳ Offline"}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Total Kas: Rp {log.kasTotal.toLocaleString("id-ID")}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Dikirim: {log.submittedAt ? format(new Date(log.submittedAt), "HH:mm") : "-"}</span>
                  <span>•</span>
                  <span>Oleh: {log.submittedBy}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
