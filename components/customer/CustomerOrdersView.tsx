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
  Store,
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 px-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Belum Ada Riwayat Pesanan
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm dark:text-zinc-400">
          Pesanan yang dibuat saat login akan tercatat secara otomatis di sini.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Store className="h-3.5 w-3.5" />
          <span>Mulai Belanja</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Pesanan */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
            Total Pesanan
          </span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {metrics.totalOrders}
          </div>
          <span className="text-[11px] text-zinc-400">Transaksi</span>
        </div>

        {/* Sedang Berjalan */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Sedang Diproses
          </span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {metrics.pendingOrders}
          </div>
          <span className="text-[11px] text-zinc-400">Pesanan aktif</span>
        </div>

        {/* Selesai */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Selesai
          </span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {metrics.completedOrders}
          </div>
          <span className="text-[11px] text-zinc-400">Transaksi sukses</span>
        </div>

        {/* Total Belanja */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
            Total Belanja
          </span>
          <div className="mt-2 text-lg sm:text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50 truncate" title={formatCurrency(metrics.totalSpent)}>
            {formatCurrency(metrics.totalSpent)}
          </div>
          <span className="text-[11px] text-zinc-400">Pengeluaran</span>
        </div>
      </div>

      {/* Info bar real-time */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Daftar Transaksi ({orders.length})
        </h2>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Aktif</span>
        </div>
      </div>

      {/* Cards List Pesanan */}
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Card Header & Primary Info */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Column: Nomor Order & Tanggal */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {order.order_number}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                          order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                            : order.status === 'Processing'
                            ? 'bg-zinc-100 text-zinc-800 border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                            : order.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                            : 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                        }`}
                      >
                        {order.status === 'Pending' && <Clock className="h-3 w-3" />}
                        {order.status === 'Processing' && <Truck className="h-3 w-3" />}
                        {order.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                        {order.status === 'Cancelled' && <XCircle className="h-3 w-3" />}
                        <span>{order.status}</span>
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 font-mono tabular-nums">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Right Column: Total Belanja & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="block text-[10px] uppercase font-medium tracking-wider text-zinc-400">
                        Total
                      </span>
                      <span className="text-base sm:text-lg font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Tombol Invoice */}
                      <Link
                        href={`/invoice/${order.order_number}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Invoice</span>
                      </Link>

                      {/* Tombol Toggle Rincian Item */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 transition"
                      >
                        <span>{isExpanded ? 'Tutup' : 'Item'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="mt-4 border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 block">
                      Rincian Produk
                    </span>

                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="rounded-lg border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800 text-xs">
                          {order.order_items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="flex items-center justify-between py-2"
                            >
                              <div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                  {item.product_name_snapshot}
                                </span>
                                <span className="block text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                                  {item.quantity} unit × {formatCurrency(item.unit_price_snapshot)}
                                </span>
                              </div>
                              <span className="font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                                {formatCurrency(item.line_total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">
                        Buka invoice untuk melihat rincian item lengkap.
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                      <span>
                        Penerima: <strong className="text-zinc-600 dark:text-zinc-300">{order.customer_name}</strong>
                      </span>
                      <Link
                        href={`/track-order?order=${order.order_number}`}
                        className="inline-flex items-center gap-1 font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Lacak Pesanan →</span>
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
