-- House of Mahua's — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Then run `npm run db:reset` to load the sample sarees and orders (optional).
--
-- The app talks to Supabase only from the server using the service-role key, so Row Level Security
-- is switched ON with no public policies: the anon key can't read or write anything directly.

create extension if not exists "pgcrypto";

-- Order numbers: ORD-1025, ORD-1026 … (the demo seed uses 1019–1024)
create sequence if not exists order_number_seq start 1025;

-- ── products ─────────────────────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  slug            text        not null unique,
  description     text        not null default '',
  price           integer     not null check (price >= 0),           -- MRP, whole rupees
  sale_price      integer     check (sale_price is null or (sale_price >= 0 and sale_price < price)),
  category        text        not null,                              -- wedding | silk | banarasi | handloom | festive
  fabric          text        not null default '',
  color           text        not null default '',
  saree_length    numeric(4,2) not null default 6.3,                 -- metres
  blouse_included boolean     not null default true,
  stock           integer     not null default 0 check (stock >= 0),
  featured        boolean     not null default false,
  active          boolean     not null default true,
  created_at      timestamptz not null default now()
);
create index if not exists products_category_idx on products (category);
create index if not exists products_active_idx   on products (active);

-- ── product_images ───────────────────────────────────────────────────────
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid    not null references products (id) on delete cascade,
  image_url  text    not null,
  sort_order integer not null default 0                              -- 0 = main photo
);
create index if not exists product_images_product_idx on product_images (product_id, sort_order);

-- ── orders ───────────────────────────────────────────────────────────────
create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text        not null unique default ('ORD-' || nextval('order_number_seq')),
  customer_name  text        not null,
  phone          text        not null,
  email          text        not null default '',
  address        text        not null,
  city           text        not null,
  state          text        not null,
  pincode        text        not null,
  subtotal       integer     not null check (subtotal >= 0),
  shipping       integer     not null check (shipping >= 0),
  total          integer     not null check (total >= 0),
  payment_method text        not null check (payment_method in ('COD', 'Online')),
  payment_status text        not null default 'Pending'
                             check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded')),
  order_status   text        not null default 'New'
                             check (order_status in ('New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at     timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx  on orders (order_status);

-- ── order_items ──────────────────────────────────────────────────────────
create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid    not null references orders (id) on delete cascade,
  product_id   uuid    references products (id) on delete set null,  -- history survives product deletion
  product_name text    not null,
  quantity     integer not null check (quantity > 0),
  price        integer not null check (price >= 0),
  subtotal     integer not null check (subtotal >= 0)
);
create index if not exists order_items_order_idx on order_items (order_id);

-- ── security ─────────────────────────────────────────────────────────────
alter table products       enable row level security;
alter table product_images enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
-- (no policies on purpose — only the server's service-role key can touch these tables)

-- ── storage: public bucket for product photos ────────────────────────────
-- Photos are public-read so the storefront can show them; uploads happen server-side only.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
