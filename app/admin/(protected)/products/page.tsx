import React from 'react';
import { createAdminClient } from '@/lib/supabase/server';
import ProductManagementView from '@/components/admin/ProductManagementView';
import type { Product, Category } from '@/types/database';

export const revalidate = 0; // Dynamic fetch for fresh product data

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createAdminClient();

      const [productsRes, categoriesRes] = await Promise.all([
        (supabase as any)
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('categories')
          .select('*')
          .order('name', { ascending: true }),
      ]);

      if (productsRes.data) {
        products = productsRes.data;
      }
      if (categoriesRes.data) {
        categories = categoriesRes.data;
      }
    }
  } catch (err) {
    console.warn('Supabase not yet configured or failed to fetch admin products:', err);
  }

  return (
    <ProductManagementView
      initialProducts={products}
      categories={categories}
    />
  );
}

