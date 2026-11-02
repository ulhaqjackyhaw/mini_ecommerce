import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | AmaraStore',
  description: 'Real-time order management, revenue analytics, and inventory control.',
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Verifikasi role admin
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

  // Jika bukan role admin (misal customer yang sudah login mencoba akses /admin), redirect paksa ke homepage
  if (!isAdmin) {
    redirect('/');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
