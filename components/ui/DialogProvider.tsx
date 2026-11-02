'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

export interface DialogOptions {
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (options: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
};

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<DialogOptions>({
    title: '',
    message: '',
  });

  const resolverRef = useRef<((value: any) => void) | null>(null);

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    setCurrentOptions(options);
    setIsConfirm(true);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const alert = useCallback(
    (options: Omit<DialogOptions, 'cancelText'>): Promise<void> => {
      setCurrentOptions({ ...options, cancelText: undefined });
      setIsConfirm(false);
      setIsOpen(true);

      return new Promise<void>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    []
  );

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(isConfirm ? false : undefined);
      resolverRef.current = null;
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirm]);

  const dialogType = currentOptions.type || 'info';

  const getTypeStyles = () => {
    switch (dialogType) {
      case 'danger':
        return {
          iconBg: 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-900/60',
          iconColor: 'text-rose-600 dark:text-rose-400',
          defaultIcon: Trash2,
          confirmBtn:
            'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/30',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60',
          iconColor: 'text-amber-600 dark:text-amber-400',
          defaultIcon: AlertTriangle,
          confirmBtn:
            'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/30',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-900/60',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          defaultIcon: CheckCircle2,
          confirmBtn:
            'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/30',
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60',
          iconColor: 'text-blue-600 dark:text-blue-400',
          defaultIcon: Info,
          confirmBtn:
            'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white focus:ring-zinc-500/30',
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = currentOptions.icon || styles.defaultIcon;

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Modern Pop-up Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            // Close if clicking outside the card
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-150 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button (X) */}
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-3.5 right-3.5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
              aria-label="Tutup dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with Semantic Icon */}
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              <div className="flex-1 pr-6">
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {currentOptions.title}
                </h3>
                <div className="mt-1 text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                  {currentOptions.message}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
              {isConfirm && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/60 transition"
                >
                  {currentOptions.cancelText || 'Batal'}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={handleConfirm}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-98 shadow-xs ${styles.confirmBtn}`}
              >
                {currentOptions.confirmText || (isConfirm ? 'Lanjutkan' : 'Mengerti')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

