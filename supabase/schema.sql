-- =========================================================
-- NOMAD thermos shop — Supabase schema
-- Run once in Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run: objects are created only if missing.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Tables ----------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subtitle text,                        -- printed on the bottle in the hero, e.g. "Classic 500ml"
  description text,
  category_id uuid references public.categories(id) on delete set null,
  capacity text,
  price int not null check (price >= 0),          -- in ₮
  compare_at_price int check (compare_at_price >= 0),
  stock int not null default 0 check (stock >= 0),
  image_url text,                       -- main transparent PNG (used in hero + cards)
  gallery text[] not null default '{}', -- extra photos for the product page
  bg_from text not null default '#3a3a3d',  -- hero background gradient
  bg_to text not null default '#0b0b0c',
  accent text not null default '#4a4a4d',   -- hero stone base color
  is_active boolean not null default true,
  is_featured boolean not null default false, -- shown in the home hero carousel
  hero_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(is_featured, hero_order);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text,
  city text not null,
  district text not null,
  khoroo text,
  address text not null,
  note text,
  subtotal int not null,
  shipping_fee int not null,
  total int not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text not null default 'later',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders(created_at desc);

-- Orders placed while signed in are linked to the customer's account
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_idx on public.orders(user_id);

-- Customer profile: saved contact + delivery address for faster checkout
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  district text,
  khoroo text,
  address text,
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price int not null,
  quantity int not null check (quantity > 0),
  line_total int not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- Users listed here can use /admin
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Store-wide settings (single row)
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  shipping_fee int not null default 5000,
  free_shipping_over int not null default 150000,
  phone text default '',
  email text default '',
  address text default '',
  instagram_url text default '',
  facebook_url text default ''
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------- Helpers ----------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.admins      enable row level security;
alter table public.settings    enable row level security;
alter table public.profiles    enable row level security;

drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "profiles admin read" on public.profiles;
create policy "profiles admin read" on public.profiles for select using (public.is_admin());

-- Signed-in customers can read their own orders
drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (user_id = auth.uid());
drop policy if exists "order_items own read" on public.order_items;
create policy "order_items own read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories for select using (true);
drop policy if exists "categories admin" on public.categories;
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select using (is_active or public.is_admin());
drop policy if exists "products admin" on public.products;
create policy "products admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Orders are created only through place_order(); customers read them only via get_order()
drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order_items admin" on public.order_items;
create policy "order_items admin" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins self" on public.admins;
create policy "admins self" on public.admins for select using (user_id = auth.uid());

drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings for select using (true);
drop policy if exists "settings admin" on public.settings;
create policy "settings admin" on public.settings for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Checkout: place_order ----------
-- Prices and stock come from the database, never from the browser.
-- items: [{ "product_id": "...", "quantity": 2 }, ...]

create or replace function public.place_order(customer jsonb, items jsonb)
returns table (order_number text, total int)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_order_id uuid;
  v_number text;
  v_subtotal int := 0;
  v_shipping int;
  v_free_over int;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if coalesce(trim(customer->>'customer_name'), '') = ''
     or coalesce(trim(customer->>'phone'), '') = ''
     or coalesce(trim(customer->>'city'), '') = ''
     or coalesce(trim(customer->>'district'), '') = ''
     or coalesce(trim(customer->>'address'), '') = '' then
    raise exception 'MISSING_FIELDS';
  end if;

  -- unique, human-friendly order number, e.g. NM-260930-4821
  loop
    v_number := 'NM-' || to_char(now() at time zone 'Asia/Ulaanbaatar', 'YYMMDD') || '-' ||
                lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.orders o where o.order_number = v_number);
  end loop;

  insert into public.orders (order_number, user_id, customer_name, phone, email, city, district, khoroo, address, note,
                             subtotal, shipping_fee, total)
  values (v_number,
          auth.uid(),
          left(trim(customer->>'customer_name'), 120),
          left(trim(customer->>'phone'), 32),
          nullif(left(trim(customer->>'email'), 160), ''),
          left(trim(customer->>'city'), 80),
          left(trim(customer->>'district'), 80),
          nullif(left(trim(customer->>'khoroo'), 80), ''),
          left(trim(customer->>'address'), 500),
          nullif(left(trim(customer->>'note'), 1000), ''),
          0, 0, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(items) loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'BAD_QUANTITY';
    end if;

    select * into v_product from public.products p
      where p.id = (v_item->>'product_id')::uuid and p.is_active
      for update;
    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;
    if v_product.stock < v_qty then
      raise exception 'OUT_OF_STOCK:%', v_product.name;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;

    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.price, v_qty, v_product.price * v_qty);

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  select s.shipping_fee, s.free_shipping_over into v_shipping, v_free_over from public.settings s where s.id = 1;
  if v_subtotal >= coalesce(v_free_over, 0) and coalesce(v_free_over, 0) > 0 then
    v_shipping := 0;
  end if;

  update public.orders
     set subtotal = v_subtotal, shipping_fee = coalesce(v_shipping, 0), total = v_subtotal + coalesce(v_shipping, 0)
   where id = v_order_id;

  return query select v_number, v_subtotal + coalesce(v_shipping, 0);
end $$;

-- ---------- Order tracking: get_order ----------
-- Customer must know both the order number and the phone number.

create or replace function public.get_order(p_order_number text, p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'payment_status', o.payment_status,
    'customer_name', o.customer_name,
    'city', o.city,
    'district', o.district,
    'address', o.address,
    'subtotal', o.subtotal,
    'shipping_fee', o.shipping_fee,
    'total', o.total,
    'created_at', o.created_at,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_name', i.product_name,
        'product_image', i.product_image,
        'unit_price', i.unit_price,
        'quantity', i.quantity,
        'line_total', i.line_total))
      from public.order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  from public.orders o
  where upper(o.order_number) = upper(trim(p_order_number))
    and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
  limit 1;
$$;

-- ---------- Admin: change order status ----------
-- Cancelling returns the items to stock. A cancelled order stays cancelled.

create or replace function public.set_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select status into v_current from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;
  if v_current = p_status then
    return;
  end if;
  if v_current = 'cancelled' then
    raise exception 'ALREADY_CANCELLED';
  end if;

  if p_status = 'cancelled' then
    update public.products p
       set stock = p.stock + i.qty
      from (select product_id, sum(quantity)::int as qty
              from public.order_items
             where order_id = p_order_id
             group by product_id) i
     where i.product_id = p.id;
  end if;

  update public.orders set status = p_status where id = p_order_id;
end $$;

revoke all on function public.set_order_status(uuid, text) from public;
grant execute on function public.set_order_status(uuid, text) to authenticated;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;
revoke all on function public.get_order(text, text) from public;
grant execute on function public.get_order(text, text) to anon, authenticated;

-- ---------- Storage bucket for product photos ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
