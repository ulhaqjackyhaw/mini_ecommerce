'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types/database';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Check,
  X,
  AlertCircle,
  Loader2,
  Package,
  Power,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

interface ProductManagementViewProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductManagementView({
  initialProducts,
  categories,
}: ProductManagementViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Quick Inline Editing
  const [inlineEditingStockId, setInlineEditingStockId] = useState<string | null>(null);
  const [inlineStockValue, setInlineStockValue] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormCategoryId(categories[0]?.id || '');
    setFormDescription('');
    setFormPrice(10000);
    setFormStock(10);
    setFormImageUrl('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormCategoryId(product.category_id || '');
    setFormDescription(product.description || '');
    setFormPrice(product.price);
    setFormStock(product.stock_quantity);
    setFormImageUrl(product.image_url || '');
    setFormIsActive(product.is_active);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingProduct) {
        // Edit existing
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formName.trim(),
            slug: formSlug.trim(),
            category_id: formCategoryId || null,
            description: formDescription.trim() || null,
            price: Number(formPrice),
            stock_quantity: Number(formStock),
            image_url: formImageUrl.trim() || null,
            is_active: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.message || 'Gagal menyimpan perubahan produk.');
          setIsSaving(false);
          return;
        }

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? json.data : p))
        );
        showToast('Produk berhasil diperbarui.');
      } else {
        // Create new
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName.trim(),
            slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category_id: formCategoryId || null,
            description: formDescription.trim() || null,
            price: Number(formPrice),
            stock_quantity: Number(formStock),
            image_url: formImageUrl.trim() || null,
            is_active: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.message || 'Gagal menambahkan produk.');
          setIsSaving(false);
          return;
        }

        setProducts((prev) => [json.data, ...prev]);
        showToast('Produk baru berhasil ditambahkan.');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save product error:', err);
      alert('Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Active / Nonaktif
  const handleToggleActive = async (product: Product) => {
    const updatedStatus = !product.is_active;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          is_active: updatedStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.message || 'Gagal mengubah status aktif produk.');
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: updatedStatus } : p))
      );
      showToast(
        `Produk ${product.name} sekarang ${updatedStatus ? 'Aktif' : 'Nonaktif'}.`
      );
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Save quick stock
  const handleSaveInlineStock = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          stock_quantity: Math.max(0, Number(inlineStockValue)),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? { ...p, stock_quantity: Math.max(0, Number(inlineStockValue)) }
              : p
          )
        );
        showToast(`Stok ${product.name} berhasil diperbarui.`);
      }
    } catch (err) {
      console.error('Inline stock update error:', err);
    } finally {
      setInlineEditingStockId(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Manajemen Produk & Stok
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Kelola katalog produk, update harga satuan, atur jumlah stok, dan ubah visibilitas produk.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Controls */}
        <div className="border-b border-zinc-200 p-4 sm:flex sm:items-center sm:justify-between gap-4 dark:border-zinc-800">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 sm:mb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              Semua ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-xl border border-zinc-300 bg-white py-1.5 pl-9 pr-3 text-xs shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Product Table (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/50 text-zinc-500 uppercase tracking-wider font-semibold dark:border-zinc-800 dark:bg-zinc-950/30">
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Tidak ada produk yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isEditingThisStock = inlineEditingStockId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition"
                    >
                      {/* Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                <ShoppingBag className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {p.name}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">
                              {p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {p.category?.name || '-'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.price)}
                      </td>

                      {/* Stock with quick inline editor */}
                      <td className="py-3 px-4 text-center">
                        {isEditingThisStock ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={inlineStockValue}
                              onChange={(e) => setInlineStockValue(Number(e.target.value))}
                              className="w-16 rounded border border-blue-500 py-1 px-1.5 text-center text-xs dark:bg-zinc-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineStock(p)}
                              className="rounded bg-blue-600 p-1 text-white hover:bg-blue-700"
                              title="Simpan"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlineEditingStockId(null)}
                              className="rounded bg-zinc-200 p-1 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300"
                              title="Batal"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEditingStockId(p.id);
                              setInlineStockValue(p.stock_quantity);
                            }}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition hover:opacity-80 ${
                              p.stock_quantity === 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                : p.stock_quantity <= 5
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            }`}
                            title="Klik untuk ubah stok cepat"
                          >
                            {p.stock_quantity} unit
                          </button>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500'
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          title="Edit Produk Lengkap"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Product Mobile Cards */}
        <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              Tidak ada produk yang sesuai.
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    {p.image_url ? (
                      <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs truncate text-zinc-900 dark:text-zinc-100">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-mono">{p.slug}</p>
                    <span className="inline-block mt-0.5 rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {p.category?.name || '-'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(p.price)}
                    </span>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.2 text-[9px] font-bold ${
                        p.stock_quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      Stok: {p.stock_quantity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(p)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      p.is_active
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    <span>{p.is_active ? 'Status: Aktif' : 'Status: Nonaktif'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(p)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingProduct) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  placeholder="Contoh: Es Kopi Gula Aren"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Slug (URL unik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="es-kopi-gula-aren"
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 font-mono shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Kategori
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                    Harga (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                    Jumlah Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  URL Gambar (Opsional)
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi produk atau bahan utama..."
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 p-2.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="modalIsActive" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Produk Aktif (Tampil di Katalog Toko)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>{editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

