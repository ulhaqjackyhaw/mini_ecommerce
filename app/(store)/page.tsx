import React from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import CatalogView from '@/components/catalog/CatalogView';
import type { Product, Category } from '@/types/database';

export const revalidate = 0; // Dynamic fetch for real-time stock/catalog updates

// Fallback seed data matching supabase/schema.sql
const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Minuman', slug: 'minuman', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Makanan', slug: 'makanan', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Camilan', slug: 'camilan', is_active: true, created_at: new Date().toISOString() },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'Air Mineral 600ml',
    slug: 'air-mineral-600ml',
    description: 'Air mineral kemasan 600 ml.',
    price: 4000,
    stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id: 'prod-2',
    category_id: 'cat-1',
    name: 'Kopi Susu',
    slug: 'kopi-susu',
    description: 'Kopi susu dingin siap minum.',
    price: 18000,
    stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id: 'prod-3',
    category_id: 'cat-1',
    name: 'Teh Lemon',
    slug: 'teh-lemon',
    description: 'Teh segar dengan lemon.',
    price: 12000,
    stock_quantity: 35,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id: 'prod-4',
    category_id: 'cat-2',
    name: 'Nasi Ayam',
    slug: 'nasi-ayam',
    description: 'Nasi dengan lauk ayam.',
    price: 25000,
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[1],
  },
  {
    id: 'prod-5',
    category_id: 'cat-2',
    name: 'Sandwich Telur',
    slug: 'sandwich-telur',
    description: 'Sandwich telur untuk sarapan.',
    price: 20000,
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[1],
  },
  {
    id: 'prod-6',
    category_id: 'cat-2',
    name: 'Salad Sayur',
    slug: 'salad-sayur',
    description: 'Salad sayur segar.',
    price: 22000,
    stock_quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[1],
  },
  {
    id: 'prod-7',
    category_id: 'cat-3',
    name: 'Kentang Goreng',
    slug: 'kentang-goreng',
    description: 'Kentang goreng renyah.',
    price: 15000,
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[2],
  },
  {
    id: 'prod-8',
    category_id: 'cat-3',
    name: 'Donat Cokelat',
    slug: 'donat-cokelat',
    description: 'Donat dengan topping cokelat.',
    price: 10000,
    stock_quantity: 24,
    image_url: 'https://images.unsplash.com/photo-1551024506-0bc0a1c8e8e4?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[2],
  },
];

export default async function CatalogPage() {
  let products: Product[] = [];
  let categories: Category[] = [];
  let soldCounts: Record<string, number> = {};

  try {
    const supabase = await createClient();

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }),
    ]);

    if (productsRes.data && productsRes.data.length > 0) {
      products = productsRes.data as unknown as Product[];
    }
    if (categoriesRes.data && categoriesRes.data.length > 0) {
      categories = categoriesRes.data as unknown as Category[];
    }

    // Hitung total kuantitas produk yang telah terjual (tidak berstatus Cancelled)
    try {
      const adminSupabase = createAdminClient();
      const { data: soldItems } = await adminSupabase
        .from('order_items')
        .select('product_id, quantity, orders!inner(status)')
        .neq('orders.status', 'Cancelled');

      if (soldItems) {
        soldItems.forEach((item: any) => {
          if (item.product_id) {
            soldCounts[item.product_id] =
              (soldCounts[item.product_id] || 0) + (item.quantity || 0);
          }
        });
      }
    } catch (err) {
      console.error('Error fetching sold items:', err);
    }
  } catch {
    // If Supabase not yet connected or configured, use fallback seed data
  }

  // Gracefully fallback if database table is empty or connection isn't set yet
  if (products.length === 0) {
    products = FALLBACK_PRODUCTS;
  }
  if (categories.length === 0) {
    categories = FALLBACK_CATEGORIES;
  }

  return (
    <CatalogView
      initialProducts={products}
      categories={categories}
      soldCounts={soldCounts}
    />
  );
}

