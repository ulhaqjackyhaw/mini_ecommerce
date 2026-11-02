'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Boxes,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Radio,
  User,
} from 'lucide-react';

interface RealtimeContextType {
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';
  setStatus: (status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED') => void;
}

export const AdminRealtimeContext = createContext<RealtimeContextType>({
  status: 'CONNECTED',
  setStatus: () => {},
});

export const useAdminRealtime = () => useContext(AdminRealtimeContext);

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<
    'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'
  >('CONNECTED');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setAdminEmail(user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    {
      name: 'Dashboard & Transaksi',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Produk & Stok',
      href: '/admin/products',
      icon: Boxes,
    },
  ];

  return (
    <AdminRealtimeContext.Provider
      value={{ status: realtimeStatus, setStatus: setRealtimeStatus }}
    >
      <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Brand */}
          <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                QuickOrder
              </span>
              <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider dark:text-blue-400">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-4">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Lihat Toko Publik</span>
                </span>
                <span className="text-[10px] text-zinc-400">Baru</span>
              </Link>
            </div>
          </nav>

          {/* Realtime Status Indicator & User Info */}
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 space-y-3">
            {/* Realtime Pill */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
              <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Radio className="h-3.5 w-3.5 text-blue-500" />
                <span>Supabase Live</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    realtimeStatus === 'CONNECTED'
                      ? 'bg-emerald-500 animate-pulse'
                      : realtimeStatus === 'CONNECTING'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  {realtimeStatus === 'CONNECTED'
                    ? 'Live'
                    : realtimeStatus === 'CONNECTING'
                    ? 'Connecting'
                    : 'Offline'}
                </span>
              </span>
            </div>

            {/* User info */}
            {adminEmail && (
              <div className="flex items-center gap-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
                <User className="h-3.5 w-3.5" />
                <span className="truncate max-w-[170px]" title={adminEmail}>
                  {adminEmail}
                </span>
              </div>
            )}

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        {/* Mobile Top Header */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                Admin Panel
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    realtimeStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {realtimeStatus === 'CONNECTED' ? 'Live' : 'Connecting'}
              </span>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="border-b border-zinc-200 bg-white p-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                    pathname === link.href
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              ))}

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Lihat Toko Publik</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminRealtimeContext.Provider>
  );
}

