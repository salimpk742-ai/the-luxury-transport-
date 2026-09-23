-- Sample inventory so the marketplace can be reviewed before real advertisers join.
-- These companies are fictional. Verified badges here demonstrate the badge only.

insert into site_settings (key, value) values (
  'identity',
  $id${"name":"The Luxury Cars","legalName":"The Luxury Cars","tagline":"Find your next car in Dubai","description":"The Luxury Cars is a Dubai automotive marketplace where customers can discover cars available for rent and cars available for sale from rental companies, dealers, businesses and private sellers.","url":"https://theluxurycars.com","email":"hello@theluxurycars.com","phone":"","supportWhatsapp":"","instagram":"","x":"","facebook":"","logoUrl":"","metaTitle":"","metaDescription":"","moderation":"manual","remoderateEdits":true}$id$::jsonb
);

insert into categories (slug, name, kind, sort_order) values
('luxury','Luxury','class',1),
('suv','SUV','class',2),
('sports','Sports','class',3),
('sedan','Sedan','class',4),
('economy','Economy','class',5),
('convertible','Convertible','class',6),
('electric','Electric','class',7),
('seven-seater','7 Seater','class',8),
('supercar','Supercar','class',9),
('van','Van','class',10),
('hybrid','Hybrid','class',11);

insert into locations (emirate, area, slug, scope, popular, sort_order) values
('Dubai','Dubai','dubai','emirate',true,1),
('Dubai','Dubai Marina','dubai-marina','area',true,2),
('Dubai','Downtown Dubai','downtown-dubai','area',true,3),
('Dubai','JVC','jvc','area',true,4),
('Dubai','Business Bay','business-bay','area',true,5),
('Dubai','Deira','deira','area',true,6),
('Dubai','Bur Dubai','bur-dubai','area',true,7),
('Dubai','Al Quoz','al-quoz','area',true,8),
('Dubai','Palm Jumeirah','palm-jumeirah','area',true,9),
('Dubai','JLT','jlt','area',false,10),
('Dubai','Dubai Hills','dubai-hills','area',false,11),
('Dubai','Motor City','motor-city','area',false,12),
('Dubai','Al Barsha','al-barsha','area',false,13),
('Sharjah','Sharjah','sharjah','emirate',true,20),
('Abu Dhabi','Abu Dhabi','abu-dhabi','emirate',true,21),
('Ajman','Ajman','ajman','emirate',false,22),
('Ras Al Khaimah','Ras Al Khaimah','ras-al-khaimah','emirate',false,23),
('Fujairah','Fujairah','fujairah','emirate',false,24),
('Umm Al Quwain','Umm Al Quwain','umm-al-quwain','emirate',false,25);

insert into companies (
  id, user_id, slug, name, salesperson_name, account_type, description, phone, whatsapp, email,
  website, address, emirate, area, verified, verification_note, plan, is_demo
) values
(1,'seed:gulf','gulf-line-rentals','Gulf Line Rentals','Layla Hassan','rental_company',
 'Sample rental desk used to show how a company profile lists cars for rent. Not a real business.',
 '','','rentals@gulf-line.example','','Marina Plaza, Dubai Marina','Dubai','Dubai Marina',
 true,'Sample badge only. No trade licence has been reviewed.','premium',true),
(2,'seed:alnoor','al-noor-motors','Al Noor Motors','Omar Farid','dealer',
 'Sample dealer profile for cars offered for sale. Not a licensed showroom.',
 '','','sales@al-noor.example','','Al Quoz Industrial 1','Dubai','Al Quoz',
 true,'Sample badge only. No trade licence has been reviewed.','dealer',true),
(3,'seed:marina','marina-prestige','Marina Prestige','Nadia Karim','dealer',
 'Sample premium dealer profile. Listings are illustrative.',
 '','','hello@marina-prestige.example','','Downtown Dubai','Dubai','Downtown Dubai',
 true,'Sample badge only. No trade licence has been reviewed.','premium',true),
(4,'seed:horizon','horizon-drive','Horizon Drive','Rashid Ali','rental_company',
 'Sample rental company without a verified badge, so the difference is visible.',
 '','','book@horizon-drive.example','','Deira','Dubai','Deira',
 false,'','free',true),
(5,'seed:samira','samira-khan','Samira Khan','Samira Khan','individual',
 'Sample private seller. No business verification is claimed.',
 '','','samira@example.com','','JVC','Dubai','JVC',
 false,'','free',true),
