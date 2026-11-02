'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/animations/PageTransition';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Store,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    totalItems,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    isInitialized,
  } = useCart();

  if (!isInitialized) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Keranjang Belanja Masih Kosong
        </h2>
        <p className="mt-2 text-xs text-zinc-500 max-w-sm dark:text-zinc-400">
          Belum ada produk yang ditambahkan. Silakan jelajahi katalog dan pilih produk favorit Anda.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Store className="h-4 w-4" />
          <span>Mulai Belanja</span>
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Lanjut Belanja</span>
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">
            Keranjang ({totalItems} item)
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
              clearCart();
            }
          }}
          className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart items list */}
        <div className="lg:col-span-8">
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200/90 bg-white shadow-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <AnimatePresence>
              {items.map((item) => {
                const isMaxStock = item.quantity >= item.stock_quantity;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      {/* Name & price */}
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          Harga satuan: {formatCurrency(item.price)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          Stok tersedia: {item.stock_quantity}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & subtotal & delete */}
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      {/* Quantity controls */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            title="Kurang satu"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxStock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={`flex h-8 w-8 items-center justify-center transition ${
                              isMaxStock
                                ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                                : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                            title={isMaxStock ? 'Stok maksimum tercapai' : 'Tambah satu'}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {isMaxStock && (
                          <span className="mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            Maksimal stok
                          </span>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[90px]">
                        <span className="block text-[10px] uppercase font-semibold text-zinc-400">Subtotal</span>
                        <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-xl p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Hapus dari keranjang"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ringkasan Pesanan
            </h2>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Total Kuantitas</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {totalItems} unit
                </span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Total
                  </span>
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {formatCurrency(total)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Checkout tanpa biaya admin atau pajak tersembunyi.
                </p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-98"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 rounded-xl bg-blue-50/60 p-3 text-xs text-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
              ⚡ <strong>Quick Order:</strong> Anda dapat checkout langsung tanpa login, atau masuk ke akun Customer untuk menyimpan riwayat pesanan.
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
