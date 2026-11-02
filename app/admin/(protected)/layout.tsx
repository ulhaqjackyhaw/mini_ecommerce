import React from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Dashboard | QuickOrder',
  description: 'Real-time order management, revenue analytics, and inventory control.',
};

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

