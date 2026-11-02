import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import InvoiceView from '@/components/invoice/InvoiceView';
import type { OrderWithDetails } from '@/types/database';
import { AlertCircle, Store, Search } from 'lucide-react';

interface InvoicePageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderNumber } = await params;
  let orderData: OrderWithDetails | null = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createAdminClient();

      const { data: order, error: orderError } = await (supabase as any)
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (order && !orderError) {
        const { data: items } = await (supabase as any)
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        orderData = {
          ...(order as any),
          items: (items || []) as any,
        } as unknown as OrderWithDetails;
      }
    }
  } catch (err) {
    console.warn('Failed to load invoice from database:', err);
  }

  // Not found fallback state
  if (!orderData) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Invoice Tidak Ditemukan
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Pesanan dengan nomor{' '}
          <strong className="font-mono text-zinc-900 dark:text-zinc-200">
            {orderNumber}
          </strong>{' '}
          tidak ditemukan di sistem kami. Pastikan nomor yang dimasukkan sudah benar.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/track-order"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Search className="h-4 w-4" />
            <span>Cari di Lacak Pesanan</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Store className="h-4 w-4" />
            <span>Katalog Produk</span>
          </Link>
        </div>
      </div>
    );
  }

  return <InvoiceView order={orderData} />;
}