(6,'seed:atelier','atelier-motors','Atelier Motors','Julian Peck','business',
 'Sample specialist desk for sports and supercar rentals. Not a real operator.',
 '','','desk@atelier-motors.example','','Business Bay','Dubai','Business Bay',
 true,'Sample badge only. No trade licence has been reviewed.','premium',true);

insert into verifications (company_id, status, trade_license_ref, document_note, notes, reviewed_by) values
(1,'approved','','No document stored','Demonstration record only. Not a government approval.','seed'),
(2,'approved','','No document stored','Demonstration record only. Not a government approval.','seed'),
(3,'approved','','No document stored','Demonstration record only. Not a government approval.','seed'),
(6,'approved','','No document stored','Demonstration record only. Not a government approval.','seed');

insert into listings (id, company_id, user_id, type, status, title, slug_vehicle, slug_area, make, model, variant, year, body_type, category, transmission, fuel, engine, seats, color, mileage, regional_spec, emirate, area, area_slug, pickup_location, description, whatsapp, phone, preferred_contact, is_featured, promotion_tier, views, with_driver, availability, condition, seller_type, published_at, expires_at) values
(1,1,'seed:gulf','RENT','PUBLISHED','2024 Mercedes-Benz G-Class G 63','mercedes-benz-g-class','dubai-marina','Mercedes-Benz','G-Class','G 63',2024,'SUV','luxury','Automatic','Petrol','4.0L V8',5,'White',18000,'GCC','Dubai','Dubai Marina','dubai-marina','Dubai Marina branch','Daily, weekly and monthly hire. 250 km a day included. Security deposit is held for the rental and released after the car is returned in the agreed condition. Driver must present a valid licence.','','','whatsapp',true,'featured',640,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(2,1,'seed:gulf','RENT','PUBLISHED','2023 Range Rover Autobiography','range-rover-autobiography','downtown-dubai','Range Rover','Autobiography','',2023,'SUV','luxury','Automatic','Petrol','4.4L V8',5,'Black',22000,'GCC','Dubai','Downtown Dubai','downtown-dubai','Downtown handover desk','Chauffeur can be added. 200 km a day included on self-drive. Confirm the deposit and insurance excess before you book.','','','whatsapp',true,'featured',510,true,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(3,6,'seed:atelier','RENT','PUBLISHED','2024 Porsche 911 Carrera','porsche-911','business-bay','Porsche','911','Carrera',2024,'Coupe','sports','Automatic','Petrol','3.0L',4,'Silver',8000,'GCC','Dubai','Business Bay','business-bay','Business Bay','Weekend and weekly sports-car hire. 150 km a day. A higher deposit applies. Ask about track-day restrictions before you book.','','','whatsapp',true,'featured',430,false,'available','used','Business', now() - interval '2 days', now() + interval '45 days'),
(4,1,'seed:gulf','RENT','PUBLISHED','2022 Toyota Land Cruiser 300','toyota-land-cruiser','al-quoz','Toyota','Land Cruiser','300',2022,'SUV','suv','Automatic','Petrol','3.5L twin-turbo',7,'White',41000,'GCC','Dubai','Al Quoz','al-quoz','Al Quoz yard','Family SUV with a 300 km daily allowance. Suitable for city use. Confirm child seats and salik when you message the desk.','','','whatsapp',false,'none',380,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(5,4,'seed:horizon','RENT','PUBLISHED','2024 Nissan Patrol Platinum','nissan-patrol','deira','Nissan','Patrol','Platinum',2024,'SUV','suv','Automatic','Petrol','5.6L V8',7,'Pearl',15000,'GCC','Dubai','Deira','deira','Deira','Seven-seat Patrol on daily or monthly terms. 250 km a day. This sample advertiser is not marked verified.','','','whatsapp',false,'none',290,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(6,4,'seed:horizon','RENT','PUBLISHED','2023 BMW 5 Series 530i','bmw-5-series','jvc','BMW','5 Series','530i',2023,'Sedan','sedan','Automatic','Petrol','2.0L',5,'Blue',28000,'GCC','Dubai','JVC','jvc','JVC','Executive sedan for weekly and monthly use. 250 km a day. Airport delivery can be arranged with the advertiser.','','','whatsapp',false,'none',210,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(7,1,'seed:gulf','RENT','PUBLISHED','2024 Tesla Model 3 Long Range','tesla-model-3','dubai-marina','Tesla','Model 3','Long Range',2024,'Sedan','electric','Automatic','Electric','Dual motor',5,'White',12000,'GCC','Dubai','Dubai Marina','dubai-marina','Dubai Marina','Electric sedan. Charging is the renter responsibility unless the advertiser confirms otherwise. 300 km a day included.','','','whatsapp',false,'none',260,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(8,4,'seed:horizon','RENT','PUBLISHED','2021 Kia Carnival','kia-carnival','bur-dubai','Kia','Carnival','',2021,'Van','seven-seater','Automatic','Petrol','3.5L',7,'Graphite',52000,'GCC','Dubai','Bur Dubai','bur-dubai','Bur Dubai','Seven-seat van for family or crew use. 250 km a day. Ask about additional driver fees.','','','whatsapp',false,'none',175,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(9,6,'seed:atelier','RENT','PUBLISHED','2023 Lamborghini Huracan EVO','lamborghini-huracan','downtown-dubai','Lamborghini','Huracan','EVO',2023,'Coupe','supercar','Automatic','Petrol','5.2L V10',2,'Green',6000,'European','Dubai','Downtown Dubai','downtown-dubai','Downtown','Supercar hire with a 120 km daily cap and a larger deposit. Self-drive only. Confirm the excess in writing before payment.','','','whatsapp',true,'featured',720,false,'available','used','Business', now() - interval '2 days', now() + interval '45 days'),
(10,4,'seed:horizon','RENT','PUBLISHED','2023 Toyota Camry','toyota-camry','deira','Toyota','Camry','',2023,'Sedan','economy','Automatic','Petrol','2.5L',5,'Silver',34000,'GCC','Dubai','Deira','deira','Deira','Straightforward daily driver. 250 km a day and a modest deposit. Good first comparison if you want a lower rate.','','','whatsapp',false,'none',140,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(11,4,'seed:horizon','RENT','PUBLISHED','2022 Hyundai Tucson Hybrid','hyundai-tucson','jvc','Hyundai','Tucson','Hybrid',2022,'SUV','hybrid','Automatic','Hybrid','1.6L hybrid',5,'Grey',39000,'GCC','Dubai','JVC','jvc','JVC','Hybrid compact SUV. 250 km a day. Monthly rates are listed so you can compare against a daily hire.','','','whatsapp',false,'none',120,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(12,1,'seed:gulf','RENT','PUBLISHED','2024 Mercedes-Benz CLE Cabriolet','mercedes-benz-cle','palm-jumeirah','Mercedes-Benz','CLE','Cabriolet',2024,'Convertible','convertible','Automatic','Petrol','2.0L',4,'White',9000,'GCC','Dubai','Palm Jumeirah','palm-jumeirah','Palm Jumeirah','Convertible with the roof included in the rate. 200 km a day. Ask about a second driver before you collect the car.','','','whatsapp',false,'none',305,false,'available','used','Rental Company', now() - interval '2 days', now() + interval '45 days'),
(13,2,'seed:alnoor','SALE','PUBLISHED','2024 Mercedes-Benz GLE 450','mercedes-benz-gle','business-bay','Mercedes-Benz','GLE','450',2024,'SUV','suv','Automatic','Petrol','3.0L',5,'White',42000,'GCC','Dubai','Business Bay','business-bay','Viewing in Business Bay','Seller states full service history with the agency and no accident repairs. Inspect the car and the ownership documents before any transfer.','','','whatsapp',true,'featured',410,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(14,2,'seed:alnoor','SALE','PUBLISHED','2021 BMW X5 xDrive40i','bmw-x5','dubai-hills','BMW','X5','xDrive40i',2021,'SUV','suv','Automatic','Petrol','3.0L',5,'Black',68000,'GCC','Dubai','Dubai Hills','dubai-hills','Viewing in Dubai Hills','GCC specification according to the seller. Service invoices available on request. Price is negotiable only with the seller, not with the marketplace.','','','whatsapp',false,'none',188,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(15,3,'seed:marina','SALE','PUBLISHED','2023 Audi Q8 55 TFSI','audi-q8','downtown-dubai','Audi','Q8','55 TFSI',2023,'SUV','luxury','Automatic','Petrol','3.0L',5,'Grey',31000,'GCC','Dubai','Downtown Dubai','downtown-dubai','Downtown viewing','Dealer sample listing. Ask for the inspection report and whether the price includes transfer fees.','','','whatsapp',true,'featured',266,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(16,3,'seed:marina','SALE','PUBLISHED','2020 Lexus LX 570','lexus-lx','al-quoz','Lexus','LX','570',2020,'SUV','suv','Automatic','Petrol','5.7L V8',7,'White',79000,'GCC','Dubai','Al Quoz','al-quoz','Al Quoz viewing','Full-size Lexus. The seller says the car is GCC spec. Check chassis and service history yourself.','','','whatsapp',false,'none',154,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(17,3,'seed:marina','SALE','PUBLISHED','2024 Ferrari Roma','ferrari-roma','palm-jumeirah','Ferrari','Roma','',2024,'Coupe','supercar','Automatic','Petrol','3.9L V8',2,'Red',8000,'European','Dubai','Palm Jumeirah','palm-jumeirah','By appointment','European specification sample listing. Import and registration status should be confirmed with the seller and the relevant authority before payment.','','','whatsapp',true,'featured',540,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(18,5,'seed:samira','SALE','PUBLISHED','2019 Toyota Land Cruiser GXR','toyota-land-cruiser','jvc','Toyota','Land Cruiser','GXR',2019,'SUV','suv','Automatic','Petrol','4.0L V6',7,'White',112000,'GCC','Dubai','JVC','jvc','JVC viewing','Private-seller sample. The marketplace does not hold this car or its documents. Meet in a public place and do not transfer money before you have seen the vehicle.','','','whatsapp',false,'none',96,false,'available','used','Private Seller', now() - interval '2 days', now() + interval '45 days'),
(19,2,'seed:alnoor','SALE','PUBLISHED','2022 Porsche Cayenne','porsche-cayenne','dubai-marina','Porsche','Cayenne','',2022,'SUV','luxury','Automatic','Petrol','3.0L',5,'White',45000,'GCC','Dubai','Dubai Marina','dubai-marina','Marina viewing','Cayenne listed by the sample dealer. Ask whether service is up to date and if any options are missing from the description.','','','whatsapp',true,'featured',233,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days'),
(20,2,'seed:alnoor','SALE','PUBLISHED','2023 Tesla Model Y Long Range','tesla-model-y','motor-city','Tesla','Model Y','Long Range',2023,'SUV','electric','Automatic','Electric','Dual motor',5,'White',28000,'GCC','Dubai','Motor City','motor-city','Motor City','Electric crossover. Confirm battery health, charger inclusion and remaining warranty with the seller.','','','whatsapp',false,'none',142,false,'available','used','Dealer', now() - interval '2 days', now() + interval '45 days');

insert into rental_details (listing_id, daily_price, weekly_price, monthly_price, deposit, min_period, mileage_allowance, extra_mileage_price, insurance, driver_requirements, delivery) values
(1,900,5500,18000,5000,'1 day','250 km/day','AED 5 per extra km','Basic insurance included. Excess applies.','Valid driving licence and passport or Emirates ID.','Pickup from Dubai Marina. Delivery across Dubai on request.'),
(2,750,4500,14000,4000,'1 day','200 km/day','AED 8 per extra km','Comprehensive cover with an excess.','Minimum age 23 for self-drive.','Hotel or office delivery in central Dubai.'),
(3,1200,7000,22000,8000,'1 day','150 km/day','AED 15 per extra km','Sports excess applies.','Valid licence held for at least two years.','Pickup in Business Bay.'),
(4,450,2600,8000,2000,'1 day','300 km/day','AED 3 per extra km','Standard rental insurance.','Valid UAE or international licence.','Pickup in Al Quoz, delivery available.'),
(5,350,2000,6500,1500,'1 day','250 km/day','AED 3 per extra km','Basic cover included.','Passport and licence required.','Deira pickup.'),
(6,280,1600,4800,1500,'3 days','250 km/day','AED 4 per extra km','Standard excess.','Age 21 and above.','Delivery in JVC and nearby communities.'),
(7,220,1300,3900,1500,'1 day','300 km/day','AED 2 per extra km','Standard cover.','Valid licence.','Marina pickup. Supercharger use is not included.'),
(8,250,1400,4500,1500,'1 day','250 km/day','AED 3 per extra km','Basic insurance.','Valid licence.','Bur Dubai pickup.'),
(9,2500,14000,45000,15000,'1 day','120 km/day','AED 25 per extra km','High excess. No off-road use.','Age 25 and a holding deposit.','Downtown handover by appointment.'),
(10,140,800,2400,1000,'1 day','250 km/day','AED 2 per extra km','Basic cover.','Valid licence.','Deira counter.'),
(11,160,950,2800,1000,'1 day','250 km/day','AED 2 per extra km','Standard cover.','Valid licence.','JVC delivery.'),
(12,480,2800,8500,2500,'1 day','200 km/day','AED 6 per extra km','Standard excess.','Age 23.','Palm handover or Marina delivery.');

insert into sale_details (listing_id, price, accident_history, service_history, warranty, registration_status) values
(13,285000,'Seller states no accident history. Confirm with a pre-purchase inspection.','Agency service history claimed by the seller.','Remainder of manufacturer warranty claimed. Ask for the booklet.','Registered in Dubai, according to the seller.'),
(14,175000,'Seller states one repaired bumper scuff. Ask for photos of the repair.','Independent service record claimed.','No warranty remaining, according to the seller.','Dubai registration claimed.'),
(15,249000,'Seller states no major accident.','Agency servicing claimed.','Extended warranty available, according to the seller. Confirm the provider.','Dubai.'),
(16,210000,'No accidents declared by the seller.','Mixed agency and independent servicing claimed.','None stated.','Dubai registration claimed.'),
(17,1150000,'Seller states no accident history.','Ferrari service history claimed.','Factory coverage claimed. Ask for the expiry date.','Seller states the car can be registered in Dubai. Verify this.'),
(18,165000,'Owner states a minor parking dent, repaired.','Independent garage servicing.','No warranty.','Dubai, according to the owner.'),
(19,310000,'No accidents declared.','Agency service claimed.','No extended warranty stated.','Dubai.'),
(20,155000,'No accidents declared by the seller.','Tesla service claimed.','Battery and vehicle warranty claimed. Check the app or paperwork.','Dubai registration claimed.');

insert into vehicle_images (listing_id, url, alt, sort_order, is_primary) values
(1, '/media/g63.jpg', 'White Mercedes-Benz G 63 parked in Dubai Marina', 0, true),
(2, '/media/rangerover.jpg', 'Black Range Rover on a Downtown Dubai street', 0, true),
(3, '/media/porsche911.jpg', 'Silver Porsche 911 by the Dubai waterfront', 0, true),
(4, '/media/landcruiser.jpg', 'White Toyota Land Cruiser in daylight', 0, true),
(5, '/media/patrol.jpg', 'Pearl Nissan Patrol in a shaded courtyard', 0, true),
(6, '/media/bmw5.jpg', 'Dark blue BMW 5 Series on a Dubai plaza', 0, true),
(7, '/media/tesla3.jpg', 'White Tesla Model 3 on a palm-lined street', 0, true),
(8, '/media/carnival.jpg', 'Graphite Kia Carnival on a residential street', 0, true),
(9, '/media/huracan.jpg', 'Lamborghini Huracan on a Dubai plaza at sunset', 0, true),
(10, '/media/camry.jpg', 'Silver Toyota Camry on a bright Dubai street', 0, true),
(11, '/media/tucson.jpg', 'Grey Hyundai Tucson beside an apartment garden', 0, true),
(12, '/media/cle.jpg', 'White Mercedes-Benz CLE convertible at Dubai Marina', 0, true),
(13, '/media/gle.jpg', 'White Mercedes-Benz GLE in Business Bay', 0, true),
(14, '/media/bmwx5.jpg', 'Black BMW X5 on a residential road', 0, true),
(15, '/media/q8.jpg', 'Grey Audi Q8 in a courtyard', 0, true),
(16, '/media/lexus.jpg', 'White Lexus LX under palms', 0, true),
(17, '/media/roma.jpg', 'Red Ferrari Roma on the Dubai corniche', 0, true),
(18, '/media/landcruiser.jpg', 'White Toyota Land Cruiser', 0, true),
(19, '/media/cayenne.jpg', 'White Porsche Cayenne in Dubai Hills', 0, true),
(20, '/media/modely.jpg', 'White Tesla Model Y among palms', 0, true),
(1, '/media/g63-rear.jpg', 'Rear view of a white Mercedes-Benz G 63', 1, false),
(1, '/media/g63-interior.jpg', 'Front cabin of a Mercedes-Benz G-Class', 2, false);

select setval('companies_id_seq', (select max(id) from companies));
select setval('listings_id_seq', (select max(id) from listings));
select setval('categories_id_seq', (select max(id) from categories));
select setval('locations_id_seq', (select max(id) from locations));
select setval('verifications_id_seq', (select max(id) from verifications));
select setval('vehicle_images_id_seq', (select max(id) from vehicle_images));
