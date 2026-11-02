'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminRealtime } from '@/components/admin/AdminLayoutClient';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order, OrderItem, OrderStatus } from '@/types/database';
import {
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Bell,
  X,
  AlertCircle,
  Loader2,
  Check,
  RefreshCw,
  Calendar,
  MessageCircle,
} from 'lucide-react';

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.475-.15-.675.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.3-.151-1.27-.468-2.42-1.493-.895-.798-1.5-1.783-1.675-2.083-.175-.3-.019-.462.132-.612.135-.135.301-.351.451-.527.151-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.151-.675-1.628-.925-2.23-.244-.587-.492-.507-.676-.517-.175-.01-.375-.01-.576-.01s-.526.075-.802.376c-.276.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.109.15.2 2.12 3.238 5.136 4.542.717.311 1.278.497 1.715.636.721.229 1.377.197 1.896.119.579-.087 1.78-.727 2.03-1.429.25-.702.25-1.303.175-1.429-.075-.125-.276-.201-.576-.351zM12.04 2C6.52 2 2.039 6.481 2.039 12c0 1.959.566 3.788 1.547 5.334L2 22l4.825-1.543A9.972 9.972 0 0012.04 22c5.52 0 10.001-4.481 10.001-10S17.56 2 12.04 2zm0 18.2c-1.614 0-3.123-.46-4.407-1.258l-.316-.195-2.868.917.917-2.868-.195-.316A8.163 8.163 0 013.84 12c0-4.522 3.678-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z" />
    </svg>
  );
}

// Format nomor telepon Indonesia ke standar internasional (628xxx)
function formatIndonesianPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

// Template pesan WhatsApp tagihan & verifikasi pesanan
function generateWhatsAppBillingMessage(order: OrderWithItems): string {
  const itemsText =
    order.items && order.items.length > 0
      ? order.items
          .map(
            (it, idx) =>
              `${idx + 1}. *${it.product_name_snapshot}* (${it.quantity}x) = ${formatCurrency(
                it.line_total
              )}`
          )
          .join('\n')
      : '-';

  const addressText =
    order.customer_address && order.customer_address.trim()
      ? order.customer_address.trim()
      : 'Ambil di Tempat / Tanpa Alamat Khusus';

  const message = `Halo Kak *${order.customer_name}*, terima kasih telah memesan di *QuickOrder Store*! 🙏✨

Kami ingin melakukan konfirmasi & verifikasi pesanan Anda:
📋 *No. Pesanan:* ${order.order_number}
📅 *Waktu Pemesanan:* ${formatDate(order.created_at)}

🛒 *Rincian Produk yang Dipesan:*
${itemsText}

📍 *Alamat / Catatan Pengiriman:*
${addressText}
_(Mohon verifikasi apakah alamat pengiriman di atas sudah benar)_

💰 *TOTAL PEMBAYARAN:* *${formatCurrency(order.total)}*

💳 *Instruksi Pembayaran Transfer Bank:*
Silakan melakukan transfer sesuai total di atas ke rekening resmi kami:
🏦 *Bank BCA:* 123-456-7890 (a.n. QuickOrder Store)
🏦 *Bank Mandiri:* 987-654-3210 (a.n. QuickOrder Store)

Setelah melakukan pembayaran, mohon kirimkan foto/screenshot *Bukti Transfer* ke WhatsApp ini agar pesanan Anda dapat segera kami proses & kirimkan. 

Terima kasih banyak atas kerjasamanya! 😊🙏`;

  return encodeURIComponent(message);
}
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import ToastCard, { type ToastAlert } from '@/components/ui/ToastCard';

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

interface DashboardViewProps {
  initialOrders: OrderWithItems[];
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: '#f59e0b', // amber
  Processing: '#3b82f6', // blue
  Completed: '#10b981', // emerald
  Cancelled: '#ef4444', // red
};

