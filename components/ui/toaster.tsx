"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ToastOptions {
  title: string;
  description?: string;
  icon?: "success" | "info" | "sparkles";
  durationMs?: number;
}

interface ToastRecord extends ToastOptions {
  id: number;
}

const ToastContext = createContext<(options: ToastOptions) => void>(() => {});

const ICONS = {
  success: CheckCircle2,
  info: Info,
  sparkles: Sparkles,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, ...options }]);
    const duration = options.durationMs ?? 3600;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-6 left-1/2 z-110 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.icon ?? "info"];
            return (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => dismiss(t.id)}
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "pointer-events-auto flex w-full items-start gap-3 rounded-2xl p-4 text-left glass-strong",
                  "shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    t.icon === "success" && "text-operational",
                    t.icon === "sparkles" && "text-gold",
                    (t.icon ?? "info") === "info" && "text-ion",
                  )}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-fg">{t.title}</span>
                  {t.description && <span className="text-xs text-muted">{t.description}</span>}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
