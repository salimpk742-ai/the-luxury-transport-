-- Drop a saved legal-page draft that still contains the internal lawyer-review note.
-- Empty text makes the public pages use the built-in copy. Other saved text is left alone.

update site_settings
set value = '{"privacy":"","terms":"","disclaimer":"","safety":"","cookies":""}'::jsonb,
    updated_at = now()
where key = 'pages'
  and value::text ilike '%uae-qualified lawyer%';