export default function DashboardView({ initialOrders }: DashboardViewProps) {
  const { setStatus } = useAdminRealtime();
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Date Filter State
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Toast Alert Card Notification System
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);

  // Modal detail pesanan
  const [activeModalOrder, setActiveModalOrder] = useState<OrderWithItems | null>(null);
  const [modalItemsLoading, setModalItemsLoading] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Setup Supabase Realtime Listener untuk tabel orders
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as OrderWithItems;

          // Munculkan notifikasi alert card pesanan baru yang seragam & cantik
          setToastAlert({
            type: 'order',
            title: 'Pesanan Baru Masuk!',
            message: `${newOrder.order_number} oleh ${newOrder.customer_name} (${formatCurrency(
              newOrder.total
            )})`,
            duration: 7000,
          });

          // Masukkan ke state pesanan
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as OrderWithItems;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus('CONNECTED');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setStatus('CONNECTING');
        } else if (status === 'CLOSED') {
          setStatus('DISCONNECTED');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setStatus]);

  // Refetch orders manual
  const handleRefresh = async () => {
    try {
      const supabase = createClient();
      const { data } = await (supabase as any)
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Refresh orders error:', err);
    }
  };

  // 2. Filter Orders berdasarkan Rentang Tanggal yang Dipilih
  const dateFilteredOrders = useMemo(() => {
    if (datePreset === 'all') {
      return orders;
    }

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (datePreset === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === '7days') {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === '30days') {
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (datePreset === 'custom') {
      if (!customStartDate && !customEndDate) return orders;
      if (customStartDate) {
        start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
      } else {
        start = new Date('2000-01-01');
      }
      if (customEndDate) {
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      } else {
        end = new Date('2099-12-31');
      }
    }

    const startTime = start.getTime();
    const endTime = end.getTime();

    return orders.filter((o) => {
      const orderTime = new Date(o.created_at).getTime();
      return orderTime >= startTime && orderTime <= endTime;
    });
  }, [orders, datePreset, customStartDate, customEndDate]);

  // 3. Summary Cards Metrics (tersinkronisasi 100% dengan filter tanggal)
  const summaryMetrics = useMemo(() => {
    const totalOrders = dateFilteredOrders.length;
    let pendingCount = 0;
    let processingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let totalRevenue = 0;

    dateFilteredOrders.forEach((o) => {
      if (o.status === 'Pending') pendingCount++;
      else if (o.status === 'Processing') processingCount++;
      else if (o.status === 'Completed') {
        completedCount++;
        totalRevenue += o.total;
      } else if (o.status === 'Cancelled') {
        cancelledCount++;
      }
    });

    return {
      totalOrders,
      pendingCount,
      processingCount,
      completedCount,
      cancelledCount,
      totalRevenue,
    };
  }, [dateFilteredOrders]);

  // 4. Data Grafik Tren Penjualan per Hari (tersinkronisasi dengan rentang tanggal)
  const salesChartData = useMemo(() => {
    const daysMap: Record<string, { label: string; revenue: number; count: number }> = {};

    let daysCount = 7;
    let baseEnd = new Date();

    if (datePreset === 'today') {
      daysCount = 1;
    } else if (datePreset === '7days') {
      daysCount = 7;
    } else if (datePreset === '30days') {
      daysCount = 30;
    } else if (datePreset === 'custom' && customStartDate && customEndDate) {
      const startMs = new Date(customStartDate).getTime();
      const endMs = new Date(customEndDate).getTime();
      const diffDays = Math.ceil((endMs - startMs) / (1000 * 3600 * 24)) + 1;
      daysCount = Math.min(Math.max(diffDays, 1), 60);
      baseEnd = new Date(customEndDate);
    } else if (datePreset === 'all' && dateFilteredOrders.length > 0) {
      // Tampilkan seluruh tanggal transaksi
      const sorted = [...dateFilteredOrders].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      sorted.forEach((o) => {
        if (o.status === 'Cancelled') return;
        const key = o.created_at.split('T')[0];
        if (!daysMap[key]) {
          const d = new Date(o.created_at);
          const label = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
          }).format(d);
          daysMap[key] = { label, revenue: 0, count: 0 };
        }
        daysMap[key].revenue += o.total;
        daysMap[key].count += 1;
      });
      return Object.values(daysMap);
    }

    // Default interval slots
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(baseEnd);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(d);
      daysMap[key] = { label, revenue: 0, count: 0 };
    }

    dateFilteredOrders.forEach((o) => {
      if (o.status === 'Cancelled') return;
      const orderDateKey = o.created_at.split('T')[0];
      if (daysMap[orderDateKey]) {
        daysMap[orderDateKey].revenue += o.total;
        daysMap[orderDateKey].count += 1;
      }
    });

    return Object.values(daysMap);
  }, [dateFilteredOrders, datePreset, customStartDate, customEndDate]);

  // 5. Data Grafik Distribusi Status Pesanan (Pie Chart)
  const statusPieData = useMemo(() => {
    return [
      { name: 'Pending', value: summaryMetrics.pendingCount, color: STATUS_COLORS.Pending },
      { name: 'Processing', value: summaryMetrics.processingCount, color: STATUS_COLORS.Processing },
      { name: 'Completed', value: summaryMetrics.completedCount, color: STATUS_COLORS.Completed },
      { name: 'Cancelled', value: summaryMetrics.cancelledCount, color: STATUS_COLORS.Cancelled },
    ].filter((item) => item.value > 0);
  }, [summaryMetrics]);

  // 6. Filter Tabel Pesanan (Status, Pencarian, & Rentang Tanggal)
  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((o) => {
      if (selectedStatusFilter !== 'all' && o.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = o.order_number.toLowerCase().includes(query);
        const matchName = o.customer_name.toLowerCase().includes(query);
        const matchPhone = o.customer_phone.toLowerCase().includes(query);
        return matchNumber || matchName || matchPhone;
      }
      return true;
    });
  }, [dateFilteredOrders, selectedStatusFilter, searchQuery]);

  // Handler ubah status pesanan
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    setIsUpdatingStatus(orderId);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          new_status: newStatus,
          note: note || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setToastAlert({
          type: 'error',
          title: 'Gagal Mengubah Status',
          message: json.message || 'Gagal mengubah status pesanan. Silakan coba lagi.',
        });
        return;
      }

      // Update local state segera
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      setToastAlert({
        type: 'success',
        title: 'Status Berhasil Diperbarui',
        message: `Status pesanan berhasil diubah menjadi "${newStatus}".`,
      });
    } catch (err) {
      console.error('Update status error:', err);
      setToastAlert({
        type: 'error',
        title: 'Kesalahan Sistem',
        message: 'Terjadi masalah koneksi saat memperbarui status pesanan.',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Open Modal Details
  const handleOpenDetailModal = async (order: OrderWithItems) => {
    setActiveModalOrder(order);
    setStatusUpdateNote('');

    // Fetch items jika belum ada
    if (!order.items || order.items.length === 0) {
      setModalItemsLoading(true);
      try {
        const supabase = createClient();
        const { data: items } = await (supabase as any)
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (items) {
          setActiveModalOrder((prev) => (prev ? { ...prev, items } : null));
        }
      } catch (err) {
        console.error('Error fetching order items:', err);
      } finally {
        setModalItemsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert Card Notification (Standar Desain Seragam) */}
      {toastAlert && (
        <ToastCard alert={toastAlert} onClose={() => setToastAlert(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Dashboard Penjualan & Transaksi
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Monitoring pesanan real-time, grafik tren penjualan, dan perubahan status operasional.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <RefreshCw className="h-3.5 w-3.5 text-zinc-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 mr-1">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Filter Tanggal:</span>
          </div>

          {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari Terakhir' },
            { id: '30days', label: '30 Hari Terakhir' },
            { id: 'all', label: 'Semua Waktu' },
            { id: 'custom', label: 'Kustom Rentang' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setDatePreset(preset.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                datePreset === preset.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Inputs */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-400">Mulai:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-xs focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-400">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-xs focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Summary Cards (Clean Monochromatic Neutral) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Pesanan */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Pesanan</span>
            <ShoppingBag className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {summaryMetrics.totalOrders}
          </div>
          <span className="mt-1 block text-[11px] text-zinc-400">Seluruh riwayat pesanan</span>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Menunggu</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {summaryMetrics.pendingCount}
          </div>
          <span className="mt-1 block text-[11px] text-amber-600 dark:text-amber-400">Perlu diproses segera</span>
        </div>

        {/* Processing */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Diproses</span>
            <Package className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {summaryMetrics.processingCount}
          </div>
          <span className="mt-1 block text-[11px] text-zinc-400">Sedang disiapkan</span>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Selesai</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {summaryMetrics.completedCount}
          </div>
          <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400">Transaksi sukses</span>
        </div>

        {/* Total Omzet */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-4.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Omzet</span>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50 truncate" title={formatCurrency(summaryMetrics.totalRevenue)}>
            {formatCurrency(summaryMetrics.totalRevenue)}
          </div>
          <span className="mt-1 block text-[11px] text-zinc-400">Dari pesanan Selesai</span>
        </div>
      </div>

      {/* 2. Visual Charts (Clean Monochromatic) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sales Trend Area Chart */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tren Omzet Penjualan{' '}
                <span className="text-xs font-normal text-zinc-500">
                  (
                  {datePreset === 'today'
                    ? 'Hari Ini'
                    : datePreset === '7days'
                    ? '7 Hari Terakhir'
                    : datePreset === '30days'
                    ? '30 Hari Terakhir'
                    : datePreset === 'custom'
                    ? 'Rentang Kustom'
                    : 'Semua Waktu'}
                  )
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Akumulasi pendapatan harian</p>
            </div>
          </div>

          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Omzet']}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#18181b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Distribusi Status Pesanan
            </h3>
            <p className="text-xs text-zinc-400">Komposisi pesanan berdasarkan status</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {statusPieData.length === 0 ? (
              <div className="text-xs text-zinc-400">Belum ada data status pesanan</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. Real-time Transactions Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Table Controls (Filter & Search) */}
        <div className="border-b border-zinc-200 p-4 sm:flex sm:items-center sm:justify-between gap-4 dark:border-zinc-800">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 sm:mb-0">
            {['all', 'Pending', 'Processing', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedStatusFilter === st
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                }`}
              >
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Order / Pelanggan..."
              className="w-full rounded-lg border border-zinc-300 bg-white py-1.5 pl-9 pr-3 text-xs shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Orders Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200/80 bg-zinc-50/70 text-zinc-500 uppercase tracking-wider font-semibold dark:border-zinc-800 dark:bg-zinc-950/30">
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUpdating = isUpdatingStatus === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                    >
                      {/* Order Number */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(order)}
                          className="font-mono tabular-nums font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
                        >
                          {order.order_number}
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap font-mono tabular-nums">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(order.total)}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                            order.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                              : order.status === 'Processing'
                              ? 'bg-zinc-100 text-zinc-800 border-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                              : order.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
                              : 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(order)}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Transisi tombol cepat */}
                          {order.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Processing')}
                                className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400"
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Proses'}
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400"
                              >
                                Batal
                              </button>
                            </>
                          )}

                          {order.status === 'Processing' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Completed')}
                                className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400"
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Selesai'}
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                                className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400"
                              >
                                Batal
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Orders Mobile Card View */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              Tidak ada transaksi yang cocok dengan filter.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isUpdating = isUpdatingStatus === order.id;

              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(order)}
                      className="font-mono text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {order.order_number}
                    </button>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
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

                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {order.customer_name}
                      </span>
                      <span className="block text-[11px] text-zinc-400">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Actions on mobile */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detail</span>
                    </button>

                    {order.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'Processing')}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Proses
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Batal
                        </button>
                      </>
                    )}

                    {order.status === 'Processing' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'Completed')}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Selesai
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Batal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Modal Detail Pesanan */}
      {activeModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveModalOrder(null)}
        >
          <div
            className="relative w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[88dvh] sm:max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 bg-white/95 px-5 sm:px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 shrink-0">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Detail Transaksi
                </span>
                <h3 className="text-base sm:text-lg font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {activeModalOrder.order_number}
                </h3>
                <p className="text-xs text-zinc-500 font-mono tabular-nums">
                  Waktu: {formatDate(activeModalOrder.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
              {/* Customer Details Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-3.5 text-xs dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider block text-[10px]">
                    Pelanggan
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                    {activeModalOrder.customer_name}
                  </p>
                  <p className="text-zinc-500 font-mono">{activeModalOrder.customer_phone}</p>
                </div>
                <div>
                  <span className="font-semibold text-zinc-400 uppercase tracking-wider block text-[10px]">
                    Alamat / Catatan
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap">
                    {activeModalOrder.customer_address || '-'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Daftar Produk yang Dipesan
                </h4>

                {modalItemsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  </div>
                ) : activeModalOrder.items && activeModalOrder.items.length > 0 ? (
                  <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-xl overflow-hidden dark:divide-zinc-800 dark:border-zinc-800">
                    {activeModalOrder.items.map((item, i) => (
                      <div
                        key={item.id || i}
                        className="flex items-center justify-between p-3 text-xs"
                      >
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {item.product_name_snapshot}
                          </p>
                          <p className="text-zinc-400 text-[11px] font-mono tabular-nums">
                            {item.quantity} x {formatCurrency(item.unit_price_snapshot)}
                          </p>
                        </div>
                        <div className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.line_total)}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-medium">
                      <span>Total Pembayaran</span>
                      <span className="text-sm font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(activeModalOrder.total)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 py-4 text-center">
                    Item tidak ditemukan.
                  </div>
                )}
              </div>

              {/* Tombol Hubungi via WhatsApp (Tagihan & Verifikasi) */}
              <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/80 dark:border-zinc-800 dark:bg-zinc-800/40">
                <a
                  href={`https://wa.me/${formatIndonesianPhoneNumber(
                    activeModalOrder.customer_phone
                  )}?text=${generateWhatsAppBillingMessage(activeModalOrder)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  <span>Hubungi via WhatsApp (Tagihan & Verifikasi)</span>
                </a>
                <p className="mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                  Format nomor ke <strong className="font-mono">{formatIndonesianPhoneNumber(activeModalOrder.customer_phone)}</strong> beserta template rincian pesanan.
                </p>
              </div>

              {/* Change Status Controls */}
              <div className="border-t border-zinc-100 pt-3.5 dark:border-zinc-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                  Ubah Status Pesanan
                </h4>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['Pending', 'Processing', 'Completed', 'Cancelled'] as OrderStatus[]).map(
                    (st) => {
                      const isCurrent = activeModalOrder.status === st;

                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isCurrent || isUpdatingStatus === activeModalOrder.id}
                          onClick={() =>
                            handleUpdateStatus(activeModalOrder.id, st, statusUpdateNote)
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            isCurrent
                              ? 'bg-zinc-200 text-zinc-500 cursor-default dark:bg-zinc-800 dark:text-zinc-500'
                              : st === 'Processing'
                              ? 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900'
                              : st === 'Completed'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : st === 'Cancelled'
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          {isCurrent ? `Saat ini: ${st}` : `Ubah ke ${st}`}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-zinc-200/80 bg-zinc-50/80 px-5 sm:px-6 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 shrink-0">
              <span className="text-[11px] text-zinc-400">
                Klik luar untuk menutup
              </span>
              <button
                type="button"
                onClick={() => setActiveModalOrder(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
              >
                <span>Tutup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

