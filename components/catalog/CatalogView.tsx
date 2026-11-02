'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/database';
import { Search, Plus, Check, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';
import PageTransition from '@/components/animations/PageTransition';

interface CatalogViewProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogView({ initialProducts, categories }: CatalogViewProps) {
  const { addItem, getItemQuantity } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter products by category and search keyword
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const productCategorySlug = product.category?.slug || '';
        const categoryMatch =
          product.category_id === selectedCategory ||
          productCategorySlug === selectedCategory;
        if (!categoryMatch) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query) ?? false;
        return nameMatch || descMatch;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    const res = addItem(product, 1);
    if (res.success) {
      setAddedProductId(product.id);
      setTimeout(() => {
        setAddedProductId(null);
      }, 1200);
    } else if (res.message) {
      setToastMessage(res.message);
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };

  return (
    <PageTransition className="w-full">
      {/* Toast Notification with AnimatePresence */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-semibold text-white shadow-2xl"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-zinc-50/40 px-4 py-8 text-center sm:py-12 dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 mb-3">
            <Sparkles className="h-3 w-3" />
            <span>Pesan Cepat • Tanpa Wajib Login</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Katalog Produk Cepat & Praktis
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
            Pilih produk favorit Anda, tambahkan ke keranjang, dan dapatkan invoice digital secara instan.
          </p>

          {/* Search Input */}
          <div className="mx-auto mt-6 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari makanan, minuman, camilan..."
                className="w-full rounded-2xl border border-zinc-300 bg-white py-3 pl-11 pr-4 text-xs shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat.slug || selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-800">
            <ShoppingBag className="h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Produk Tidak Ditemukan
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const inCartQty = getItemQuantity(product.id);
              const isOutOfStock = product.stock_quantity <= 0;
              const isMaxInCart = inCartQty >= product.stock_quantity;
              const isJustAdded = addedProductId === product.id;

              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}

                    {/* Category pill on image */}
                    {product.category?.name && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-zinc-800 backdrop-blur shadow-xs dark:bg-zinc-900/95 dark:text-zinc-200">
                        {product.category.name}
                      </span>
                    )}

                    {/* Stock status badge */}
                    <div className="absolute right-3 top-3">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                          Stok Habis
                        </span>
                      ) : product.stock_quantity <= 5 ? (
                        <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                          Sisa {product.stock_quantity}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur shadow-xs">
                          Stok: {product.stock_quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price and Add button */}
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-zinc-400">
                          Harga
                        </span>
                        <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock || isMaxInCart}
                        className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                          isOutOfStock
                            ? 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                            : isMaxInCart
                            ? 'cursor-not-allowed bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : isJustAdded
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Habis'
                        ) : isJustAdded ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Ditambah</span>
                          </>
                        ) : isMaxInCart ? (
                          'Maksimal'
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            <span>{inCartQty > 0 ? `+1 (${inCartQty})` : 'Tambah'}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
