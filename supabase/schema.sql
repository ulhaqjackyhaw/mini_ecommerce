-- Mini E-Commerce (Quick Order) — Supabase PostgreSQL schema
-- Jalankan pada Supabase SQL Editor di project baru/yang belum memiliki objek bernama sama.
-- Mata uang: nominal disimpan sebagai BIGINT dalam rupiah utuh.
-- Checkout tanpa payment gateway; total = subtotal.

begin;

create extension if not exists pgcrypto with schema extensions;

-- 1. Enum status pesanan
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'order_status' and n.nspname = 'public'
  ) then
    create type public.order_status as enum ('Pending', 'Processing', 'Completed', 'Cancelled');
  end if;
end
$$;

-- 2. Tabel aplikasi (6 tabel sesuai PRD)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid null references public.categories(id) on update cascade on delete set null,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  description text,
  price bigint not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on update cascade on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  tracking_token_hash text not null,
  customer_name text not null check (length(trim(customer_name)) > 0),
  customer_phone text not null check (length(trim(customer_phone)) > 0),
  customer_address text,
  status public.order_status not null default 'Pending',
  subtotal bigint not null default 0 check (subtotal >= 0),
  total bigint not null default 0 check (total >= 0),
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  constraint orders_total_matches_subtotal check (total = subtotal)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  product_id uuid null references public.products(id) on update cascade on delete set null,
  product_name_snapshot text not null,
  unit_price_snapshot bigint not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0),
  constraint order_items_line_total_matches check (line_total = unit_price_snapshot * quantity)
);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  old_status public.order_status,
  new_status public.order_status not null,
  changed_by uuid null references auth.users(id) on update cascade on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- 3. Indexes untuk katalog, transaksi, relasi, dan histori
create index if not exists idx_products_category_active
  on public.products(category_id, is_active);
create index if not exists idx_products_active_name
  on public.products(is_active, name);
create index if not exists idx_orders_status_created
  on public.orders(status, created_at desc);
create index if not exists idx_orders_created_at
  on public.orders(created_at desc);
create index if not exists idx_order_items_order_id
  on public.order_items(order_id);
create index if not exists idx_order_items_product_id
  on public.order_items(product_id);
create index if not exists idx_order_status_history_order_created
  on public.order_status_history(order_id, created_at desc);

-- 4. updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- 5. Helper role admin. SECURITY DEFINER mencegah rekursi policy RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.user_id = (select auth.uid())
      and ap.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 6. RLS dan hak akses
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Hapus policy bernama sama supaya script bisa dijalankan ulang pada skema ini.
drop policy if exists categories_public_read_active on public.categories;
drop policy if exists categories_admin_all on public.categories;
drop policy if exists products_public_read_active on public.products;
drop policy if exists products_admin_all on public.products;
drop policy if exists admin_profiles_read_self_or_admin on public.admin_profiles;
drop policy if exists orders_admin_read on public.orders;
drop policy if exists order_items_admin_read on public.order_items;
drop policy if exists order_status_history_admin_read on public.order_status_history;

create policy categories_public_read_active
on public.categories for select
to anon, authenticated
using (is_active = true or public.is_admin());

create policy categories_admin_all
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy products_public_read_active
on public.products for select
to anon, authenticated
using (is_active = true or public.is_admin());

create policy products_admin_all
on public.products for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy admin_profiles_read_self_or_admin
on public.admin_profiles for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy orders_admin_read
on public.orders for select
to authenticated
using (public.is_admin());

create policy order_items_admin_read
on public.order_items for select
to authenticated
using (public.is_admin());

create policy order_status_history_admin_read
on public.order_status_history for select
to authenticated
using (public.is_admin());

-- Tidak ada policy INSERT/UPDATE/DELETE publik pada orders/order_items/history.
-- Checkout dan perubahan status dilakukan melalui RPC SECURITY DEFINER yang tervalidasi.
revoke all on public.orders, public.order_items, public.order_status_history from anon, authenticated;
grant select on public.orders, public.order_items, public.order_status_history to authenticated;
revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;
revoke all on public.categories, public.products from anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;

-- 7. RPC checkout guest atomik
-- p_items format: [{"product_id":"<uuid>","quantity":2}, ...]
-- Token tracking mentah hanya dikembalikan satu kali; database menyimpan SHA-256-nya.
create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_items jsonb,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_order_number text;
  v_tracking_token text;
  v_tracking_hash text;
  v_subtotal bigint := 0;
  v_item record;
  v_product public.products%rowtype;
  v_snapshots jsonb := '[]'::jsonb;
  v_quantity integer;
  v_line_total bigint;
  v_item_count integer := 0;
