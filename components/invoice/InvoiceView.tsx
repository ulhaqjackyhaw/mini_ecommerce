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
  ShieldCheck,
  Truck,
  Sparkles,
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
    label: 'Sedang Diproses Penjual (Processing)',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    icon: Truck,
  },
  Completed: {
    label: 'Pesanan Selesai (Completed)',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  Cancelled: {
    label: 'Pesanan Dibatalkan (Cancelled)',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
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
    <div className="w-full min-h-[calc(100vh-5rem)] bg-slate-50/60 dark:bg-zinc-950/60 py-8 sm:py-12 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Action buttons (hidden saat print) */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Kembali ke Katalog Toko</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/track-order?order=${order.order_number}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Search className="h-4 w-4 text-blue-600" />
              <span>Lacak Pesanan Real-time</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-98"
            >
              <Printer className="h-4 w-4 stroke-[2.5]" />
              <span>Cetak Invoice / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Card Container yang Mewah & Lega */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 print:border-none print:shadow-none print:m-0 print:p-0">
          {/* Top Header */}
          <div className="border-b border-zinc-200 bg-zinc-50/70 p-8 sm:p-10 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                      QuickOrder
                    </span>
                    <span className="block text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Official Digital Invoice
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Bukti pemesanan dan pembayaran resmi yang sah untuk transaksi digital Anda.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Nomor Pesanan
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-blue-600 dark:text-blue-400">
                  {order.order_number}
                </span>
                <span className="block text-xs text-zinc-500 mt-1">
                  Waktu Transaksi: <strong>{formatDate(order.created_at)}</strong>
                </span>
              </div>
            </div>

            {/* Status banner yang jelas */}
            <div
              className={`mt-6 flex items-center gap-3.5 rounded-2xl border p-5 ${currentStatus.bg}`}
            >
              <StatusIcon className={`h-6 w-6 flex-shrink-0 ${currentStatus.text}`} />
              <div>
                <span className={`block text-xs font-black uppercase tracking-wider ${currentStatus.text}`}>
                  Status Pesanan Saat Ini
                </span>
                <span className={`text-base font-bold ${currentStatus.text}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information Grid */}
          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-8 sm:grid-cols-2 sm:p-10 dark:border-zinc-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Informasi Pemesan
              </h3>
              <p className="mt-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
                {order.customer_name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                No. WhatsApp/Telepon: <strong>{order.customer_phone}</strong>
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Alamat Pengiriman & Catatan
              </h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {order.customer_address || 'Tidak ada alamat/catatan khusus.'}
              </p>
            </div>
          </div>

          {/* Order Items Table yang Lega */}
          <div className="p-8 sm:p-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-5">
              Rincian Pembelian Produk
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider dark:border-zinc-800">
                    <th className="pb-4">Produk</th>
                    <th className="pb-4 text-center">Jumlah</th>
                    <th className="pb-4 text-right">Harga Satuan</th>
                    <th className="pb-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {order.items.map((item, index) => (
                    <tr key={item.id || index}>
                      <td className="py-4 pr-4">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {item.product_name_snapshot}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center text-zinc-600 dark:text-zinc-400">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-2 text-right text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(item.unit_price_snapshot)}
                      </td>
                      <td className="py-4 pl-4 text-right font-black text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="mt-8 border-t border-zinc-200 pt-6 sm:w-80 sm:ml-auto dark:border-zinc-800">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal Belanja</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Ongkos Kirim</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Rp 0 (Gratis)
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-black dark:border-zinc-800">
                  <span className="text-zinc-900 dark:text-zinc-100">Total Pembayaran</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400 font-black">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-zinc-200 bg-zinc-50/70 p-6 sm:p-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
            <p className="font-bold text-zinc-700 dark:text-zinc-300">
              Terima kasih atas pesanan Anda di QuickOrder!
            </p>
            <p className="mt-1">
              Invoice ini merupakan bukti pemesanan digital yang sah. Simpan nomor pesanan ini untuk melacak status pengiriman Anda secara real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
