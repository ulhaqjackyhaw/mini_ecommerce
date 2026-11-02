'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderItem } from '@/types/database';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Receipt,
  Sparkles,
  ArrowRight,
  Truck,
} from 'lucide-react';

interface OrderWithItems extends Order {
  order_items?: OrderItem[];
}

interface CustomerOrdersViewProps {
  initialOrders: OrderWithItems[];
  userId: string;
}

export default function CustomerOrdersView({
  initialOrders,
  userId,
}: CustomerOrdersViewProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Realtime updates for customer's own orders
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`customer-orders-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as OrderWithItems;
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as OrderWithItems;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id
                  ? { ...o, ...updated, order_items: o.order_items }
                  : o
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Metrics summary
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
    const completedOrders = orders.filter((o) => o.status === 'Completed').length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? Number(o.total) : 0), 0);

    return { totalOrders, pendingOrders, completedOrders, totalSpent };
  }, [orders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white py-20 px-6 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h3 className="mt-6 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Belum Ada Riwayat Pesanan
        </h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-md dark:text-zinc-400 leading-relaxed">
          Setiap pesanan yang Anda buat saat sedang login akan otomatis tersimpan dan dapat dipantau statusnya secara real-time di sini.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 hover:scale-[1.02]"
        >
          <StoreIcon className="h-4 w-4" />
          <span>Mulai Belanja Sekarang</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* 4 Summary Stats Cards di Desktop */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Pesanan */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Total Pesanan
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
              {metrics.totalOrders}
            </span>
            <span className="ml-1.5 text-xs text-zinc-400">transaksi</span>
          </div>
        </div>

        {/* Sedang Berjalan */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Sedang Diproses
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {metrics.pendingOrders}
            </span>
            <span className="ml-1.5 text-xs text-zinc-400">pesanan aktif</span>
          </div>
        </div>

        {/* Selesai */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Pesanan Selesai
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.completedOrders}
            </span>
            <span className="ml-1.5 text-xs text-zinc-400">berhasil</span>
          </div>
        </div>

        {/* Total Belanja */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Total Belanja
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {formatCurrency(metrics.totalSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* Info bar real-time */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Daftar Transaksi ({orders.length})
        </h2>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status Real-time Otomatis Terhubung</span>
        </div>
      </div>

      {/* Cards List Pesanan yang Lega & Proporsional */}
      <div className="space-y-5">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Card Header & Primary Info */}
              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Column: Nomor Order & Tanggal */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-lg sm:text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                        {order.order_number}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black shadow-xs ${
                          order.status === 'Pending'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300'
                            : order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {order.status === 'Pending' && <Clock className="h-3.5 w-3.5" />}
                        {order.status === 'Processing' && <Truck className="h-3.5 w-3.5" />}
                        {order.status === 'Completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {order.status === 'Cancelled' && <XCircle className="h-3.5 w-3.5" />}
                        <span>{order.status}</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      Waktu Pemesanan:{' '}
                      <strong className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatDate(order.created_at)}
                      </strong>
                    </p>
                  </div>

                  {/* Right Column: Total Belanja & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Total Belanja
                      </span>
                      <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Tombol Invoice */}
                      <Link
                        href={`/invoice/${order.order_number}`}
                        className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Cetak Invoice</span>
                      </Link>

                      {/* Tombol Toggle Rincian Item */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <span>{isExpanded ? 'Tutup Rincian' : 'Rincian Item'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Item List yang Lega dan Terstruktur */}
                {isExpanded && (
                  <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                      Rincian Produk Dipesan
                    </h4>

                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-sm">
                          {order.order_items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="flex items-center justify-between py-3"
                            >
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                  {item.product_name_snapshot}
                                </span>
                                <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  {item.quantity} unit × {formatCurrency(item.unit_price_snapshot)}
                                </span>
                              </div>
                              <span className="font-black text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(item.line_total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400">
                        Buka invoice untuk melihat rincian item lengkap.
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        Penerima: <strong>{order.customer_name}</strong> ({order.customer_phone})
                      </span>
                      <Link
                        href={`/track-order?order=${order.order_number}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Search className="h-4 w-4" />
                        <span>Lacak Posisi Pesanan & Status Lengkap →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}
