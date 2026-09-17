"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, Check, ShieldCheck } from "lucide-react";
import { Storage, ReadinessLog } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClassReadiness() {
  const [cleanliness, setCleanliness] = useState(false);
  const [markers, setMarkers] = useState(false);
  const [eraser, setEraser] = useState(false);
  const [attributes, setAttributes] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const log = Storage.getReadinessLog(todayStr);
    if (log) {
      setCleanliness(log.cleanliness);
      setMarkers(log.markers);
      setEraser(log.eraser);
      setAttributes(log.attributes);
      setNotes(log.notes);
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      
      const log: ReadinessLog = {
        id: todayStr,
        cleanliness,
        markers,
        eraser,
        attributes,
        notes,
        submittedAt: today.toISOString(),
      };

      Storage.saveReadinessLog(log);

      // Sync
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "readiness", payload: { date: todayStr, ...log } }),
      });

      if (res.ok) {
        toast.success("Ceklis Kesiapan berhasil disimpan!");
      } else {
        toast.warning("Tersimpan offline.");
      }
    } catch (error) {
      toast.warning("Tersimpan offline. Gagal sinkronisasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checks = [
    { id: "clean", label: "Kebersihan Kelas", desc: "Lantai disapu, sampah dibuang", state: cleanliness, setter: setCleanliness },
    { id: "markers", label: "Spidol Tersedia", desc: "Minimal 2 warna spidol papan tulis", state: markers, setter: setMarkers },
    { id: "eraser", label: "Penghapus Papan", desc: "Bersih dan siap pakai", state: eraser, setter: setEraser },
    { id: "attr", label: "Atribut Kelas", desc: "AC nyala, taplak meja rapi", state: attributes, setter: setAttributes },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Kesiapan Kelas</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Pastikan kelas siap sebelum KBM.</p>
      </header>

      <div className="grid gap-3">
        {checks.map((item) => (
          <div
            key={item.id}
            onClick={() => item.setter(!item.state)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all active:scale-95",
              item.state
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10"
                : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50"
            )}
          >
            <div className="flex flex-col">
              <span className={cn("font-medium", item.state ? "text-emerald-900 dark:text-emerald-300" : "")}>
                {item.label}
              </span>
              <span className="text-xs text-slate-500">{item.desc}</span>
            </div>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                item.state
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 dark:border-zinc-700"
              )}
            >
              <Check className={cn("h-4 w-4", item.state ? "opacity-100" : "opacity-0")} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Catatan Tambahan</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ada sarana prasarana yang rusak? Tulis di sini..."
          className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900"
          />
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" /> Simpan Laporan
          </>
        )}
      </button>
    </div>
  );
}
