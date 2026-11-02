import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Nama produk wajib diisi').max(150),
  slug: z.string().trim().min(1, 'Slug wajib diisi').max(150),
  category_id: z.string().uuid().optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().int().nonnegative('Harga harus >= 0'),
  stock_quantity: z.number().int().nonnegative('Stok harus >= 0'),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const updateProductSchema = z.object({
  id: z.string().uuid('ID produk tidak valid'),
  name: z.string().trim().min(1).max(150).optional(),
  slug: z.string().trim().min(1).max(150).optional(),
  category_id: z.string().uuid().optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().int().nonnegative().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  is_active: z.boolean().optional(),
});

// GET all products and categories
export async function GET() {
  try {
    const supabase = createAdminClient();

    const [productsRes, categoriesRes] = await Promise.all([
      (supabase as any)
        .from('products')
        .select('*, category:categories(*)')
        .order('name', { ascending: true }),
      (supabase as any)
        .from('categories')
        .select('*')
        .order('name', { ascending: true }),
    ]);

    return NextResponse.json({
      success: true,
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
    });
  } catch (err: unknown) {
    console.error('Fetch products error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Input tidak valid.',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from('products')
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category_id: parsed.data.category_id || null,
        description: parsed.data.description || null,
        price: parsed.data.price,
        stock_quantity: parsed.data.stock_quantity,
        image_url: parsed.data.image_url || null,
        is_active: parsed.data.is_active,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Insert product error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Gagal menambahkan produk.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Produk berhasil ditambahkan.',
    });
  } catch (err: unknown) {
    console.error('Create product route error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses penambahan produk.' },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Input tidak valid.',
        },
        { status: 400 }
      );
    }

    const { id, ...updateFields } = parsed.data;

    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Update product error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Gagal memperbarui produk.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Produk berhasil diperbarui.',
    });
  } catch (err: unknown) {
    console.error('Update product route error:', err);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses pembaruan produk.' },
      { status: 500 }
    );
  }
}

