'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import type { OrderWithDetails, OrderStatus } from '@/types/database';
import {
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  Search,
  Truck,
} from 'lucide-react';

interface InvoiceViewProps {
  order: OrderWithDetails;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  Pending: {
    label: 'Menunggu Diproses',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/60',
    text: 'text-amber-800 dark:text-amber-300',
    icon: Clock,
  },
  Processing: {
    label: 'Sedang Diproses Penjual',
    bg: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/80 dark:border-zinc-700',
    text: 'text-zinc-800 dark:text-zinc-200',
    icon: Truck,
  },
  Completed: {
    label: 'Pesanan Selesai',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Pesanan Dibatalkan',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/60',
    text: 'text-rose-800 dark:text-rose-300',
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
    <div className="w-full min-h-[calc(100vh-5rem)] bg-zinc-50/50 dark:bg-zinc-950/40 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Action buttons (hidden saat print) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Katalog</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/track-order?order=${order.order_number}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 transition"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Lacak Pesanan</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Card Container */}
        <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 print:border-none print:shadow-none print:m-0 print:p-0">
          {/* Top Header */}
          <div className="border-b border-zinc-200/80 bg-zinc-50/50 p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Logo iconSize="md" />
                <span className="block text-[11px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
                  Digital Invoice
                </span>
                <p className="mt-2 text-xs text-zinc-500 max-w-sm dark:text-zinc-400">
                  Bukti pemesanan resmi untuk transaksi belanja Anda.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  No. Pesanan
                </span>
                <span className="text-base sm:text-lg font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {order.order_number}
                </span>
                <span className="block text-xs text-zinc-500 font-mono tabular-nums mt-0.5">
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>

            {/* Status banner */}
            <div
              className={`mt-5 flex items-center gap-3 rounded-lg border p-3.5 ${currentStatus.bg}`}
            >
              <StatusIcon className={`h-4 w-4 shrink-0 ${currentStatus.text}`} />
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${currentStatus.text}`}>
                  Status:
                </span>
                <span className={`text-xs font-medium ${currentStatus.text}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Grid */}
          <div className="grid grid-cols-1 gap-4 border-b border-zinc-200/80 p-6 sm:grid-cols-2 sm:p-8 dark:border-zinc-800 text-xs">
            <div>
              <span className="font-semibold uppercase tracking-wider text-zinc-400 block text-[10px]">
                Pemesan
              </span>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {order.customer_name}
              </p>
              <p className="text-zinc-500 font-mono mt-0.5">
                {order.customer_phone}
              </p>
            </div>

            <div>
              <span className="font-semibold uppercase tracking-wider text-zinc-400 block text-[10px]">
                Alamat / Catatan Pengiriman
              </span>
              <p className="mt-1 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {order.customer_address || '-'}
              </p>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Rincian Pembelian
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/80 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider dark:border-zinc-800">
                    <th className="pb-3">Produk</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Harga</th>
                    <th className="pb-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {order.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="py-3 pr-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {item.product_name_snapshot}
                      </td>
                      <td className="py-3 px-2 text-center font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(item.unit_price_snapshot)}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="mt-6 border-t border-zinc-200/80 pt-4 sm:w-72 sm:ml-auto dark:border-zinc-800">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ongkos Kirim</span>
                  <span className="text-emerald-600 font-medium dark:text-emerald-400">
                    Gratis
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2 text-sm font-semibold dark:border-zinc-800">
                  <span className="text-zinc-900 dark:text-zinc-100">Total Pembayaran</span>
                  <span className="text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              Terima kasih telah berbelanja di AmaraStore.
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">
              Simpan nomor pesanan Anda untuk pengecekan status secara berkala.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
