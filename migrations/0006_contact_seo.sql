-- Public contact email and optional social / Search Console fields.
-- Only replaces the previous default address. A custom email is left alone.

update site_settings
set value = value || jsonb_build_object(
  'email', 'theluxrytransport@gmail.com'
),
updated_at = now()
where key = 'identity'
  and coalesce(value->>'email', '') in ('', 'hello@theluxurycars.com');

update site_settings
set value = value || jsonb_build_object(
  'description', 'The Luxury Cars is a Dubai automotive marketplace connecting customers with rental companies, dealers, businesses and private vehicle sellers.'
),
updated_at = now()
where key = 'identity'
  and value->>'description' = 'The Luxury Cars is a Dubai automotive marketplace where customers can discover cars available for rent and cars available for sale from rental companies, dealers, businesses and private sellers.';

update site_settings
set value = value || jsonb_build_object(
  'tiktok', coalesce(value->>'tiktok', ''),
  'youtube', coalesce(value->>'youtube', ''),
  'linkedin', coalesce(value->>'linkedin', ''),
  'googleVerification', coalesce(value->>'googleVerification', ''),
  'market', coalesce(nullif(value->>'market', ''), 'Dubai, United Arab Emirates'),
  'country', coalesce(nullif(value->>'country', ''), 'United Arab Emirates')
),
updated_at = now()
where key = 'identity';
