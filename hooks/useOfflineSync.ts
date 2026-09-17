import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { appendRow } from "@/lib/sheets";
import { getAccessToken } from "@/lib/firebase";

interface PendingAction {
  id: string;
  sheetId: string;
  sheetName: string;
  values: any[];
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("OFFLINE_QUEUE");
      if (stored) return JSON.parse(stored);
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    let successCount = 0;
    const remaining = [...pendingActions];

    for (let i = 0; i < pendingActions.length; i++) {
      const action = pendingActions[i];
      try {
        await appendRow(token, action.sheetId, action.sheetName, action.values);
        successCount++;
        remaining.shift();
      } catch (err) {
        console.error("Gagal sync offline item", err);
        break; // Stop on first failure to maintain order
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} data offline berhasil disinkronkan ke server.`);
      setPendingActions(remaining);
      localStorage.setItem("OFFLINE_QUEUE", JSON.stringify(remaining));
    }
  }, [pendingActions]);

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncOfflineData();
    }
  }, [isOnline, pendingActions, syncOfflineData]);

  const enqueueAction = (sheetId: string, sheetName: string, values: any[]) => {
    const newAction: PendingAction = {
      id: Math.random().toString(36).substr(2, 9),
      sheetId,
      sheetName,
      values,
      timestamp: Date.now(),
    };
    const newQueue = [...pendingActions, newAction];
    setPendingActions(newQueue);
    localStorage.setItem("OFFLINE_QUEUE", JSON.stringify(newQueue));
  };

  return { isOnline, pendingActions, enqueueAction };
}
