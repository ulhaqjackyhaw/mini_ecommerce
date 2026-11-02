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
  Lock,
  Sparkles,
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-zinc-900 dark:text-zinc-100">
          Keranjang Belanja Masih Kosong
        </h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm">
          Pilih produk favorit Anda di katalog terlebih dahulu untuk melanjutkan pemesanan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 hover:scale-[1.02]"
        >
          <span>Kembali ke Katalog</span>
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

      // Simpan tracking token di localStorage untuk kemudahan akses
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
        // Abaikan
      }

      // Kosongkan keranjang setelah berhasil checkout
      clearCart();

      // Redirect otomatis langsung ke halaman Digital Invoice
      router.push(`/invoice/${orderData.order_number}`);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage('Terjadi masalah koneksi jaringan server. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] bg-slate-50/60 dark:bg-zinc-950/60">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Tombol kembali */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Kembali ke Keranjang</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Kolom Kiri: Formulir Checkout yang Luas & Besar (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 sm:p-10 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Pemesanan Cepat & Instan</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50">
                    {loggedInUserId ? 'Customer Checkout' : 'Guest Checkout'}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {loggedInUserId
                      ? `Data formulir otomatis terisi dari akun profil Anda (${loggedInUserEmail}).`
                      : 'Pesan langsung tanpa perlu login atau registrasi akun.'}
                  </p>
                </div>
                <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400 shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              {loggedInUserId && (
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-blue-50/80 p-4 text-xs sm:text-sm text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
                  <span className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Akun Customer Terhubung: Riwayat pesanan otomatis tercatat di dashboard akun Anda.</span>
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Nama Lengkap */}
                <div>
                  <label
                    htmlFor="customer_name"
                    className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="customer_name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Nomor Telepon / WhatsApp */}
                <div>
                  <label
                    htmlFor="customer_phone"
                    className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                      id="customer_phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Digunakan untuk konfirmasi pesanan dan informasi pengiriman.
                  </p>
                </div>

                {/* Alamat Pengiriman / Catatan */}
                <div>
                  <label
                    htmlFor="customer_address"
                    className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                  >
                    Alamat Pengiriman / Catatan Pesanan{' '}
                    <span className="text-zinc-400 font-normal lowercase">(opsional)</span>
                  </label>
                  <div className="relative mt-2">
                    <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-zinc-400" />
                    <textarea
                      id="customer_address"
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 12, RT 02 / RW 04, atau catatan 'Es sedikit saja'"
                      disabled={isSubmitting}
                      className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Tombol Buat Pesanan yang Besar & Jelas */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-4 px-6 text-sm sm:text-base font-black text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Memproses Pesanan & Menerbitkan Invoice...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                        <span>Buat Pesanan & Dapatkan Invoice ({formatCurrency(total)})</span>
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-zinc-400">
                    Setelah tombol ditekan, Anda akan langsung diarahkan ke halaman Invoice Digital resmi.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Item Pesanan yang Lengkap (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  Rincian Item ({totalItems})
                </h2>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Ubah
                </Link>
              </div>

              {/* Scrollable Items List */}
              <div className="mt-4 divide-y divide-zinc-100 max-h-96 overflow-y-auto pr-2 dark:divide-zinc-800">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3.5">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 shadow-xs">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-400">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Kalkulasi Subtotal & Total */}
              <div className="mt-5 border-t border-zinc-200 pt-5 space-y-3 dark:border-zinc-800">
                <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Subtotal Belanja</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Biaya Pengiriman</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Gratis (Promo Toko)
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/80 pt-3 text-base sm:text-lg font-black dark:border-zinc-800">
                  <span className="text-zinc-900 dark:text-zinc-100">Total Pembayaran</span>
                  <span className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400">
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
