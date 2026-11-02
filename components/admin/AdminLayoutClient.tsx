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
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          {/* Brand Wordmark (No Generic AI Icon) */}
          <div className="flex h-16 items-center justify-between border-b border-zinc-200/80 px-6 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-900 text-base dark:text-zinc-50">
                QUICKORDER.
              </span>
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Admin
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-4 w-4 stroke-[1.75]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
                  <span>Lihat Toko Publik</span>
                </span>
              </Link>
            </div>
          </nav>

          {/* Realtime Status Indicator & User Info */}
          <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
            {/* Realtime Pill */}
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Radio className="h-3.5 w-3.5" />
                <span>Supabase Live</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    realtimeStatus === 'CONNECTED'
                      ? 'bg-emerald-500'
                      : realtimeStatus === 'CONNECTING'
                      ? 'bg-amber-500'
                      : 'bg-zinc-400'
                  }`}
                />
                <span className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                  {realtimeStatus === 'CONNECTED'
                    ? 'Connected'
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* Mobile Top Header */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-15 items-center justify-between border-b border-zinc-200/80 bg-white px-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                QUICKORDER.
              </span>
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    realtimeStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>Live</span>
              </span>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </header>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="border-b border-zinc-200 bg-white p-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium ${
                        active
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Lihat Toko Publik</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar (Logout)</span>
                </button>
              </nav>
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
