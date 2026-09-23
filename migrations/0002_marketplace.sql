-- Marq marketplace schema. Public catalogue rows are advertiser content.
-- Per-user rows (profiles, saves, owned listings) are scoped by user_id text.

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id text primary key,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  role text not null default 'user',
  account_type text not null default 'individual',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id serial primary key,
  user_id text not null,
  slug text not null unique,
  name text not null,
  salesperson_name text not null default '',
  account_type text not null default 'individual',
  description text not null default '',
  logo_url text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  website text not null default '',
  address text not null default '',
  emirate text not null default 'Dubai',
  area text not null default '',
  social_instagram text not null default '',
  verified boolean not null default false,
  verification_note text not null default '',
  plan text not null default 'free',
  suspended boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists companies_user_id_idx on companies (user_id);

create table if not exists locations (
  id serial primary key,
  emirate text not null,
  area text not null,
  slug text not null unique,
  scope text not null default 'area',
  popular boolean not null default false,
  sort_order int not null default 0
);

create table if not exists categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  kind text not null default 'class',
  sort_order int not null default 0
);

create table if not exists listings (
  id serial primary key,
  company_id int not null references companies (id),
  user_id text not null,
  type text not null,
  status text not null default 'DRAFT',
  title text not null,
  slug_vehicle text not null,
  slug_area text not null,
  make text not null,
  model text not null,
  variant text not null default '',
  year int not null,
  body_type text not null,
  category text not null,
  transmission text not null,
  fuel text not null,
  engine text not null default '',
  seats int not null default 5,
  color text not null default '',
  mileage int not null default 0,
  regional_spec text not null default 'GCC',
  emirate text not null default 'Dubai',
  area text not null,
  area_slug text not null,
  pickup_location text not null default '',
  description text not null default '',
  whatsapp text not null default '',
  phone text not null default '',
  preferred_contact text not null default 'whatsapp',
  is_featured boolean not null default false,
  promotion_tier text not null default 'none',
  views int not null default 0,
  whatsapp_leads int not null default 0,
  phone_leads int not null default 0,
  with_driver boolean not null default false,
  availability text not null default 'available',
  condition text not null default 'used',
  seller_type text not null default 'Dealer',
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_status_type_idx on listings (status, type);
create index if not exists listings_make_idx on listings (make);
create index if not exists listings_area_slug_idx on listings (area_slug);
create index if not exists listings_user_idx on listings (user_id);
create index if not exists listings_company_idx on listings (company_id);
create index if not exists listings_category_idx on listings (category);

create table if not exists rental_details (
  listing_id int primary key references listings (id) on delete cascade,
  daily_price int,
  weekly_price int,
  monthly_price int,
  deposit int,
  min_period text not null default '',
  mileage_allowance text not null default '',
  extra_mileage_price text not null default '',
  insurance text not null default '',
  driver_requirements text not null default '',
  delivery text not null default ''
);

create table if not exists sale_details (
  listing_id int primary key references listings (id) on delete cascade,
  price int not null,
  accident_history text not null default '',
  service_history text not null default '',
  warranty text not null default '',
  registration_status text not null default ''
);

create table if not exists vehicle_images (
  id serial primary key,
  listing_id int not null references listings (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create index if not exists vehicle_images_listing_idx on vehicle_images (listing_id);

create table if not exists saved_listings (
  user_id text not null,
  listing_id int not null references listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists reports (
  id serial primary key,
  listing_id int references listings (id) on delete set null,
  reporter_user_id text,
  reason text not null,
  details text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists verifications (
  id serial primary key,
  company_id int not null references companies (id) on delete cascade,
  status text not null default 'pending',
  trade_license_ref text not null default '',
  document_note text not null default '',
  notes text not null default '',
  reviewed_by text,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id serial primary key,
  event text not null,
  listing_id int,
  user_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_idx on analytics_events (event);
create index if not exists analytics_events_listing_idx on analytics_events (listing_id);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  topic text not null default 'general',
  message text not null,
  created_at timestamptz not null default now()
);
