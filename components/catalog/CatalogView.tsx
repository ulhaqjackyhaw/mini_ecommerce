'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/database';
import { Search, Plus, Check, ShoppingBag, AlertCircle } from 'lucide-react';

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
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg animate-bounce">
          <AlertCircle className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white px-4 py-8 text-center sm:py-12 dark:from-zinc-900 dark:to-zinc-950">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Katalog Produk Cepat & Praktis
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
          Pilih menu favorit Anda, tambahkan ke keranjang, dan checkout dalam hitungan detik tanpa perlu login.
        </p>

        {/* Search Input */}
        <div className="mx-auto mt-6 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari makanan, minuman, camilan..."
              className="w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm ${
                selectedCategory === cat.slug || selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
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
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Tidak ada produk yang cocok dengan pencarian atau kategori ini.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
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
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}

                    {/* Category pill on image */}
                    {product.category?.name && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-800 backdrop-blur shadow-sm dark:bg-zinc-900/90 dark:text-zinc-200">
                        {product.category.name}
                      </span>
                    )}

                    {/* Stock status badge */}
                    <div className="absolute right-3 top-3">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                          Stok Habis
                        </span>
                      ) : product.stock_quantity <= 5 ? (
                        <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Sisa {product.stock_quantity} unit
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-600/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur shadow-sm">
                          Stok: {product.stock_quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
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
                        <span className="block text-xs text-zinc-400">Harga</span>
                        <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock || isMaxInCart}
                        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                          isOutOfStock
                            ? 'cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                            : isMaxInCart
                            ? 'cursor-not-allowed bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
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
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

