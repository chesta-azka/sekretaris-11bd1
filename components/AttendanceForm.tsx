"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, CheckCircle2, Save, MoreVertical, Wallet } from "lucide-react";
import { STUDENTS_11_BD_1, Student } from "@/lib/students";
import { Storage, AttendanceRecord, DailyLog } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "H" | "S" | "I" | "A";

export default function AttendanceForm() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, { status: Status; notes: string }>>({});
  const [kasTotal, setKasTotal] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  // Initialize defaults
  useEffect(() => {
    const existingLog = Storage.getDailyLog(selectedDate);

    if (existingLog) {
      const initial: Record<string, { status: Status; notes: string }> = {};
      existingLog.records.forEach((r) => {
        initial[r.studentId] = { status: r.status, notes: r.notes };
      });
      setRecords(initial);
      setKasTotal(existingLog.kasTotal || 0);
    } else {
      const initial: Record<string, { status: Status; notes: string }> = {};
      STUDENTS_11_BD_1.forEach((s) => {
        initial[s.id] = { status: "H", notes: "" };
      });
      setRecords(initial);
      setKasTotal(0);
    }
  }, [selectedDate]);

  const filteredStudents = useMemo(() => {
    return STUDENTS_11_BD_1.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleStatusChange = (id: string, status: Status) => {
    setRecords((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
  };

  const handleNoteChange = (id: string, notes: string) => {
    setRecords((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes },
    }));
  };

  const setAllHadir = () => {
    setRecords((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k].status = "H";
      });
      return updated;
    });
    toast.success("Semua siswa ditandai Hadir");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedRecords: AttendanceRecord[] = STUDENTS_11_BD_1.map((s) => ({
        id: crypto.randomUUID(),
        studentId: s.id,
        status: records[s.id]?.status || "H",
        notes: records[s.id]?.notes || "",
        studentName: s.name // Added for the mock sync payload
      })) as any;

      const log: DailyLog = {
        id: selectedDate,
        date: selectedDate,
        records: formattedRecords,
        kasTotal,
        submittedAt: new Date().toISOString(),
        submittedBy: "Sekretaris 11 BD 1",
        isSynced: false,
      };

      // Save to local storage (Offline Fallback)
      Storage.saveDailyLog(log);

      // Attempt to sync
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "attendance", payload: log }),
      });

      if (res.ok) {
        log.isSynced = true;
        Storage.saveDailyLog(log);
        toast.success("Absensi berhasil disimpan & disinkronkan!");
      } else {
        toast.warning("Tersimpan offline. Menunggu koneksi internet.");
      }
    } catch (error) {
      toast.warning("Tersimpan offline. Gagal sinkronisasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    H: { label: "Hadir", bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50 dark:bg-emerald-950/30" },
    S: { label: "Sakit", bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-50 dark:bg-blue-950/30" },
    I: { label: "Izin", bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50 dark:bg-amber-950/30" },
    A: { label: "Alpa", bg: "bg-rose-500", text: "text-rose-500", light: "bg-rose-50 dark:bg-rose-950/30" },
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Absensi 11 BD 1</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Pembaruan harian kehadiran kelas.</p>
      </header>

      {/* Sticky Search, Date & Actions */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-3 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:bg-zinc-950/80">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[140px] appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={setAllHadir}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-4 w-4" /> Set Semua Hadir
          </button>
          
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>{Object.values(records).filter(r => r.status === "H").length} Hadir</span>
            <span>•</span>
            <span>{STUDENTS_11_BD_1.length} Total</span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredStudents.map((student) => {
            const record = records[student.id];
            if (!record) return null;
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={student.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200/60 bg-white p-3 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{student.name}</span>
                    <span className="text-[10px] font-medium tracking-wider text-slate-400">
                      {student.gender === "L" ? "LAKI-LAKI" : "PEREMPUAN"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setExpandedNote(expandedNote === student.id ? null : student.id)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {(["H", "S", "I", "A"] as Status[]).map((st) => {
                    const isSelected = record.status === st;
                    const conf = statusConfig[st];
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(student.id, st)}
                        className={cn(
                          "flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all active:scale-95",
                          isSelected 
                            ? `${conf.bg} text-white shadow-md` 
                            : `bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700`
                        )}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {expandedNote === student.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="Tambahkan catatan khusus (misal: Dispen)..."
                        value={record.notes}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Class Cash Tracker */}
      <div className="rounded-2xl border border-slate-200 bg-emerald-50/50 p-4 dark:border-zinc-800 dark:bg-emerald-950/10">
        <div className="mb-2 flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
          <Wallet className="h-5 w-5" />
          <h3 className="font-semibold">Uang Kas Masuk Hari Ini</h3>
        </div>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">Rp</span>
          <input
            type="number"
            value={kasTotal || ""}
            onChange={(e) => setKasTotal(Number(e.target.value))}
            placeholder="0"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Submit Button */}
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
            <Save className="h-4 w-4" /> Simpan Data Absensi
          </>
        )}
      </button>
    </div>
  );
}
