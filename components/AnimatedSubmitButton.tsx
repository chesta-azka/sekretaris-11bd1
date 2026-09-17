import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onClick: () => Promise<void>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AnimatedSubmitButton({ onClick, disabled, label = "Submit", className }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = async () => {
    if (status === "loading" || status === "success" || disabled) return;
    setStatus("loading");
    try {
      await onClick();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2500); // Reset after 2.5s
    } catch (error) {
      setStatus("idle"); // reset on error
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === "loading"}
      className={cn(
        "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl p-4 text-sm font-medium text-white shadow-sm transition-all active:scale-95 disabled:opacity-50",
        status === "success" ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>{label}</span>
          </motion.div>
        )}
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <span>Menyimpan...</span>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span>Berhasil!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
