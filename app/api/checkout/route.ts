import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const checkoutSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(1, 'Nama lengkap wajib diisi.')
    .max(100, 'Nama terlalu panjang (maksimal 100 karakter).'),
  customer_phone: z
    .string()
    .trim()
    .min(6, 'Nomor telepon/WhatsApp minimal 6 digit.')
    .max(20, 'Nomor telepon maksimal 20 digit.')
    .regex(/^[0-9+() -]+$/, 'Format nomor telepon/WhatsApp tidak valid.'),
  customer_address: z
    .string()
    .trim()
    .max(1000, 'Alamat atau catatan maksimal 1000 karakter.')
    .optional()
    .or(z.literal('')),
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, 'Product ID wajib ada.'),
        quantity: z
          .number()
          .int('Kuantitas harus bilangan bulat.')
          .positive('Kuantitas harus lebih dari 0.')
          .max(10000, 'Kuantitas melebihi batas wajar.'),
      })
    )
    .min(1, 'Keranjang harus berisi minimal satu produk.')
    .max(50, 'Maksimal 50 item per pesanan.'),
  idempotency_key: z.string().trim().optional(),
  user_id: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validasi schema Zod
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      const errorFormatted = validationResult.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(errorFormatted)[0]?.[0] || 'Validasi data gagal.';
      return NextResponse.json(
        {
          success: false,
          message: firstErrorMessage,
          errors: errorFormatted,
        },
        { status: 400 }
      );
    }

    const {
      customer_name,
      customer_phone,
      customer_address,
      items,
      idempotency_key,
      user_id,
    } = validationResult.data;

    const formattedAddress = customer_address || '';

    // 2. Inisialisasi Supabase client
    const supabase = await createClient();

    // 3. Panggil RPC create_guest_order atomik
    const { data: rawData, error } = await (supabase as any).rpc('create_guest_order', {
      p_customer_name: customer_name,
      p_customer_phone: customer_phone,
      p_customer_address: formattedAddress || null,
      p_items: items,
      p_idempotency_key: idempotency_key || null,
      p_user_id: user_id || null,
    });

    if (error) {
      console.error('RPC create_guest_order error:', error);
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Gagal memproses pesanan di database.',
          code: error.code,
        },
        { status: 422 }
      );
    }

    const data = rawData as {
      order_id: string;
      order_number: string;
      tracking_token: string;
      status: string;
      subtotal: number;
      total: number;
      currency: string;
    };

    // Pastikan user_id tersimpan jika tersedia
    if (data.order_id && user_id) {
      try {
        await (supabase as any)
          .from('orders')
          .update({ user_id })
          .eq('id', data.order_id);
      } catch (linkErr) {
        console.warn('Could not update order metadata:', linkErr);
      }
    }

    // Response sukses mengembalikan order_number, tracking_token, dsb
    return NextResponse.json({
      success: true,
      data: {
        order_id: data.order_id,
        order_number: data.order_number,
        tracking_token: data.tracking_token,
        status: data.status,
        subtotal: data.subtotal,
        total: data.total,
        currency: data.currency,
      },
    });
  } catch (err: unknown) {
    console.error('Unhandled checkout route error:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Terjadi kesalahan pada server checkout.';
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
