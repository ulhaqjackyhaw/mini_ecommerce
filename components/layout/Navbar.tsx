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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: Pure Typography Wordmark without generic AI icons */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            prefetch={true}
            className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            QUICKORDER<span className="text-zinc-400">.</span>
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
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
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
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            {isInitialized && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white tabular-nums dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Customer Link / Login button (Desktop) */}
          {isLoggedIn ? (
            <Link
              href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {userRole === 'admin' ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} />
                  <span>Admin Dashboard</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.75} />
                  <span>Akun Saya</span>
                </>
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.75} />
              <span>Masuk</span>
            </Link>
          )}

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
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
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {isLoggedIn ? (
                <Link
                  href={userRole === 'admin' ? '/admin/dashboard' : '/customer/orders'}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                >
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  <span>{userRole === 'admin' ? 'Admin Dashboard' : 'Akun & Pesanan Saya'}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  <LogIn className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
                  <span>Masuk Akun</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
