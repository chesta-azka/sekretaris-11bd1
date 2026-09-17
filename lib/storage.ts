export interface AttendanceRecord {
  id: string;
  studentId: string;
  status: "H" | "S" | "I" | "A";
  notes: string;
}

export interface DailyLog {
  id: string; // ISO Date String (e.g., 2026-09-17)
  date: string;
  records: AttendanceRecord[];
  kasTotal: number;
  submittedAt: string | null;
  submittedBy: string | null;
  isSynced: boolean;
}

export interface ReadinessLog {
  id: string; // ISO Date String
  cleanliness: boolean;
  markers: boolean;
  eraser: boolean;
  attributes: boolean;
  notes: string;
  submittedAt: string | null;
}

export const Storage = {
  getDailyLog(dateStr: string): DailyLog | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(`log_${dateStr}`);
    return data ? JSON.parse(data) : null;
  },
  
  saveDailyLog(log: DailyLog) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`log_${log.id}`, JSON.stringify(log));
  },
  
  getAllLogs(): DailyLog[] {
    if (typeof window === "undefined") return [];
    const logs: DailyLog[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("log_")) {
        logs.push(JSON.parse(localStorage.getItem(key)!));
      }
    }
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getReadinessLog(dateStr: string): ReadinessLog | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(`readiness_${dateStr}`);
    return data ? JSON.parse(data) : null;
  },
  
  saveReadinessLog(log: ReadinessLog) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`readiness_${log.id}`, JSON.stringify(log));
  },
};
