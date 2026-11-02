import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number')?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor pesanan wajib disertakan.',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Ambil data order
    const { data: rawOrder, error: orderError } = await (supabase as any)
      .from('orders')
      .select('id, order_number, customer_name, status, subtotal, total, created_at, updated_at, completed_at, cancelled_at')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !rawOrder) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.',
        },
        { status: 404 }
      );
    }

    const order = rawOrder as {
      id: string;
      order_number: string;
      customer_name: string;
      status: string;
      subtotal: number;
      total: number;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
      cancelled_at: string | null;
    };

    // Ambil riwayat perubahan status
    const { data: history } = await (supabase as any)
      .from('order_status_history')
      .select('id, old_status, new_status, note, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      success: true,
      data: {
        order_number: order.order_number,
        customer_name: order.customer_name,
        status: order.status,
        subtotal: order.subtotal,
        total: order.total,
        created_at: order.created_at,
        updated_at: order.updated_at,
        completed_at: order.completed_at,
        cancelled_at: order.cancelled_at,
        history: history || [],
      },
    });
  } catch (err: unknown) {
    console.error('Track order API error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil informasi pelacakan pesanan.',
      },
      { status: 500 }
    );
  }
}