begin
  if p_customer_name is null or length(trim(p_customer_name)) = 0 then
    raise exception using errcode = '22023', message = 'Nama pelanggan wajib diisi.';
  end if;
  if p_customer_phone is null or length(trim(p_customer_phone)) = 0 then
    raise exception using errcode = '22023', message = 'Nomor telepon wajib diisi.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using errcode = '22023', message = 'Keranjang harus berisi minimal satu produk.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception using errcode = '22023', message = 'Maksimal 50 baris item per pesanan.';
  end if;
  if p_idempotency_key is not null and length(trim(p_idempotency_key)) = 0 then
    raise exception using errcode = '22023', message = 'Idempotency key tidak valid.';
  end if;
  if p_idempotency_key is not null and exists (
    select 1 from public.orders where idempotency_key = p_idempotency_key
  ) then
    raise exception using errcode = '23505', message = 'Permintaan checkout ini sudah pernah diproses.';
  end if;

  -- Gabungkan product_id duplikat; urutan lock konsisten mengurangi risiko deadlock.
  for v_item in
    select x.product_id, sum(x.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer)
    group by x.product_id
    order by x.product_id
  loop
    if v_item.product_id is null or v_item.quantity is null or v_item.quantity <= 0 then
      raise exception using errcode = '22023', message = 'Produk atau kuantitas tidak valid.';
    end if;
    if v_item.quantity > 10000 then
      raise exception using errcode = '22023', message = 'Kuantitas terlalu besar.';
    end if;

    select *
      into v_product
      from public.products
     where id = v_item.product_id
       and is_active = true
     for update;

    if not found then
      raise exception using errcode = 'P0001', message = 'Produk tidak ditemukan atau tidak aktif.';
    end if;
    if v_product.stock_quantity < v_item.quantity then
      raise exception using errcode = 'P0001',
        message = format('Stok tidak cukup untuk produk: %s.', v_product.name);
    end if;

    v_line_total := v_product.price * v_item.quantity;
    if v_line_total < 0 or v_subtotal > 9223372036854775807 - v_line_total then
      raise exception using errcode = '22003', message = 'Total pesanan melampaui batas.';
    end if;

    v_subtotal := v_subtotal + v_line_total;
    v_item_count := v_item_count + 1;

    v_snapshots := v_snapshots || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'unit_price', v_product.price,
      'quantity', v_item.quantity,
      'line_total', v_line_total
    ));

    update public.products
       set stock_quantity = stock_quantity - v_item.quantity
     where id = v_product.id;
  end loop;

  if v_item_count = 0 then
    raise exception using errcode = '22023', message = 'Tidak ada item checkout yang valid.';
  end if;

  v_order_number := 'ORD-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD') ||
                    '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_tracking_token := encode(gen_random_bytes(32), 'hex');
  v_tracking_hash := encode(digest(v_tracking_token, 'sha256'), 'hex');

  insert into public.orders (
    id, order_number, tracking_token_hash, customer_name, customer_phone,
    customer_address, status, subtotal, total, idempotency_key
  ) values (
    v_order_id, v_order_number, v_tracking_hash, trim(p_customer_name),
    trim(p_customer_phone), nullif(trim(coalesce(p_customer_address, '')), ''),
    'Pending', v_subtotal, v_subtotal, p_idempotency_key
  );

  insert into public.order_items (
    order_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total
  )
  select
    v_order_id,
    (x->>'product_id')::uuid,
    x->>'product_name',
    (x->>'unit_price')::bigint,
    (x->>'quantity')::integer,
    (x->>'line_total')::bigint
  from jsonb_array_elements(v_snapshots) as x;

  insert into public.order_status_history(order_id, old_status, new_status, changed_by, note)
  values (v_order_id, null, 'Pending', null, 'Pesanan dibuat melalui guest checkout.');

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'tracking_token', v_tracking_token,
    'status', 'Pending',
    'subtotal', v_subtotal,
    'total', v_subtotal,
    'currency', 'IDR'
  );
exception
  when unique_violation then
    raise exception using errcode = '23505',
      message = 'Nomor pesanan atau idempotency key sudah digunakan. Kirim checkout dengan key baru jika ini pesanan baru.';
end;
$$;

-- 8. RPC update status khusus admin
-- Transisi yang diizinkan: Pending -> Processing/Cancelled; Processing -> Completed/Cancelled.
-- Saat Cancelled, stok dikembalikan dalam transaksi yang sama dan hanya sekali.
create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status public.order_status,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_order public.orders%rowtype;
  v_admin_id uuid := auth.uid();
