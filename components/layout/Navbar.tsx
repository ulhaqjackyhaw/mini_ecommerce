'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';
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

  // SEMBUNYIKAN NAVBAR PUBLIK SAAT BERADA DI HALAMAN ADMIN AGAR TIDAK DOUBLE NAVBAR
  if (pathname.startsWith('/admin')) {
    return null;
  }

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
        {/* Brand: Logo with modern monogram and brand typography */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            prefetch={true}
            className="transition-opacity hover:opacity-85"
            aria-label="AmaraStore Home"
          >
            <Logo iconSize="md" />
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
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/customer/orders"
                prefetch={true}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Pesanan Saya</span>
              </Link>
              <Link
                href="/customer/profile"
                prefetch={true}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Profil</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              prefetch={true}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Masuk</span>
            </Link>
          )}

          {/* Admin Panel Direct Link (Desktop) */}
          <Link
            href="/admin/dashboard"
            prefetch={true}
            className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium ${
                    active
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/customer/orders"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400"
                  >
                    <Package className="h-4 w-4" strokeWidth={1.75} />
                    <span>Pesanan Saya</span>
                  </Link>
                  <Link
                    href="/customer/profile"
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400"
                  >
                    <User className="h-4 w-4" strokeWidth={1.75} />
                    <span>Profil Customer</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.75} />
                  <span>Masuk ke Akun</span>
                </Link>
              )}

              <Link
                href="/admin/dashboard"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-mono uppercase text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                <span>Portal Admin</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
