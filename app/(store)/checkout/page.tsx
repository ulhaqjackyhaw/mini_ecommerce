'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/components/cart/CartProvider';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  MapPin,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, subtotal, total, clearCart, isInitialized } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill dari profil customer jika sedang login
  React.useEffect(() => {
    fetch('/api/customer/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json?.data) {
          setLoggedInUserId(json.data.id);
          setLoggedInUserEmail(json.data.email);
          if (json.data.full_name) setCustomerName(json.data.full_name);
          if (json.data.phone) setCustomerPhone(json.data.phone);
          if (json.data.address) setCustomerAddress(json.data.address);
        }
      })
      .catch(() => {});
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Keranjang Belanja Kosong
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 max-w-sm">
          Pilih produk favorit di katalog terlebih dahulu.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <span>Kembali ke Katalog</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 6) {
      setErrorMessage('Nomor Telepon / WhatsApp minimal 6 digit.');
      return;
    }

    setIsSubmitting(true);

    try {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim() || undefined,
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
        })),
        idempotency_key: idempotencyKey,
        user_id: loggedInUserId || undefined,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Terjadi kesalahan saat memproses pesanan.');
        setIsSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/invoice/${data.data.order_number}`);
    } catch (err: any) {
      console.error('Checkout submit error:', err);
      setErrorMessage('Terjadi gangguan jaringan. Silakan periksa koneksi Anda.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-zinc-50/50 dark:bg-zinc-950/40 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Keranjang</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Kolom Kiri: Form Checkout (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-6 sm:p-7 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {loggedInUserId ? 'Konfirmasi Checkout' : 'Guest Checkout'}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  {loggedInUserId
                    ? `Data formulir terisi dari akun profil Anda (${loggedInUserEmail}).`
                    : 'Pemesanan cepat tanpa harus login atau registrasi akun.'}
                </p>
              </div>

              {loggedInUserId && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Akun Customer Terhubung: Riwayat pesanan otomatis tersimpan.</span>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold block">Gagal Memproses Pesanan</span>
                    <span className="text-[11px]">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="customer_name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Nomor Telepon / WhatsApp */}
                <div>
                  <label
                    htmlFor="customer_phone"
                    className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                  >
                    Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="customer_phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-mono shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Digunakan untuk konfirmasi pesanan via WhatsApp.
                  </p>
                </div>

                {/* Alamat Pengiriman / Catatan */}
                <div>
                  <label
                    htmlFor="customer_address"
                    className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                  >
                    Alamat Pengiriman / Catatan{' '}
                    <span className="text-zinc-400 font-normal lowercase">(opsional)</span>
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                    <textarea
                      id="customer_address"
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 12, RT 02 / RW 04, atau catatan 'Es sedikit'"
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Tombol Buat Pesanan */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-between rounded-lg bg-zinc-900 py-3 px-4 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memproses Pesanan...</span>
                      </span>
                    ) : (
                      <>
                        <span>Buat Pesanan & Dapatkan Invoice</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {formatCurrency(total)}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-[11px] text-zinc-400">
                    Setelah tombol ditekan, Anda akan diarahkan ke invoice digital.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Item Pesanan (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Rincian Item ({totalItems})
                </h2>
                <Link
                  href="/cart"
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                >
                  Ubah
                </Link>
              </div>

              {/* Scrollable Items List */}
              <div className="mt-3 divide-y divide-zinc-100 max-h-80 overflow-y-auto pr-1 dark:divide-zinc-800">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono tabular-nums">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right text-xs font-semibold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total */}
              <div className="mt-4 border-t border-zinc-100 pt-3 space-y-2 text-xs dark:border-zinc-800">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Ongkos Kirim</span>
                  <span className="text-emerald-600 font-medium dark:text-emerald-400">
                    Gratis
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 pt-2.5 text-sm font-semibold dark:border-zinc-800">
                  <span className="text-zinc-900 dark:text-zinc-100">Total Pembayaran</span>
                  <span className="text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
