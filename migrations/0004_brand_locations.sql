-- Brand defaults, rental delivery fields, and a maintainable Dubai location list.
-- Existing slugs are kept so sample listings do not break. New rows skip on conflict.

alter table locations add column if not exists parent_slug text not null default '';
alter table locations add column if not exists active boolean not null default true;

alter table rental_details add column if not exists delivery_available boolean not null default false;
alter table rental_details add column if not exists delivery_scope text not null default '';
alter table rental_details add column if not exists delivery_areas text not null default '';
alter table rental_details add column if not exists delivery_fee text not null default '';
alter table rental_details add column if not exists airport_delivery boolean not null default false;

update site_settings
set value = value || jsonb_build_object(
  'name', 'The Luxury Cars',
  'legalName', 'The Luxury Cars',
  'description', 'The Luxury Cars is a Dubai automotive marketplace where customers can discover cars available for rent and cars available for sale from rental companies, dealers, businesses and private sellers.',
  'phone', coalesce(value->>'phone', ''),
  'logoUrl', coalesce(value->>'logoUrl', ''),
  'facebook', coalesce(value->>'facebook', ''),
  'metaTitle', coalesce(value->>'metaTitle', ''),
  'metaDescription', coalesce(value->>'metaDescription', ''),
  'remoderateEdits', true
),
updated_at = now()
where key = 'identity' and value->>'name' = 'Marq';

update locations set area = 'Jumeirah Village Circle' where slug = 'jvc';
update locations set area = 'Jumeirah Lake Towers' where slug = 'jlt';
update locations set area = 'Dubai Hills Estate' where slug = 'dubai-hills';

