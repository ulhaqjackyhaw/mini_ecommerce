import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CustomerLayoutClient from '@/components/customer/CustomerLayoutClient';

export const metadata = {
  title: 'Akun Customer | QuickOrder',
  description: 'Kelola riwayat pesanan dan profil pengiriman customer.',
};

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika belum login, redirect ke halaman login customer
  if (!user) {
    redirect('/login?redirectTo=/customer/orders');
  }

  // Cek apakah user adalah admin
  let isAdmin = false;
  const { data: adminProfile } = await (supabase as any)
    .from('admin_profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminProfile?.role === 'admin') {
    isAdmin = true;
  } else {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'admin') {
      isAdmin = true;
    }
  }

  // Jika akun adalah admin, jangan izinkan area customer, arahkan ke dashboard admin
  if (isAdmin) {
    redirect('/admin/dashboard');
  }

  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}
