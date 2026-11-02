'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/database';
import {
  Search,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  X,
  Package,
} from 'lucide-react';
import PageTransition from '@/components/animations/PageTransition';
import ToastCard, { type ToastAlert } from '@/components/ui/ToastCard';

interface CatalogViewProps {
  initialProducts: Product[];
  categories: Category[];
  soldCounts?: Record<string, number>;
}

export default function CatalogView({
  initialProducts,
  categories,
  soldCounts = {},
}: CatalogViewProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);

  // Modal Detail Produk State
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll and listen to Escape key when modal is open
  useEffect(() => {
    if (selectedDetailProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDetailProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDetailProduct]);

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
      }, 1000);
    } else if (res.message) {
      setToastAlert({
        type: 'warning',
        title: 'Batas Stok Tercapai',
        message: res.message,
      });
    }
  };

  const handleDecreaseQuantity = (productId: string, currentQty: number) => {
    updateQuantity(productId, currentQty - 1);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedDetailProduct(product);
    setDetailQuantity(1);
  };

  const handleAddDetailToCart = (product: Product) => {
    const res = addItem(product, detailQuantity);
    if (res.success) {
      setAddedProductId(product.id);
      setToastAlert({
        type: 'success',
        title: 'Berhasil Masuk Keranjang',
        message: `${detailQuantity}x ${product.name} berhasil ditambahkan ke keranjang.`,
      });
      setTimeout(() => {
        setAddedProductId(null);
      }, 1500);
      setSelectedDetailProduct(null);
    } else if (res.message) {
      setToastAlert({
        type: 'warning',
        title: 'Batas Stok Tercapai',
        message: res.message,
      });
    }
  };

  return (
    <PageTransition className="w-full">
      {/* Toast Alert Card Notification */}
      {toastAlert && (
        <ToastCard alert={toastAlert} onClose={() => setToastAlert(null)} />
      )}

      {/* Clean Editorial Header Section */}
      <section className="border-b border-zinc-200/80 bg-zinc-50/50 px-4 py-10 sm:py-16 dark:border-zinc-800 dark:bg-zinc-950/40">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
            Koleksi Pilihan
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Katalog Produk
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base lg:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Pesan langsung tanpa perlu login. Produk segar siap dikirim atau diambil di tempat.
          </p>

          {/* Search Input Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu, minuman, atau camilan..."
                className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 sm:py-4 pl-12 sm:pl-13 pr-14 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 shadow-sm transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white text-zinc-600 border border-zinc-200/90 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`rounded-xl px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition shadow-xs ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'bg-white text-zinc-600 border border-zinc-200/90 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Catalog Product Grid */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white py-20 px-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Produk Tidak Ditemukan
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-6 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xs"
            >
              Lihat Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:gap-8">
            {filteredProducts.map((product) => {
              const inCartQty = getItemQuantity(product.id);
              const isOutOfStock = product.stock_quantity <= 0;
              const isMaxInCart = inCartQty >= product.stock_quantity;
              const isJustAdded = addedProductId === product.id;
              const soldCount = soldCounts[product.id] || 0;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetail(product)}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 cursor-pointer"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-103"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute right-3 top-3">
                      {isOutOfStock ? (
                        <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          Habis
                        </span>
                      ) : product.stock_quantity <= 5 ? (
                        <span className="rounded-lg bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white tabular-nums shadow-xs">
                          Sisa {product.stock_quantity}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
                    <div className="flex-1">
                      {product.category?.name && (
                        <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="mt-1 text-sm sm:text-base lg:text-lg font-bold text-zinc-900 line-clamp-1 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-zinc-500 leading-relaxed min-h-[36px] sm:min-h-[42px] dark:text-zinc-400">
                        {product.description || 'Pilihan lezat dan berkualitas.'}
                      </p>

                      {soldCount > 0 && (
                        <div className="mt-2 text-xs font-mono font-medium text-zinc-400 tabular-nums">
                          Terjual {soldCount} pcs
                        </div>
                      )}
                    </div>

                    {/* Price & Action */}
                    <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-baseline justify-between mb-2.5">
                        <span className="text-sm sm:text-lg lg:text-xl font-black font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(product.price)}
                        </span>
                        {inCartQty > 0 && (
                          <span className="text-xs font-semibold text-zinc-500 font-mono tabular-nums">
                            {inCartQty} di troli
                          </span>
                        )}
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        {isOutOfStock ? (
                          <button
                            type="button"
                            disabled
                            className="w-full h-10 sm:h-11 rounded-xl bg-zinc-100 text-zinc-400 font-semibold text-xs sm:text-sm cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                          >
                            Stok Habis
                          </button>
                        ) : inCartQty > 0 ? (
                          <div className="flex h-10 sm:h-11 items-center justify-between rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQuantity(product.id, inCartQty)}
                              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-xs hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 transition"
                              aria-label="Kurangi"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                              {inCartQty}
                            </span>
                            <button
                              type="button"
                              disabled={isMaxInCart}
                              onClick={() => handleAddToCart(product)}
                              className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg transition ${
                                isMaxInCart
                                  ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                                  : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                              }`}
                              aria-label="Tambah"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className={`w-full h-10 sm:h-11 flex items-center justify-center gap-2 px-4 rounded-xl font-semibold text-xs sm:text-sm transition shadow-xs ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="h-4 w-4 stroke-[2.25]" />
                                <span>Ditambahkan</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 stroke-[2.25]" />
                                <span>Keranjang</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Produk: Mounted to document.body via Portal to prevent any parent transforms or clipping */}
      {isMounted && selectedDetailProduct && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedDetailProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 shrink-0">
              <div className="flex items-center gap-2">
                {selectedDetailProduct.category?.name && (
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {selectedDetailProduct.category.name}
                  </span>
                )}
                <span className="text-xs text-zinc-400">Detail Produk</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition"
                aria-label="Tutup detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
              {/* Product Image */}
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                {selectedDetailProduct.image_url ? (
                  <Image
                    src={selectedDetailProduct.image_url}
                    alt={selectedDetailProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                )}

                <div className="absolute right-2.5 top-2.5">
                  {selectedDetailProduct.stock_quantity <= 0 ? (
                    <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-medium text-white">
                      Habis
                    </span>
                  ) : (
                    <span className="rounded-md bg-zinc-900/90 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs font-mono tabular-nums">
                      Stok: {selectedDetailProduct.stock_quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedDetailProduct.name}
                  </h2>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(selectedDetailProduct.price)}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 font-mono tabular-nums">
                  <span>Terjual: {soldCounts[selectedDetailProduct.id] || 0} pcs</span>
                  <span>•</span>
                  <span>Sisa: {selectedDetailProduct.stock_quantity} unit</span>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Deskripsi
                </span>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedDetailProduct.description ||
                    'Produk pilihan terbaik diproses secara higienis dan disajikan segar.'}
                </p>
              </div>

              {/* Quantity Stepper */}
              {selectedDetailProduct.stock_quantity > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800">
                  <div>
                    <span className="block text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      Jumlah Pesanan
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                      Maksimal: {selectedDetailProduct.stock_quantity} unit
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={detailQuantity <= 1}
                      onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {detailQuantity}
                    </span>
                    <button
                      type="button"
                      disabled={detailQuantity >= selectedDetailProduct.stock_quantity}
                      onClick={() =>
                        setDetailQuantity((q) =>
                          Math.min(selectedDetailProduct.stock_quantity, q + 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer: Compact, Single-row, Zero-wrapping */}
            <div className="flex items-center gap-2.5 border-t border-zinc-200/80 bg-zinc-50/80 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-950/80 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                className="h-10 px-4 rounded-xl border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 transition"
              >
                Tutup
              </button>

              {selectedDetailProduct.stock_quantity <= 0 ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 h-10 rounded-xl bg-zinc-200 text-center text-xs font-semibold text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                >
                  Stok Habis
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddDetailToCart(selectedDetailProduct)}
                  className="flex-1 h-10 px-4 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center justify-between text-xs sm:text-sm font-semibold transition"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                    <span>Tambah ke Keranjang ({detailQuantity})</span>
                  </span>
                  <span className="font-mono tabular-nums shrink-0 ml-2">
                    {formatCurrency(selectedDetailProduct.price * detailQuantity)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </PageTransition>
  );
}