insert into locations (emirate, area, slug, scope, popular, sort_order, parent_slug, active) values
('Dubai','Jumeirah','jumeirah','area',false,100,'',true),
('Dubai','Jumeirah 1','jumeirah-1','area',false,101,'jumeirah',true),
('Dubai','Jumeirah 2','jumeirah-2','area',false,102,'jumeirah',true),
('Dubai','Jumeirah 3','jumeirah-3','area',false,103,'jumeirah',true),
('Dubai','Jumeirah Beach Residence','jumeirah-beach-residence','area',false,104,'',true),
('Dubai','DIFC','difc','area',false,105,'',true),
('Dubai','City Walk','city-walk','area',false,106,'',true),
('Dubai','Al Wasl','al-wasl','area',false,107,'',true),
('Dubai','Umm Suqeim','umm-suqeim','area',false,108,'',true),
('Dubai','Umm Suqeim 1','umm-suqeim-1','area',false,109,'umm-suqeim',true),
('Dubai','Umm Suqeim 2','umm-suqeim-2','area',false,110,'umm-suqeim',true),
('Dubai','Umm Suqeim 3','umm-suqeim-3','area',false,111,'umm-suqeim',true),
('Dubai','Kite Beach','kite-beach','area',false,112,'',true),
('Dubai','Al Safa','al-safa','area',false,113,'',true),
('Dubai','Al Safa 1','al-safa-1','area',false,114,'al-safa',true),
('Dubai','Al Safa 2','al-safa-2','area',false,115,'al-safa',true),
('Dubai','Al Barsha 1','al-barsha-1','area',false,116,'al-barsha',true),
('Dubai','Al Barsha 2','al-barsha-2','area',false,117,'al-barsha',true),
('Dubai','Al Barsha 3','al-barsha-3','area',false,118,'al-barsha',true),
('Dubai','Barsha Heights','barsha-heights','area',false,119,'',true),
('Dubai','The Greens','the-greens','area',false,120,'',true),
('Dubai','The Views','the-views','area',false,121,'',true),
('Dubai','Dubai Internet City','dubai-internet-city','area',false,122,'',true),
('Dubai','Dubai Media City','dubai-media-city','area',false,123,'',true),
('Dubai','Dubai Production City','dubai-production-city','area',false,124,'',true),
('Dubai','Dubai Sports City','dubai-sports-city','area',false,125,'',true),
('Dubai','Arabian Ranches','arabian-ranches','area',false,126,'',true),
('Dubai','Arabian Ranches 2','arabian-ranches-2','area',false,127,'',true),
('Dubai','Dubai Creek Harbour','dubai-creek-harbour','area',false,128,'',true),
('Dubai','Dubai Festival City','dubai-festival-city','area',false,129,'',true),
('Dubai','International City','international-city','area',false,130,'',true),
('Dubai','Dubai Silicon Oasis','dubai-silicon-oasis','area',false,131,'',true),
('Dubai','Mirdif','mirdif','area',false,132,'',true),
('Dubai','Muhaisnah','muhaisnah','area',false,133,'',true),
('Dubai','Al Qusais','al-qusais','area',false,134,'',true),
('Dubai','Al Nahda','al-nahda','area',false,135,'',true),
('Dubai','Al Twar','al-twar','area',false,136,'',true),
('Dubai','Al Garhoud','al-garhoud','area',false,137,'',true),
('Dubai','Karama','karama','area',false,138,'',true),
('Dubai','Al Raffa','al-raffa','area',false,139,'',true),
('Dubai','Al Mankhool','al-mankhool','area',false,140,'',true),
('Dubai','Al Hamriya','al-hamriya','area',false,141,'',true),
('Dubai','Oud Metha','oud-metha','area',false,142,'',true),
('Dubai','Al Jaddaf','al-jaddaf','area',false,143,'',true),
('Dubai','Nad Al Sheba','nad-al-sheba','area',false,144,'',true),
('Dubai','Ras Al Khor','ras-al-khor','area',false,145,'',true),
('Dubai','Al Khawaneej','al-khawaneej','area',false,146,'',true),
('Dubai','Nad Al Hamar','nad-al-hamar','area',false,147,'',true),
('Dubai','Warsan','warsan','area',false,148,'',true),
('Dubai','Dubai South','dubai-south','area',false,149,'',true),
('Dubai','Dubai Investment Park','dubai-investment-park','area',false,150,'',true),
('Dubai','Jebel Ali','jebel-ali','area',false,151,'',true),
('Dubai','Jebel Ali Village','jebel-ali-village','area',false,152,'',true),
('Dubai','Discovery Gardens','discovery-gardens','area',false,153,'',true),
('Dubai','The Gardens','the-gardens','area',false,154,'',true),
('Dubai','Bluewaters Island','bluewaters-island','area',false,155,'',true),
('Dubai','Dubai Harbour','dubai-harbour','area',false,156,'',true),
('Dubai','Emirates Hills','emirates-hills','area',false,157,'',true),
('Dubai','The Springs','the-springs','area',false,158,'',true),
('Dubai','The Meadows','the-meadows','area',false,159,'',true),
('Dubai','The Lakes','the-lakes','area',false,160,'',true),
('Dubai','Jumeirah Islands','jumeirah-islands','area',false,161,'',true),
('Dubai','Jumeirah Park','jumeirah-park','area',false,162,'',true),
('Dubai','Jumeirah Village Triangle','jumeirah-village-triangle','area',false,163,'',true),
('Dubai','Town Square','town-square','area',false,164,'',true),
('Dubai','DAMAC Hills','damac-hills','area',false,165,'',true),
('Dubai','DAMAC Hills 2','damac-hills-2','area',false,166,'',true),
('Dubai','Tilal Al Ghaf','tilal-al-ghaf','area',false,167,'',true),
('Dubai','Mudon','mudon','area',false,168,'',true),
('Dubai','Remraam','remraam','area',false,169,'',true),
('Dubai','The Villa','the-villa','area',false,170,'',true),
('Dubai','Dubailand','dubailand','area',false,171,'',true),
('Dubai','Academic City','academic-city','area',false,172,'',true),
('Dubai','Dubai International Airport','dubai-international-airport','area',false,173,'',true),
('Dubai','Al Awir','al-awir','area',false,174,'',true)
on conflict (slug) do nothing;
