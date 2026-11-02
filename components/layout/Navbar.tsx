'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingBag,
  Package,
  Search,
  ShieldCheck,
  Menu,
  X,
  Store,
  User,
  LogIn,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, isInitialized } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        (supabase as any)
          .from('admin_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
          .then(({ data }: any) => {
            if (data?.role === 'admin') {
              setUserRole('admin');
            } else {
              setUserRole('customer');
            }
          });
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    });
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    {
      name: 'Katalog',
      href: '/',
      icon: Store,
    },
    {
      name: 'Lacak Pesanan',
      href: '/track-order',
      icon: Search,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:scale-105">
              <Package className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
              QuickOrder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Button */}
          <Link
            href="/cart"
            prefetch={true}
            aria-label="Keranjang belanja"
            className="relative flex items-center justify-center rounded-xl p-2 text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-5 w-5" />
            {isInitialized && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Customer Link / Login button (Desktop) */}
          {isLoggedIn ? (
            <Link
              href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {userRole === 'admin' ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Admin Panel</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Pesanan Saya</span>
                </>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-500" />
              <span>Masuk / Akun</span>
            </Link>
          )}

          {/* Admin shortcut if not admin logged in */}
          {userRole !== 'admin' && (
            <Link
              href="/admin/login"
              prefetch={true}
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex md:hidden items-center justify-center rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-2 pb-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              {isLoggedIn ? (
                <Link
                  href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400"
                >
                  <User className="h-4 w-4" />
                  <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Akun & Pesanan Saya'}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk Akun Customer</span>
                </Link>
              )}

              <Link
                href="/admin/login"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Portal Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
