'use client';

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'order';

export interface ToastAlert {
  id?: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number; // ms, default 4000 (0 means persistent)
}

interface ToastCardProps {
  alert: ToastAlert;
  onClose: () => void;
  position?: 'bottom-right' | 'top-right' | 'top-center' | 'bottom-center';
}

const TYPE_CONFIGS: Record<
  AlertType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgLight: string;
    border: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
    defaultTitle: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bgLight: 'bg-white/95 dark:bg-zinc-900/95',
    border: 'border-emerald-200/90 dark:border-emerald-900/70',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    defaultTitle: 'Berhasil!',
  },
  error: {
    icon: AlertCircle,
    bgLight: 'bg-white/95 dark:bg-zinc-900/95',
    border: 'border-rose-200/90 dark:border-rose-900/70',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
    textColor: 'text-rose-900 dark:text-rose-200',
    defaultTitle: 'Terjadi Kendala',
  },
  warning: {
    icon: AlertTriangle,
    bgLight: 'bg-white/95 dark:bg-zinc-900/95',
    border: 'border-amber-200/90 dark:border-amber-900/70',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-900 dark:text-amber-200',
    defaultTitle: 'Perhatian',
  },
  info: {
    icon: Info,
    bgLight: 'bg-white/95 dark:bg-zinc-900/95',
    border: 'border-blue-200/90 dark:border-blue-900/70',
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-200',
    defaultTitle: 'Informasi',
  },
  order: {
    icon: Bell,
    bgLight: 'bg-white/95 dark:bg-zinc-900/95',
    border: 'border-blue-300 dark:border-blue-800',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    textColor: 'text-zinc-900 dark:text-zinc-100',
    defaultTitle: 'Pesanan Baru Masuk!',
  },
};

export default function ToastCard({
  alert,
  onClose,
  position = 'bottom-right',
}: ToastCardProps) {
  const config = TYPE_CONFIGS[alert.type] || TYPE_CONFIGS.info;
  const Icon = config.icon;

  useEffect(() => {
    const duration = alert.duration ?? 4000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  const positionClasses = {
    'bottom-right': 'bottom-20 md:bottom-8 right-4 sm:right-8',
    'top-right': 'top-20 md:top-8 right-4 sm:right-8',
    'top-center': 'top-6 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-20 md:bottom-8 left-1/2 -translate-x-1/2',
  }[position];

  return (
    <div
      role="alert"
      className={`fixed ${positionClasses} z-50 flex w-[calc(100vw-2rem)] max-w-md items-start gap-3.5 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${config.bgLight} ${config.border}`}
    >
      {/* Icon Badge */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg} ${config.iconColor}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Message & Title Content */}
      <div className="flex-1 pt-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {alert.title || config.defaultTitle}
        </h4>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {alert.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
        aria-label="Tutup notifikasi"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
