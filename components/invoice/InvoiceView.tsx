'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { OrderWithDetails, OrderStatus } from '@/types/database';
import {
  Printer,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  ArrowLeft,
  Search,
  Store,
} from 'lucide-react';

interface InvoiceViewProps {
  order: OrderWithDetails;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  Pending: {
    label: 'Menunggu Diproses (Pending)',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    text: 'text-amber-800 dark:text-amber-300',
    icon: Clock,
  },
  Processing: {
    label: 'Sedang Diproses (Processing)',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    icon: Package,
  },
  Completed: {
    label: 'Pesanan Selesai (Completed)',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Pesanan Dibatalkan (Cancelled)',
    bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    icon: XCircle,
  },
};

export default function InvoiceView({ order }: InvoiceViewProps) {
  const currentStatus = statusConfig[order.status] || statusConfig.Pending;
  const StatusIcon = currentStatus.icon;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Action buttons (hidden on print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/track-order?order=${order.order_number}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Lacak Status</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-98"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Invoice / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Card Container */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 print:border-none print:shadow-none print:m-0 print:p-0">
        {/* Top Header */}
        <div className="border-b border-zinc-200 bg-zinc-50/50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  QuickOrder
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Bukti Transaksi Resmi (Digital Invoice)
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Nomor Pesanan
              </span>
              <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {order.order_number}
              </span>
              <span className="block text-xs text-zinc-500 mt-1">
                Waktu: {formatDate(order.created_at)}
              </span>
            </div>
          </div>

          {/* Status banner */}
          <div
            className={`mt-6 flex items-center gap-3 rounded-xl border p-4 ${currentStatus.bg}`}
          >
            <StatusIcon className={`h-5 w-5 flex-shrink-0 ${currentStatus.text}`} />
            <div>
              <span className={`block text-xs font-bold uppercase tracking-wider ${currentStatus.text}`}>
                Status Pesanan
              </span>
              <span className={`text-sm font-semibold ${currentStatus.text}`}>
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 sm:grid-cols-2 sm:p-8 dark:border-zinc-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Informasi Pelanggan
            </h3>
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {order.customer_name}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Telepon/WA: {order.customer_phone}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Alamat / Catatan
            </h3>
            <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
              {order.customer_address || 'Tidak ada alamat / catatan tambahan.'}
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="p-6 sm:p-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
            Rincian Pembelian
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:text-zinc-400">
                  <th className="pb-3">Produk</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Harga Satuan</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="py-3.5 pr-4">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.product_name_snapshot}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-zinc-600 dark:text-zinc-400">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-2 text-right text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(item.unit_price_snapshot)}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-zinc-200 pt-6 sm:w-72 sm:ml-auto dark:border-zinc-800">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-extrabold dark:border-zinc-800">
                <span className="text-zinc-900 dark:text-zinc-100">Total Akhir</span>
                <span className="text-base text-blue-600 dark:text-blue-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-zinc-200 bg-zinc-50 p-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
          <p>Terima kasih telah berbelanja di QuickOrder!</p>
          <p className="mt-1">
            Simpan atau cetak nomor pesanan ini untuk memudahkan pengecekan status pesanan Anda.
          </p>
        </div>
      </div>
    </div>
  );
}

