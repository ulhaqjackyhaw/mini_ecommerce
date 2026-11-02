'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderItem, OrderStatus } from '@/types/database';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Belum Ada Riwayat Pesanan
        </h3>
        <p className="mt-1 text-xs text-zinc-500 max-w-sm dark:text-zinc-400">
          Setiap pesanan yang Anda buat saat sedang login akan otomatis tercatat dan dapat dipantau di sini.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <span>Mulai Belanja</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Menampilkan {orders.length} pesanan Anda</span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Status Real-time Aktif
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Card Header / Summary */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
                        {order.order_number}
                      </span>
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                            : order.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="mt-1 block text-xs text-zinc-400">
                      Waktu Pemesanan: {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left sm:text-right">
                      <span className="block text-[11px] text-zinc-400">Total Belanja</span>
                      <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoice/${order.order_number}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        title="Lihat Bukti Transaksi Digital"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Invoice</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Rincian Item"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Item yang Dipesan
                    </h4>

                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                        {order.order_items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                {item.product_name_snapshot}
                              </span>
                              <span className="block text-[11px] text-zinc-400">
                                {item.quantity} x {formatCurrency(item.unit_price_snapshot)}
                              </span>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {formatCurrency(item.line_total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">
                        Buka invoice untuk melihat rincian produk lengkap.
                      </p>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/track-order?order=${order.order_number}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Lacak Detail & Riwayat Status Lengkap →</span>
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

