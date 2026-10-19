import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', durationMs = 4000) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none transition-all"
      >
        {toasts.map((toast) => {
          let Icon = Info;
          let colorStyle = 'border-border bg-card text-card-foreground shadow-lg';
          let iconColor = 'text-foreground';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            colorStyle = 'border-emerald-500/40 bg-card text-card-foreground shadow-lg dark:border-emerald-500/30';
            iconColor = 'text-emerald-600 dark:text-emerald-400';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            colorStyle = 'border-red-500/40 bg-card text-card-foreground shadow-lg dark:border-red-500/30';
            iconColor = 'text-red-600 dark:text-red-400';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            colorStyle = 'border-amber-500/40 bg-card text-card-foreground shadow-lg dark:border-amber-500/30';
            iconColor = 'text-amber-600 dark:text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${colorStyle} backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
              role="alert"
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-medium leading-relaxed break-words">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside of ToastProvider
    return {
      showToast: (msg, type = 'info') => {
        console.log(`[Toast ${type}]: ${msg}`);
      },
      removeToast: () => {},
    };
  }
  return context;
}
