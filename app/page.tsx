"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, Sparkles, PieChart } from "lucide-react";
import AttendanceForm from "@/components/AttendanceForm";
import ClassReadiness from "@/components/ClassReadiness";
import ReportView from "@/components/ReportView";
import { cn } from "@/lib/utils";

type Tab = "attendance" | "readiness" | "reports";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("attendance");

  const tabs = [
    { id: "attendance", label: "Absensi", icon: ClipboardList },
    { id: "readiness", label: "Kesiapan", icon: Sparkles },
    { id: "reports", label: "Laporan", icon: PieChart },
  ] as const;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24 relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute left-[-20%] top-[-10%] h-96 w-96 rounded-full bg-emerald-200/40 blur-[100px] dark:bg-emerald-900/20" />
      <div className="pointer-events-none absolute right-[-20%] top-[20%] h-72 w-72 rounded-full bg-blue-200/40 blur-[80px] dark:bg-blue-900/20" />

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-8 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AttendanceForm />
            </motion.div>
          )}
          {activeTab === "readiness" && (
            <motion.div
              key="readiness"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClassReadiness />
            </motion.div>
          )}
          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReportView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Apple-style floating bottom navigation */}
      <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-[360px] -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full border border-white/20 bg-white/70 p-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/70">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-0 z-0 rounded-full bg-emerald-100 dark:bg-emerald-900/40"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
