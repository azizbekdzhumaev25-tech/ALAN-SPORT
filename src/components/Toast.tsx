"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { IconCheck } from "./Icons";

type ToastItem = { id: number; text: string };

const ToastCtx = createContext<{ toast: (text: string) => void }>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((text: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev.slice(-2), { id, text }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-toast pointer-events-auto flex w-full items-center gap-3 border border-gold/50 bg-coal/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-gold text-coal">
              <IconCheck className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold text-white">{t.text}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
