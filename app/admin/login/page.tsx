'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin/dashboard';

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

      // 1. Sign in dengan Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError || !authData.user) {
        setErrorMessage(
          authError?.message || 'Email atau kata sandi tidak valid.'
        );
        setIsLoading(false);
        return;
      }

      // 2. Verifikasi hak akses admin di tabel admin_profiles
      const { data: profile, error: profileError } = await (supabase as any)
        .from('admin_profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        // Sign out segera jika bukan role admin
        await supabase.auth.signOut();
        setErrorMessage(
          'Akses ditolak: Akun Anda berhasil login namun belum terdaftar sebagai admin di tabel admin_profiles.'
        );
        setIsLoading(false);
        return;
      }

      // 3. Login sukses dan memiliki hak admin
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error('Login error:', err);
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat proses login.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-6 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Toko</span>
        </Link>

        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Admin Dashboard Login
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Masuk menggunakan kredensial admin Supabase Auth yang terdaftar.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Email Admin
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Kata Sandi
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-98 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Setup note */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <strong className="font-semibold">Info Registrasi Admin:</strong>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-800 dark:text-blue-400">
                  Buat akun melalui Supabase Auth Dashboard, lalu jalankan perintah SQL berikut di Supabase SQL Editor:
                </p>
                <code className="mt-1 block rounded bg-white/80 p-1.5 font-mono text-[10px] text-blue-950 dark:bg-black/50 dark:text-blue-200">
                  INSERT INTO public.admin_profiles(user_id, role) VALUES (&apos;&lt;AUTH_USER_UUID&gt;&apos;, &apos;admin&apos;);
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

