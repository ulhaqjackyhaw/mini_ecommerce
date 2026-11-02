import React from 'react';
import CustomerLayoutClient from '@/components/customer/CustomerLayoutClient';

export const metadata = {
  title: 'Akun Customer | QuickOrder',
  description: 'Kelola riwayat pesanan dan profil pengiriman customer.',
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}

