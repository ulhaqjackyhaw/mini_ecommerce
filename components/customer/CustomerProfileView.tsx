'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  role: string;
}

interface CustomerProfileViewProps {
  initialProfile: ProfileData;
}

export default function CustomerProfileView({
  initialProfile,
}: CustomerProfileViewProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');
  const [address, setAddress] = useState(initialProfile.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.message || 'Gagal menyimpan profil.');
        setIsSaving(false);
        return;
      }

      setToastMessage('Profil dan alamat default berhasil disimpan!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-lg animate-bounce">
          <Check className="h-5 w-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-5 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid 2 Kolom untuk Desktop yang Luas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Informasi Akun (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shadow-sm">
              <User className="h-12 w-12" />
            </div>
            <h3 className="mt-5 text-xl font-black text-zinc-900 dark:text-zinc-100">
              {fullName || 'Pengguna QuickOrder'}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {initialProfile.email}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              <span className="capitalize">Role: {initialProfile.role}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong className="font-bold text-blue-950 dark:text-blue-200">
                  Fitur Auto-Fill Checkout
                </strong>
                <p className="mt-1 text-xs text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
                  Informasi nama lengkap, nomor WhatsApp, dan alamat yang Anda simpan di sini akan otomatis terisi setiap kali Anda melakukan pemesanan baru.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Edit Profil & Alamat (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-zinc-200/90 bg-white p-7 sm:p-9 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-5 dark:border-zinc-800">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                Pengaturan Profil & Pengiriman
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Perbarui detail kontak dan alamat tempat tinggal untuk pengiriman pesanan.
              </p>
            </div>

            <form onSubmit={handleSave} className="mt-8 space-y-6">
              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Alamat Email (Akun)
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    readOnly
                    value={initialProfile.email}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3.5 pl-12 pr-4 text-sm text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Nama Lengkap
                </label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap Anda..."
                    className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp / Telepon */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Nomor WhatsApp / Telepon Aktif
                </label>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Alamat Default */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Alamat Pengiriman Default
                </label>
                <div className="relative mt-2">
                  <MapPin className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-zinc-400" />
                  <textarea
                    id="address"
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat jalan lengkap, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                    className="w-full rounded-2xl border border-zinc-300 bg-white py-3.5 pl-12 pr-4 text-sm sm:text-base font-medium shadow-xs transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-400"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Simpan Perubahan Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
