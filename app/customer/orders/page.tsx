import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import CustomerOrdersView from '@/components/customer/CustomerOrdersView';
import type { Order } from '@/types/database';

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  let orders: any[] = [];
  let userId = '';

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;

      // Query pesanan milik customer ini menggunakan admin client (aman karena difilter user.id)
      const adminClient = createAdminClient();
      const { data, error } = await (adminClient as any)
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        orders = data;
      }
    }
  } catch (err) {
    console.warn('Customer orders fetch warning:', err);
  }

  return <CustomerOrdersView initialOrders={orders} userId={userId} />;
}

