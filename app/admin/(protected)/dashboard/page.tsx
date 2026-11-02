import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import DashboardView from '@/components/admin/DashboardView';
import type { Order } from '@/types/database';

export const revalidate = 0; // Dynamic fetch for fresh dashboard data

export default async function AdminDashboardPage() {
  let initialOrders: Order[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createAdminClient();

      const { data: orders, error } = await (supabase as any)
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (orders && !error) {
        initialOrders = orders;
      }
    }
  } catch (err) {
    console.warn('Supabase not yet configured or failed to fetch initial dashboard orders:', err);
  }

  return <DashboardView initialOrders={initialOrders} />;
}

