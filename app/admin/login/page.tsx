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
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError || !authData.user) {
        setErrorMessage(
          authError?.message || 'Email atau kata sandi tidak sesuai.'
        );
        setIsLoading(false);
        return;
      }

      // 2. Verifikasi hak akses admin di tabel admin_profiles atau profiles
      let isAdmin = false;

      // Cek di admin_profiles
      const { data: adminProfile } = await (supabase as any)
        .from('admin_profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (adminProfile?.role === 'admin') {
        isAdmin = true;
      }

      // Fallback: Cek di profiles jika admin_profiles belum terisi
      if (!isAdmin) {
        const { data: userProfile } = await (supabase as any)
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userProfile?.role === 'admin') {
          isAdmin = true;
          // Otomatis sinkronkan ke admin_profiles agar konsisten
          try {
            await (supabase as any)
              .from('admin_profiles')
              .upsert({ user_id: authData.user.id, role: 'admin' });
          } catch {
            // Ignore background sync error
          }
        }
      }

      if (!isAdmin) {
        // Sign out jika bukan role admin (misal akun customer)
        await supabase.auth.signOut();
        setErrorMessage(
          'Akses ditolak. Akun Customer tidak dapat masuk ke portal Admin.'
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-6 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Toko</span>
        </Link>

        <div className="text-center">
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            QUICKORDER.
          </span>
          <span className="ml-2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Admin
          </span>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Login Admin Panel
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Masuk dengan kredensial administrator Supabase Auth.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Akses Ditolak</span>
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
                Email Admin
              </label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
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
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <span>Masuk ke Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Setup note */}


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
