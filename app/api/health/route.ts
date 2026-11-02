import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const revalidate = 0;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(url && !url.includes('placeholder')),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(anonKey && !anonKey.includes('placeholder')),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceKey && !serviceKey.includes('placeholder')),
  };

  if (!envCheck.NEXT_PUBLIC_SUPABASE_URL || !envCheck.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        status: 'UNCONFIGURED',
        connected: false,
        message: 'Variabel lingkungan di file .env.local belum diisi dengan lengkap.',
        envCheck,
      },
      { status: 200 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Uji query tabel products
    const { data: products, error: prodError } = await (supabase as any)
      .from('products')
      .select('id, name')
      .limit(5);

    // Uji query tabel categories
    const { data: categories, error: catError } = await (supabase as any)
      .from('categories')
      .select('id, name')
      .limit(5);

    if (prodError || catError) {
      return NextResponse.json(
        {
          status: 'DATABASE_ERROR',
          connected: false,
          message: 'Kredensial terisi, namun query ke database gagal. Pastikan skema supabase/schema.sql sudah dijalankan di Supabase SQL Editor.',
          errors: {
            products: prodError?.message,
            categories: catError?.message,
          },
          envCheck,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'CONNECTED',
      connected: true,
      message: '✅ Berhasil terhubung ke Supabase! Database dan API siap digunakan.',
      supabase_url: url,
      data_found: {
        products_count_sample: products?.length || 0,
        categories_count_sample: categories?.length || 0,
      },
      envCheck,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: 'CONNECTION_FAILED',
        connected: false,
        message: err instanceof Error ? err.message : 'Gagal menghubungi server Supabase.',
        envCheck,
      },
      { status: 500 }
    );
  }
}

