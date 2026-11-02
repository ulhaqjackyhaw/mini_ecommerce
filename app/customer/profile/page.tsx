import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import CustomerProfileView from '@/components/customer/CustomerProfileView';

export const revalidate = 0;

export default async function CustomerProfilePage() {
  let profile = {
    id: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    role: 'customer',
  };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      profile.id = user.id;
      profile.email = user.email || '';
      profile.full_name = user.user_metadata?.full_name || '';
      profile.phone = user.user_metadata?.phone || '';

      const adminClient = createAdminClient();
      const { data: prof } = await (adminClient as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (prof) {
        profile.full_name = prof.full_name || profile.full_name;
        profile.phone = prof.phone || profile.phone;
        profile.address = prof.address || '';
        profile.role = prof.role || 'customer';
      }
    }
  } catch (err) {
    console.warn('Customer profile fetch warning:', err);
  }

  return <CustomerProfileView initialProfile={profile} />;
}

