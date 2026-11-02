-- Migration: Customer Role, Profiles, and User-Linked Orders
-- Jalankan file ini di Supabase SQL Editor jika sudah pernah menjalankan schema.sql sebelumnya.

begin;

-- 1. Buat tabel profiles untuk customer dan admin
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on update cascade on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sinkronisasi admin yang sudah ada di admin_profiles ke profiles
insert into public.profiles (id, role, created_at)
select user_id, 'admin', created_at
from public.admin_profiles
on conflict (id) do update set role = excluded.role;

-- 2. Tambahkan kolom user_id pada tabel orders (nullable untuk guest)
alter table public.orders
  add column if not exists user_id uuid null references auth.users(id) on update cascade on delete set null;

create index if not exists idx_orders_user_id on public.orders(user_id);

-- 3. Perbarui fungsi is_admin() untuk mengecek kedua tabel (admin_profiles dan profiles)
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
  ) or exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

-- 4. Aktifkan RLS dan Policy untuk profiles, orders, dan order_items
alter table public.profiles enable row level security;

drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

-- Perbarui policy orders agar customer terautentikasi dapat melihat pesanannya sendiri
drop policy if exists orders_admin_read on public.orders;
drop policy if exists orders_customer_or_admin_read on public.orders;
create policy orders_customer_or_admin_read
on public.orders for select
to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

-- Perbarui policy order_items agar customer dapat melihat item pesanannya sendiri
drop policy if exists order_items_admin_read on public.order_items;
drop policy if exists order_items_customer_or_admin_read on public.order_items;
create policy order_items_customer_or_admin_read
on public.order_items for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = (select auth.uid()) or public.is_admin())
  )
);

grant select, insert, update on public.profiles to authenticated;
grant select on public.orders, public.order_items to authenticated;

-- 5. Perbarui RPC create_guest_order agar mendukung p_user_id opsional
create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_items jsonb,
  p_idempotency_key text default null,
  p_user_id uuid default null
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
  v_effective_user_id uuid := p_user_id;
begin
  -- Jika p_user_id tidak dikirim namun ada session login di context auth, gunakan auth.uid()
  if v_effective_user_id is null then
    v_effective_user_id := auth.uid();
  end if;

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
    id, user_id, order_number, tracking_token_hash, customer_name, customer_phone,
    customer_address, status, subtotal, total, idempotency_key
  ) values (
    v_order_id, v_effective_user_id, v_order_number, v_tracking_hash, trim(p_customer_name),
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
  values (v_order_id, null, 'Pending', v_effective_user_id, 'Pesanan dibuat melalui checkout.');

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

commit;

