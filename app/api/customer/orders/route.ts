import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const { data: orders, error } = await (supabase as any)
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
    });
  } catch (err: unknown) {
    console.error('Customer orders GET error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil riwayat pesanan.' },
      { status: 500 }
    );
  }
}
