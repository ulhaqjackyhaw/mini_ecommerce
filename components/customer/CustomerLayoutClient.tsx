'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Package,
  User,
  LogOut,
  Store,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';

export default function CustomerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    {
      name: 'Pesanan Saya',
      href: '/customer/orders',
      icon: Package,
    },
    {
      name: 'Profil & Alamat Default',
      href: '/customer/profile',
      icon: User,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-blue-600">
              Toko
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">
              Area Customer
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Akun Customer Saya
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <Store className="h-4 w-4" />
            <span>Katalog Produk</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-8 flex border-b border-zinc-200 dark:border-zinc-800">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main tab content */}
      <main className="min-h-[50vh]">{children}</main>
    </div>
  );
}

