import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';

const updateStatusSchema = z.object({
  order_id: z.string().uuid('ID pesanan tidak valid.'),
  new_status: z.enum(['Pending', 'Processing', 'Completed', 'Cancelled']),
  note: z.string().trim().max(300).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Input tidak valid.',
        },
        { status: 400 }
      );
    }

    const { order_id, new_status, note } = parsed.data;

    const supabase = createAdminClient();

    // 1. Ambil order saat ini
    const { data: order, error: fetchError } = await (supabase as any)
      .from('orders')
      .select('id, status, order_number')
      .eq('id', order_id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const currentStatus: OrderStatus = order.status;

    // 2. Cek transisi yang diizinkan (sesuai schema.sql baris 406-413)
    const isValidTransition =
      (currentStatus === 'Pending' && ['Processing', 'Cancelled'].includes(new_status)) ||
      (currentStatus === 'Processing' && ['Completed', 'Cancelled'].includes(new_status));

    if (!isValidTransition && currentStatus !== new_status) {
      return NextResponse.json(
        {
          success: false,
          message: `Transisi status dari ${currentStatus} ke ${new_status} tidak diizinkan.`,
        },
        { status: 422 }
      );
    }

    // 3. Panggil RPC update_order_status
    // Jika Cancelled, stok akan otomatis dikembalikan ke tabel products
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
      'update_order_status',
      {
        p_order_id: order_id,
        p_new_status: new_status,
        p_note: note || `Status diperbarui menjadi ${new_status} oleh admin.`,
      }
    );

    if (rpcError) {
      // Fallback update jika RPC gagal karena izin auth UID di backend
      const updatePayload: Record<string, any> = {
        status: new_status,
        updated_at: new Date().toISOString(),
      };
      if (new_status === 'Completed') updatePayload.completed_at = new Date().toISOString();
      if (new_status === 'Cancelled') updatePayload.cancelled_at = new Date().toISOString();

      await (supabase as any)
        .from('orders')
        .update(updatePayload)
        .eq('id', order_id);

      // Catat ke order_status_history
      await (supabase as any).from('order_status_history').insert({
        order_id: order_id,
        old_status: currentStatus,
        new_status: new_status,
        note: note || `Status diubah menjadi ${new_status}`,
      });

      // Jika dibatalkan, kembalikan stok
      if (new_status === 'Cancelled') {
        const { data: items } = await (supabase as any)
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order_id);

        if (items) {
          for (const item of items) {
            if (item.product_id) {
              const { data: p } = await (supabase as any)
                .from('products')
                .select('stock_quantity')
                .eq('id', item.product_id)
                .single();
              if (p) {
                await (supabase as any)
                  .from('products')
                  .update({ stock_quantity: p.stock_quantity + item.quantity })
                  .eq('id', item.product_id);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status pesanan ${order.order_number} berhasil diubah menjadi ${new_status}.`,
      data: rpcResult || { order_id, new_status },
    });
  } catch (err: unknown) {
    console.error('Update order status error:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal memperbarui status pesanan.',
      },
      { status: 500 }
    );
  }
}