begin
  if v_admin_id is null or not public.is_admin() then
    raise exception using errcode = '42501', message = 'Hanya admin yang dapat mengubah status pesanan.';
  end if;

  select *
    into v_order
    from public.orders
   where id = p_order_id
   for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Pesanan tidak ditemukan.';
  end if;

  if v_order.status = p_new_status then
    return jsonb_build_object(
      'order_id', v_order.id,
      'order_number', v_order.order_number,
      'status', v_order.status,
      'message', 'Status tidak berubah.'
    );
  end if;

  if not (
    (v_order.status = 'Pending' and p_new_status in ('Processing', 'Cancelled'))
    or
    (v_order.status = 'Processing' and p_new_status in ('Completed', 'Cancelled'))
  ) then
    raise exception using errcode = '22023',
      message = format('Transisi status %s ke %s tidak diizinkan.', v_order.status, p_new_status);
  end if;

  if p_new_status = 'Cancelled' then
    -- Kunci baris produk secara terurut untuk konsistensi ketika beberapa order dibatalkan.
    perform p.id
      from public.products p
      join (
        select oi.product_id
          from public.order_items oi
         where oi.order_id = v_order.id
           and oi.product_id is not null
         group by oi.product_id
      ) item_products on item_products.product_id = p.id
     order by p.id
     for update of p;

    update public.products p
       set stock_quantity = p.stock_quantity + stock_return.quantity
      from (
        select oi.product_id, sum(oi.quantity)::integer as quantity
          from public.order_items oi
         where oi.order_id = v_order.id
           and oi.product_id is not null
         group by oi.product_id
      ) as stock_return
     where p.id = stock_return.product_id;
  end if;

  update public.orders
     set status = p_new_status,
         completed_at = case when p_new_status = 'Completed' then now() else completed_at end,
         cancelled_at = case when p_new_status = 'Cancelled' then now() else cancelled_at end
   where id = v_order.id;

  insert into public.order_status_history(order_id, old_status, new_status, changed_by, note)
  values (v_order.id, v_order.status, p_new_status, v_admin_id, nullif(trim(coalesce(p_note, '')), ''));

  return jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'old_status', v_order.status,
    'status', p_new_status,
    'stock_restored', (p_new_status = 'Cancelled')
  );
end;
$$;

revoke all on function public.create_guest_order(text, text, text, jsonb, text) from public;
grant execute on function public.create_guest_order(text, text, text, jsonb, text) to anon, authenticated;

revoke all on function public.update_order_status(uuid, public.order_status, text) from public, anon;
grant execute on function public.update_order_status(uuid, public.order_status, text) to authenticated;

-- 9. Supabase Realtime publication untuk tabel yang diminta.
-- orders/order_items tidak memiliki akses SELECT publik; event hanya dapat dibaca role
-- yang lolos RLS. Pastikan policy/role Realtime diuji pada project sebelum production.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_items'
  ) then
    alter publication supabase_realtime add table public.order_items;
  end if;
  if not exists (
    select 1 from pg_publication_tables
     where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end
$$;

-- 10. Seeder kategori dan produk (gambar placeholder dari images.unsplash.com).
insert into public.categories(name, slug, is_active)
values
  ('Minuman', 'minuman', true),
  ('Makanan', 'makanan', true),
  ('Camilan', 'camilan', true)
on conflict (slug) do update
set name = excluded.name, is_active = excluded.is_active;

insert into public.products
  (category_id, name, slug, description, price, stock_quantity, image_url, is_active)
select c.id, seed.name, seed.slug, seed.description, seed.price, seed.stock_quantity, seed.image_url, true
from (
  values
    ('minuman', 'Air Mineral 600ml', 'air-mineral-600ml', 'Air mineral kemasan 600 ml.', 4000::bigint, 100, 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=800&q=80'),
    ('minuman', 'Kopi Susu', 'kopi-susu', 'Kopi susu dingin siap minum.', 18000::bigint, 40, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'),
    ('minuman', 'Teh Lemon', 'teh-lemon', 'Teh segar dengan lemon.', 12000::bigint, 35, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'),
    ('makanan', 'Nasi Ayam', 'nasi-ayam', 'Nasi dengan lauk ayam.', 25000::bigint, 25, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'),
    ('makanan', 'Sandwich Telur', 'sandwich-telur', 'Sandwich telur untuk sarapan.', 20000::bigint, 20, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80'),
    ('makanan', 'Salad Sayur', 'salad-sayur', 'Salad sayur segar.', 22000::bigint, 18, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'),
    ('camilan', 'Kentang Goreng', 'kentang-goreng', 'Kentang goreng renyah.', 15000::bigint, 30, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80'),
    ('camilan', 'Donat Cokelat', 'donat-cokelat', 'Donat dengan topping cokelat.', 10000::bigint, 24, 'https://images.unsplash.com/photo-1551024506-0bc0a1c8e8e4?auto=format&fit=crop&w=800&q=80')
) as seed(category_slug, name, slug, description, price, stock_quantity, image_url)
join public.categories c on c.slug = seed.category_slug
on conflict (slug) do update
set category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    image_url = excluded.image_url,
    is_active = true;

commit;

-- PENTING: setelah membuat user melalui Supabase Auth, daftarkan user admin secara manual
-- melalui SQL Editor dengan UUID dari auth.users:
-- insert into public.admin_profiles(user_id, role)
-- values ('<AUTH_USER_UUID>', 'admin')
-- on conflict (user_id) do update set role = excluded.role;
--
-- Catatan operasional:
-- 1) Simpan tracking_token dari hasil create_guest_order di sisi pemesan. Saat tracking,
--    server harus hash token dengan SHA-256 dan membandingkannya dengan tracking_token_hash.
-- 2) Jangan expose SELECT orders/order_items kepada anon. Implementasikan endpoint server
--    untuk tracking yang mengembalikan field minimum setelah memvalidasi token.
-- 3) Uji RLS dan Realtime menggunakan anon, authenticated non-admin, serta admin sebelum rilis.
