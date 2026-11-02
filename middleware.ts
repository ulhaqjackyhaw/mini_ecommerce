import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // 1. Lewati pemeriksaan autentikasi pada asset statis & API umum agar transisi halaman cepat
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  // 2. Hanya jalankan pengecekan sesi auth Supabase jika rute membutuhkan otentikasi
  // (misal /admin, /customer, atau halaman login/register)
  const isAuthRequiredRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/customer') ||
    pathname === '/login' ||
    pathname === '/register';

  if (!isAuthRequiredRoute) {
    // Rute Publik (Katalog, Cart, Checkout, Invoice, Track Order) dapat diakses instan tanpa lag auth
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validasi user auth hanya untuk rute yang membutuhkan
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Proteksi rute /admin (kecuali /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Jika sudah login dan membuka /admin/login, arahkan ke dashboard
  if (pathname === '/admin/login' && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Proteksi rute /customer
  if (pathname.startsWith('/customer')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Jika sudah login dan membuka /login atau /register, arahkan ke /customer/orders
  if ((pathname === '/login' || pathname === '/register') && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/customer/orders';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
