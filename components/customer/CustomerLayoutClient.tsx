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
  ShieldCheck,
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
    <div className="w-full min-h-[calc(100vh-5rem)] bg-slate-50/60 dark:bg-zinc-950/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header bar desktop & mobile */}
        <div className="mb-8 flex flex-col gap-5 border-b border-zinc-200/90 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/" className="hover:text-blue-600 font-medium">
                Toko
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                Area Customer
              </span>
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Akun Customer Saya
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Pantau status pesanan secara real-time dan kelola data profil pengiriman Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Store className="h-4 w-4 text-blue-600" />
              <span>Katalog Belanja</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab navigation yang lega dan modern */}
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm sm:text-base font-bold transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Main tab content */}
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
