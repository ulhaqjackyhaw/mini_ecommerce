'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Shield,
  Save,
  Check,
  Loader2,
  AlertCircle,
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
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {toastMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-md">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Profil & Pengiriman Default
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Data ini akan otomatis terisi pada formulir Checkout saat Anda memesan produk.
          </p>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5 text-xs">
          {/* Email (Read Only) */}
          <div>
            <label className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Alamat Email (Akun)
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                readOnly
                value={initialProfile.email}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <span className="mt-1 block text-[10px] text-zinc-400">
              Role akun: <strong className="capitalize">{initialProfile.role}</strong>
            </span>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="fullName"
              className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Nama Lengkap
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Anda..."
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-xs shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Nomor WhatsApp / Telepon */}
          <div>
            <label
              htmlFor="phone"
              className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              No. WhatsApp / Telepon
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-xs shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Alamat Default */}
          <div>
            <label
              htmlFor="address"
              className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
            >
              Alamat Pengiriman Default
            </label>
            <div className="relative mt-1.5">
              <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <textarea
                id="address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat jalan, kelurahan, kecamatan, nomor rumah..."
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-xs shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition"
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
  );
}
