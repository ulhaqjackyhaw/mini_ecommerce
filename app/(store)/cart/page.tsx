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
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Keranjang Belanja Masih Kosong
        </h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
          Belum ada produk yang ditambahkan. Silakan jelajahi katalog dan pilih produk favorit Anda.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 hover:scale-[1.02]"
        >
          <Store className="h-5 w-5" />
          <span>Mulai Belanja</span>
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="w-full min-h-[calc(100vh-5rem)] bg-slate-50/60 dark:bg-zinc-950/60 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Lanjut Belanja</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
              Keranjang Belanja ({totalItems} item)
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengosongkan seluruh keranjang?')) {
                clearCart();
              }
            }}
            className="text-xs sm:text-sm font-bold text-red-600 hover:underline dark:text-red-400"
          >
            Kosongkan Keranjang
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Cart items list (8 cols) */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-zinc-200/80 rounded-3xl border border-zinc-200/90 bg-white shadow-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
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
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"
                    >
                      <div className="flex items-center gap-5">
                        {/* Thumbnail */}
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-xs">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </div>

                        {/* Name & price */}
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            Harga satuan: <strong className="text-zinc-700 dark:text-zinc-300">{formatCurrency(item.price)}</strong>
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            Stok tersisa: {item.stock_quantity}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & subtotal & delete */}
                      <div className="flex items-center justify-between gap-6 sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                        {/* Stepper */}
                        <div className="flex flex-col items-center">
                          <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-xs transition hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200"
                              title="Kurang satu"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-black text-zinc-900 dark:text-zinc-100">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isMaxStock}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                                isMaxStock
                                  ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                                  : 'bg-white text-zinc-700 shadow-xs hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-200'
                              }`}
                              title={isMaxStock ? 'Stok maksimum tercapai' : 'Tambah satu'}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {isMaxStock && (
                            <span className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              Maksimal stok
                            </span>
                          )}
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[110px]">
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                            Subtotal
                          </span>
                          <span className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-2xl p-2.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary sidebar (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                Ringkasan Pesanan
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Total Kuantitas</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {totalItems} item
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal Belanja</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Total Pembayaran
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Harga final tanpa biaya tambahan atau potongan tersembunyi.
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 py-4 text-center text-sm sm:text-base font-black text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-98"
              >
                <span>Lanjut ke Form Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="mt-5 rounded-2xl bg-blue-50/70 p-4 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                ⚡ <strong>Instan & Tanpa Syarat:</strong> Anda dapat langsung checkout tanpa login sebagai Guest, atau masuk ke akun Customer untuk menyimpan riwayat dan auto-fill.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
