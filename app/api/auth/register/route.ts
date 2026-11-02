import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().min(8, 'Nomor telepon/WhatsApp tidak valid'),
  address: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Data registrasi tidak valid.',
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, address } = parsed.data;
    const adminSupabase = createAdminClient();

    // 1. Buat akun auth langsung terkonfirmasi (email_confirm: true)
    // agar bebas dari limit kirim email Supabase (status 429 rate limit)
    const { data: userData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

    if (createError || !userData?.user) {
      // Jika email sudah terdaftar
      if (createError?.message?.includes('already registered')) {
        return NextResponse.json(
          { error: 'Alamat email ini sudah terdaftar. Silakan langsung masuk.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: createError?.message || 'Gagal membuat akun.' },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

    // 2. Simpan profil customer ke tabel profiles (Service Role bypasses RLS)
    try {
      await (adminSupabase as any).from('profiles').upsert({
        id: userId,
        role: 'customer',
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        updated_at: new Date().toISOString(),
      });
    } catch (profErr) {
      console.warn('Profile upsert warning:', profErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil.',
      user: {
        id: userId,
        email: userData.user.email,
      },
    });
  } catch (error: any) {
    console.error('API Register Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat mendaftarkan akun.' },
      { status: 500 }
    );
  }
}
