'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/components/cart/CartProvider';
import { createClient } from '@/lib/supabase/client';
import {
  Store,
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems, isInitialized } = useCart();
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        // Check admin
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

  // Sembunyikan bottom nav pada mode cetak
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 print:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {/* Katalog */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition ${
            pathname === '/'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Store className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">Katalog</span>
        </Link>

        {/* Keranjang */}
        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center py-1 transition ${
            pathname === '/cart'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {isInitialized && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-extrabold text-white shadow-sm">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] font-semibold">Keranjang</span>
        </Link>

        {/* Lacak Pesanan / Pesanan Saya */}
        <Link
          href={isLoggedIn ? '/customer/orders' : '/track-order'}
          className={`flex flex-col items-center justify-center py-1 transition ${
            pathname.startsWith('/track-order') || pathname.startsWith('/customer/orders')
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Package className="h-5 w-5" />
          <span className="mt-1 text-[10px] font-semibold">
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
          className={`flex flex-col items-center justify-center py-1 transition ${
            pathname.startsWith('/customer') ||
            pathname.startsWith('/admin') ||
            pathname === '/login' ||
            pathname === '/register'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          {userRole === 'admin' ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="mt-1 text-[10px] font-semibold">
            {userRole === 'admin' ? 'Admin' : isLoggedIn ? 'Akun' : 'Masuk'}
          </span>
        </Link>
      </div>
    </div>
  );
}
