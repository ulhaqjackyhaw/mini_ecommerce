'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { createClient } from '@/lib/supabase/client';
import {
  Store,
  ShoppingBag,
  Package,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, isInitialized } = useCart();
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
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [pathname]);

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden border-t border-zinc-200/90 bg-white/95 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/95 print:hidden"
    >
      <div className="flex h-15 items-center justify-around px-2">
        {/* Katalog */}
        <Link
          href="/"
          prefetch={true}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/'
              ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <Store className="h-4.5 w-4.5 stroke-[1.75]" />
          <span className="mt-1 text-[10px] tracking-tight">Katalog</span>
        </Link>

        {/* Keranjang */}
        <Link
          href="/cart"
          prefetch={true}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            pathname === '/cart'
              ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="h-4.5 w-4.5 stroke-[1.75]" />
            {isInitialized && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[9px] font-mono tabular-nums text-white dark:bg-zinc-100 dark:text-zinc-900">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Keranjang</span>
        </Link>

        {/* Lacak Pesanan / Pesanan Saya */}
        <Link
          href={isLoggedIn ? '/customer/orders' : '/track-order'}
          prefetch={true}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            pathname.startsWith('/track-order') || pathname.startsWith('/customer/orders')
              ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <Package className="h-4.5 w-4.5 stroke-[1.75]" />
          <span className="mt-1 text-[10px] tracking-tight">
            {isLoggedIn ? 'Pesanan' : 'Lacak'}
          </span>
        </Link>

        {/* Akun / Login */}
        <Link
          href={
            userRole === 'admin'
              ? '/admin/dashboard'
              : isLoggedIn
              ? '/customer/profile'
              : '/login'
          }
          prefetch={true}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
            pathname.startsWith('/customer') ||
            pathname.startsWith('/admin') ||
            pathname === '/login' ||
            pathname === '/register'
              ? 'text-zinc-950 dark:text-zinc-50 font-semibold'
              : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          {userRole === 'admin' ? (
            <ShieldCheck className="h-4.5 w-4.5 stroke-[1.75]" />
          ) : (
            <User className="h-4.5 w-4.5 stroke-[1.75]" />
          )}
          <span className="mt-1 text-[10px] tracking-tight">
            {userRole === 'admin' ? 'Admin' : isLoggedIn ? 'Akun' : 'Masuk'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
