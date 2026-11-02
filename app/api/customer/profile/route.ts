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

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        address: profile?.address || '',
        role: profile?.role || 'customer',
      },
    });
  } catch (err: unknown) {
    console.error('Customer profile GET error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data profil' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { full_name, phone, address } = body;

    const { data, error } = await (supabase as any)
      .from('profiles')
      .upsert({
        id: user.id,
        role: 'customer',
        full_name: full_name?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Profil berhasil diperbarui.',
    });
  } catch (err: unknown) {
    console.error('Customer profile PATCH error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui profil' },
      { status: 500 }
    );
  }
}
