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
    try {
      const supabase = createClient();
      supabase.auth
        .getUser()
        .then(({ data }) => {
          const user = data?.user;
          if (user) {
            setIsLoggedIn(true);
            (supabase as any)
              .from('admin_profiles')
              .select('role')
              .eq('user_id', user.id)
              .single()
              .then(({ data: profileData }: any) => {
                if (profileData?.role === 'admin') {
                  setUserRole('admin');
                } else {
                  setUserRole('customer');
                }
              })
              .catch(() => {
                setUserRole('customer');
              });
          } else {
            setIsLoggedIn(false);
            setUserRole(null);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
          setUserRole(null);
        });
    } catch {
      // Safe fallback
      setIsLoggedIn(false);
      setUserRole(null);
    }
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 print:hidden">
      <div className="mx-auto flex h-18 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-3 text-xl font-black tracking-tight text-zinc-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition hover:scale-105">
              <Package className="h-6 w-6" />
            </div>
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
              QuickOrder
            </span>
          </Link>

          {/* Desktop Navigation yang Proporsional & Lega */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shadow-xs'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="h-4 w-4 stroke-[2.5]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Button */}
          <Link
            href="/cart"
            prefetch={true}
            aria-label="Keranjang belanja"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/80 bg-white text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-5 w-5" />
            {isInitialized && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-black text-white shadow-sm animate-pulse">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Customer Link / Login button (Desktop) */}
          {isLoggedIn ? (
            <Link
              href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
              className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogIn className="h-4 w-4 text-zinc-500" />
              <span>Masuk / Akun</span>
            </Link>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex md:hidden items-center justify-center rounded-2xl p-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-lg">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              {isLoggedIn ? (
                <Link
                  href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400"
                >
                  <User className="h-5 w-5" />
                  <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Akun & Pesanan Saya'}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Masuk Akun Customer</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
