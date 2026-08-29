import { useEffect, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICON: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast ${toast.type}`} onClick={() => onDismiss(toast.id)}>
      <span className="toast-icon">{ICON[toast.type]}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  const dismiss = useCallback((id: string) => onDismiss(id), [onDismiss]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

// ── Hook to manage toasts ────────────────────────────────────────────────────
import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}
