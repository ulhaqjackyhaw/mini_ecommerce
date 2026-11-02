'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  X,
  Flame,
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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDetailProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        message: `${detailQuantity}x ${product.name} berhasil ditambahkan ke keranjang belanja Anda.`,
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
      {/* Toast Alert Card Notification (Desain Seragam & Menawan) */}
      {toastAlert && (
        <ToastCard alert={toastAlert} onClose={() => setToastAlert(null)} />
      )}

      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-blue-50/70 via-white to-zinc-50/50 px-4 py-8 sm:py-12 dark:border-zinc-800/80 dark:from-zinc-900/80 dark:via-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/90 px-3.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pesan Cepat • Langsung Kirim • Tanpa Wajib Login</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Katalog Produk Favorit
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Pilih menu makanan dan minuman lezat, tambahkan ke keranjang, dan selesaikan pesanan dengan mudah tanpa ribet.
          </p>

          {/* Search Input Bar */}
          <div className="mx-auto mt-6 max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari makanan, minuman, camilan..."
                className="w-full rounded-2xl border border-zinc-300 bg-white py-3 pl-11 pr-12 text-xs sm:text-sm font-medium shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-zinc-700 border border-zinc-200/90 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Semua Kategori</span>
            </button>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'bg-white text-zinc-700 border border-zinc-200/90 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
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
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 bg-white py-16 px-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
              Produk Tidak Ditemukan
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
              Tidak ada produk yang sesuai dengan filter atau kata kunci &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Lihat Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-4/3 sm:aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-8 w-8 sm:h-12 sm:w-12" />
                      </div>
                    )}

                    {/* Category Badge (Top Left) */}
                    {product.category?.name && (
                      <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
                        <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-zinc-800 backdrop-blur-md shadow-xs dark:bg-zinc-900/95 dark:text-zinc-200">
                          {product.category.name}
                        </span>
                      </div>
                    )}

                    {/* Stock Status Badge (Top Right) */}
                    <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
                      {isOutOfStock ? (
                        <span className="rounded-full bg-rose-600 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
                          Habis
                        </span>
                      ) : product.stock_quantity <= 5 ? (
                        <span className="rounded-full bg-amber-500 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-xs">
                          Sisa {product.stock_quantity}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-600/90 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white backdrop-blur-md shadow-xs">
                          Stok {product.stock_quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="flex flex-1 flex-col p-3.5 sm:p-5">
                    {/* Title & Description */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[28px] sm:min-h-[32px]">
                        {product.description || 'Pilihan lezat dan berkualitas untuk dinikmati kapan saja.'}
                      </p>

                      {/* Badge Terjual X pcs (Ringkas di Kartu Katalog) */}
                      {soldCount > 0 && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          <Flame className="h-3 w-3" />
                          <span>Terjual {soldCount} pcs</span>
                        </div>
                      )}
                    </div>

                    {/* Price Tag */}
                    <div className="mt-3 sm:mt-4 flex items-baseline justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Harga
                        </span>
                        <span className="text-sm sm:text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">
                          {formatCurrency(product.price)}
                        </span>
                      </div>

                      {inCartQty > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{inCartQty} di troli</span>
                        </span>
                      )}
                    </div>

                    {/* Action Button: Rapi, Proporsional, Full-width & Nyaman di Jempol */}
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      {isOutOfStock ? (
                        <button
                          type="button"
                          disabled
                          className="w-full flex items-center justify-center py-2.5 px-3 rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-semibold text-xs cursor-not-allowed"
                        >
                          Stok Habis
                        </button>
                      ) : inCartQty > 0 ? (
                        /* Modern Quantity Stepper when already in cart */
                        <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-blue-50/90 dark:bg-blue-950/60 p-1 border border-blue-200 dark:border-blue-900/80 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQuantity(product.id, inCartQty)}
                            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition active:scale-95"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>

                          <div className="flex flex-col items-center">
                            <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300">
                              {inCartQty}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isMaxInCart}
                            onClick={() => handleAddToCart(product)}
                            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl shadow-xs transition active:scale-95 ${
                              isMaxInCart
                                ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                            }`}
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ) : (
                        /* Clean Primary Full-width Add Button */
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/30'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Ditambahkan!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 stroke-[2.5]" />
                              <span>Tambah ke Keranjang</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Produk Interaktif & Responsif */}
      {selectedDetailProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedDetailProduct(null)}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Sticky) */}
            <div className="flex items-center justify-between border-b border-zinc-100 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 shrink-0">
              <div className="flex items-center gap-2">
                {selectedDetailProduct.category?.name && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {selectedDetailProduct.category.name}
                  </span>
                )}
                <span className="text-xs font-semibold text-zinc-400">Detail Produk</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition"
                aria-label="Tutup detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              {/* Product Image */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-inner">
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
                    <ShoppingBag className="h-16 w-16" />
                  </div>
                )}

                {/* Stock Tag on Image */}
                <div className="absolute right-3 top-3">
                  {selectedDetailProduct.stock_quantity <= 0 ? (
                    <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                      Stok Habis
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                      Tersedia: {selectedDetailProduct.stock_quantity} pcs
                    </span>
                  )}
                </div>
              </div>

              {/* Title, Price, & Badges */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                    {selectedDetailProduct.name}
                  </h2>
                  <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedDetailProduct.price)}
                  </div>
                </div>

                {/* Stats Badge Terjual & Sisa Stok */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      Terjual {soldCounts[selectedDetailProduct.id] || 0} pcs
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Package className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Sisa Stok: {selectedDetailProduct.stock_quantity} unit</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Deskripsi Lengkap
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedDetailProduct.description ||
                    'Produk pilihan terbaik yang diproses higienis dan disajikan segar untuk kepuasan Anda.'}
                </p>
              </div>

              {/* Quantity Selector */}
              {selectedDetailProduct.stock_quantity > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Jumlah Pesanan
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Maksimal pembelian: {selectedDetailProduct.stock_quantity} unit
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={detailQuantity <= 1}
                      onClick={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-base font-black text-zinc-900 dark:text-zinc-100">
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
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer / Direct Add Button */}
            <div className="flex items-center gap-3 border-t border-zinc-100 p-4 sm:p-5 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDetailProduct(null)}
                className="rounded-2xl border border-zinc-300 bg-white px-5 py-3.5 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Tutup
              </button>

              {selectedDetailProduct.stock_quantity <= 0 ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 rounded-2xl bg-zinc-200 py-3.5 text-center text-xs font-bold text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                >
                  Stok Habis
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddDetailToCart(selectedDetailProduct)}
                  className="flex flex-1 items-center justify-between rounded-2xl bg-blue-600 px-5 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Tambah ke Keranjang ({detailQuantity} pcs)</span>
                  </span>
                  <span className="text-sm sm:text-base font-black">
                    {formatCurrency(selectedDetailProduct.price * detailQuantity)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
