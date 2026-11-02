'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Package,
  CheckCircle2,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/customer/orders';
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setErrorMessage(error?.message || 'Email atau kata sandi tidak sesuai.');
        setIsLoading(false);
        return;
      }

      // Cek apakah user adalah admin
      let isAdmin = false;
      const { data: adminProfile } = await (supabase as any)
        .from('admin_profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (adminProfile?.role === 'admin') {
        isAdmin = true;
      } else {
        const { data: userProfile } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userProfile?.role === 'admin') {
          isAdmin = true;
        }
      }

      if (isAdmin) {
        // Tolak admin masuk lewat portal customer agar sesi tidak tercampur
        await supabase.auth.signOut();
        setErrorMessage(
          'Akses ditolak. Akun Anda terdaftar sebagai Admin, silakan masuk melalui portal Admin.'
        );
        setIsLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error('Customer login error:', err);
      setErrorMessage('Terjadi kendala saat proses masuk.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-block text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          QUICKORDER.
        </Link>
        <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          Kelola pesanan dan profil pengiriman Anda dengan mudah.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {justRegistered && !errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Pendaftaran Berhasil</span>
                <span className="text-[11px]">Akun Anda telah aktif. Silakan masuk menggunakan kata sandi Anda.</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Gagal Masuk</span>
                <span className="text-[11px]">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
              >
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
              >
                Kata Sandi
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-xs sm:text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center text-xs">
            <p className="text-zinc-500 dark:text-zinc-400">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              >
                Daftar sekarang
              </Link>
            </p>


          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
