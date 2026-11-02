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
  ShieldCheck,
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
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-zinc-400" />
        <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Keranjang Anda Kosong
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Tambahkan setidaknya satu produk untuk melakukan pemesanan.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side quick validation
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
      // Idempotency key per checkout attempt
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

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(
          json.message || 'Gagal memproses checkout. Silakan periksa kembali data Anda.'
        );
        setIsSubmitting(false);
        return;
      }

      const orderData = json.data;

      // Simpan tracking token di localStorage untuk akses tracking otomatis
      try {
        const storedTokens = JSON.parse(
          localStorage.getItem('mini_ecommerce_tracking_tokens') || '{}'
        );
        storedTokens[orderData.order_number] = orderData.tracking_token;
        localStorage.setItem(
          'mini_ecommerce_tracking_tokens',
          JSON.stringify(storedTokens)
        );
      } catch {
        // Abaikan jika localStorage tidak tersedia
      }

      // Kosongkan keranjang setelah berhasil checkout
      clearCart();

      // Redirect ke halaman invoice digital
      router.push(`/invoice/${orderData.order_number}`);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage('Terjadi masalah jaringan atau koneksi server. Coba lagi beberapa saat.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Keranjang</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
                  {loggedInUserId ? 'Customer Checkout' : 'Guest Checkout'}
                </h1>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {loggedInUserId
                    ? `Data otomatis terisi dari akun Anda (${loggedInUserEmail}).`
                    : 'Pemesanan cepat tanpa harus login atau registrasi akun.'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            {loggedInUserId && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Akun Customer Terhubung: Pesanan ini akan tercatat di histori akun Anda.</span>
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customer_name"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="customer_name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Customer Phone / WhatsApp */}
              <div>
                <label
                  htmlFor="customer_phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  No. Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="customer_phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">
                  Digunakan untuk konfirmasi dan update status pesanan.
                </p>
              </div>

              {/* Customer Address / Notes */}
              <div>
                <label
                  htmlFor="customer_address"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Alamat Pengiriman / Catatan Pesanan{' '}
                  <span className="text-zinc-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <textarea
                    id="customer_address"
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Contoh: Jl. Sudirman No. 12, RT 02 / RW 04, atau catatan 'Jangan terlalu pedas'"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Buat Pesanan & Dapatkan Invoice ({formatCurrency(total)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Items Preview Sidebar */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Rincian Item ({totalItems})
            </h2>

            <div className="mt-4 divide-y divide-zinc-100 max-h-80 overflow-y-auto pr-1 dark:divide-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
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
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4 space-y-2 dark:border-zinc-800">
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <span>Total Pembayaran</span>
                <span className="text-base text-blue-600 dark:text-blue-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

