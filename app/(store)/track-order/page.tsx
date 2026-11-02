'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import type { OrderStatus, OrderStatusHistory } from '@/types/database';
import {
  Search,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  AlertCircle,
  Loader2,
  History,
} from 'lucide-react';

interface TrackedOrder {
  order_number: string;
  customer_name: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  history: OrderStatusHistory[];
}

const statusSteps: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'Pending', label: 'Pesanan Diterima', desc: 'Menunggu konfirmasi dan proses dari toko.' },
  { key: 'Processing', label: 'Sedang Diproses', desc: 'Pesanan sedang disiapkan untuk Anda.' },
  { key: 'Completed', label: 'Selesai', desc: 'Pesanan telah selesai dan diserahkan.' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderParam = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderParam);
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<string[]>([]);

  // Ambil histori pesanan yang pernah dibuat di browser ini
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mini_ecommerce_tracking_tokens');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentOrders(Object.keys(parsed).reverse());
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleTrack = async (targetOrderNumber?: string) => {
    const numToTrack = (targetOrderNumber || orderNumber).trim();
    if (!numToTrack) {
      setErrorMessage('Masukkan nomor pesanan Anda.');
      return;
    }

    setErrorMessage(null);
    setIsSearching(true);
    setOrderData(null);

    try {
      const res = await fetch(
        `/api/orders/track?order_number=${encodeURIComponent(numToTrack)}`
      );
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(
          json.message || 'Nomor pesanan tidak ditemukan. Periksa kembali format nomor pesanan Anda.'
        );
        setIsSearching(false);
        return;
      }

      setOrderData(json.data);
    } catch (err: unknown) {
      console.error('Track error:', err);
      setErrorMessage('Gagal menghubungi server pelacakan. Coba beberapa saat lagi.');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search if parameter exists on mount
  useEffect(() => {
    if (initialOrderParam) {
      handleTrack(initialOrderParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderParam]);

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!orderData) return 'upcoming';
    if (orderData.status === 'Cancelled') return 'cancelled';

    const orderIndex = ['Pending', 'Processing', 'Completed'].indexOf(orderData.status);
    const stepIndex = ['Pending', 'Processing', 'Completed'].indexOf(stepKey);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Lacak Status Pesanan
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Masukkan nomor pesanan yang Anda terima pada invoice untuk memantau proses pesanan secara real-time.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mx-auto mt-6 max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="relative flex items-center"
        >
          <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Contoh: ORD-20261102-ABC123XYZ456"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-24 text-xs sm:text-sm font-mono shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 rounded-md bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Lacak'}
          </button>
        </form>

        {/* Quick Recent Orders */}
        {recentOrders.length > 0 && !orderData && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">Terakhir:</span>
            {recentOrders.slice(0, 3).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setOrderNumber(num);
                  handleTrack(num);
                }}
                className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-mono tabular-nums text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-auto mt-4 max-w-lg flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tracking Results View */}
      {orderData && (
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="border-b border-zinc-200/80 bg-zinc-50/50 p-5 sm:flex sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950/30">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Nomor Pesanan
              </span>
              <h2 className="text-base sm:text-lg font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {orderData.order_number}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500 font-mono tabular-nums">
                {orderData.customer_name} • {formatDate(orderData.created_at)}
              </p>
            </div>

            <div className="mt-3 sm:mt-0">
              <Link
                href={`/invoice/${orderData.order_number}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Lihat Invoice</span>
              </Link>
            </div>
          </div>

          {/* Stepper Status Progress */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
              Perkembangan Status
            </h3>

            {orderData.status === 'Cancelled' ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                <XCircle className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Pesanan Dibatalkan</h4>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    Pesanan ini telah dibatalkan pada{' '}
                    {orderData.cancelled_at ? formatDate(orderData.cancelled_at) : 'waktu terkait'}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Stepper horizontal */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {statusSteps.map((step, idx) => {
                    const stepState = getStepStatus(step.key);

                    return (
                      <div
                        key={step.key}
                        className={`relative rounded-xl border p-4 transition ${
                          stepState === 'current'
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm dark:border-blue-400 dark:bg-blue-950/30'
                            : stepState === 'completed'
                            ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20'
                            : 'border-zinc-200 bg-zinc-50/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              stepState === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : stepState === 'current'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                            }`}
                          >
                            {stepState === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {step.label}
                            </span>
                            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* History timeline */}
            {orderData.history && orderData.history.length > 0 && (
              <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  <History className="h-4 w-4" />
                  <span>Riwayat Aktivitas Status</span>
                </div>

                <div className="space-y-4">
                  {orderData.history.map((hist) => (
                    <div
                      key={hist.id}
                      className="flex items-start gap-3 text-xs"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Status diubah ke {hist.new_status}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {formatDate(hist.created_at)}
                          </span>
                        </div>
                        {hist.note && (
                          <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                            Catatan: {hist.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

