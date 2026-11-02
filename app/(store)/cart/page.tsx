'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { useDialog } from '@/components/ui/DialogProvider';
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
  const { confirm } = useDialog();

  if (!isInitialized) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <PageTransition className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Keranjang Belanja Kosong
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
          Belum ada produk yang ditambahkan. Silakan jelajahi katalog kami.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Store className="h-4 w-4" />
          <span>Mulai Belanja</span>
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="w-full min-h-[calc(100vh-5rem)] bg-zinc-50/50 dark:bg-zinc-950/40 py-8 sm:py-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Keranjang Belanja ({totalItems})
            </h1>
          </div>

          <button
            type="button"
            onClick={async () => {
              const confirmed = await confirm({
                title: 'Kosongkan Keranjang?',
                message:
                  'Apakah Anda yakin ingin mengosongkan seluruh isi keranjang? Semua produk yang telah dipilih akan dihapus.',
                confirmText: 'Kosongkan Keranjang',
                cancelText: 'Batal',
                type: 'danger',
              });
              if (confirmed) {
                clearCart();
              }
            }}
            className="text-xs font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
          >
            Kosongkan
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Cart items list (8 cols) */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-zinc-200/80 rounded-xl border border-zinc-200/80 bg-white shadow-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
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
                      transition={{ duration: 0.15 }}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
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
                          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-zinc-500 font-mono tabular-nums dark:text-zinc-400">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-zinc-400 font-mono tabular-nums">
                            Sisa stok: {item.stock_quantity}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & subtotal & delete */}
                      <div className="flex items-center justify-between gap-4 sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                        {/* Stepper */}
                        <div className="flex items-center rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-zinc-700 shadow-xs hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200"
                            title="Kurangi"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isMaxStock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                              isMaxStock
                                ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                                : 'bg-white text-zinc-700 shadow-xs hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200'
                            }`}
                            title={isMaxStock ? 'Stok penuh' : 'Tambah'}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-xs sm:text-sm font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Hapus dari Keranjang?',
                              message: `Hapus "${item.name}" dari keranjang belanja Anda?`,
                              confirmText: 'Hapus Item',
                              cancelText: 'Batal',
                              type: 'danger',
                            });
                            if (confirmed) {
                              removeItem(item.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                          title="Hapus"
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

          {/* Order Summary sidebar (4 cols) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Ringkasan Pesanan
              </h2>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Total Kuantitas</span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {totalItems} item
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Total Pembayaran
                    </span>
                    <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-3 text-center text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
