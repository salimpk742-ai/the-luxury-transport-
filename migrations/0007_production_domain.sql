-- The connected production host is theluxurytransport.com.
-- Leave a custom URL alone. Only replace the old unused domain and the Vercel host.

update site_settings
set value = jsonb_set(value, '{url}', '"https://theluxurytransport.com"'),
    updated_at = now()
where key = 'identity'
  and regexp_replace(coalesce(value->>'url', ''), '/$', '') in (
    '',
    'https://theluxurycars.com',
    'https://www.theluxurycars.com',
    'http://theluxurycars.com',
    'http://www.theluxurycars.com',
    'https://the-luxury-transport.vercel.app',
    'https://www.theluxurytransport.com'
  );
