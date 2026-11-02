'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Info,
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

      setToastMessage('Profil berhasil diperbarui.');
      setTimeout(() => setToastMessage(null), 3000);
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
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-3 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid 2 Kolom untuk Desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Informasi Akun (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              <User className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {fullName || 'Pengguna'}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400 font-mono">
              {initialProfile.email}
            </p>

            <div className="mt-3 inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <span>Role: {initialProfile.role}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                  Auto-Fill Checkout
                </span>
                <p className="mt-0.5 text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Data nama, WhatsApp, dan alamat yang disimpan di sini akan otomatis terisi setiap kali Anda checkout.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Edit Profil & Alamat (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Pengaturan Profil & Pengiriman
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                Perbarui detail kontak dan alamat default pengiriman pesanan.
              </p>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email Akun
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    readOnly
                    value={initialProfile.email}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs sm:text-sm font-mono text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                >
                  Nama Lengkap
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap Anda..."
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Nomor WhatsApp / Telepon */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                >
                  Nomor WhatsApp / Telepon
                </label>
                <div className="relative mt-1">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm font-mono shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Alamat Default */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1"
                >
                  Alamat Pengiriman Default
                </label>

                <div className="relative mt-1">
                  <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <textarea
                    id="address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat jalan lengkap, nomor rumah, RT/RW, kelurahan, kecamatan, kota..."
                    className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-98 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Perubahan</span>
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
