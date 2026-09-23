-- Sample rentals already describe delivery in free text. Set the structured
-- flags to match that text so search filters are honest. Dubai-wide is used
-- only where the sample note already says delivery across Dubai.

update rental_details
set delivery_available = true,
    delivery_scope = 'dubai'
where listing_id = 1
  and delivery_available = false;

update rental_details
set delivery_available = true,
    delivery_scope = 'areas',
    delivery_areas = 'Central Dubai'
where listing_id = 2
  and delivery_available = false;

update rental_details
set delivery_available = true,
    delivery_scope = 'areas',
    delivery_areas = 'Al Quoz and nearby'
where listing_id = 4
  and delivery_available = false;

update rental_details
set delivery_available = true,
    delivery_scope = 'areas',
    delivery_areas = 'JVC and nearby communities',
    airport_delivery = true
where listing_id = 6
  and delivery_available = false;

update rental_details
set delivery_available = true,
    delivery_scope = 'areas',
    delivery_areas = 'Jumeirah Village Circle'
where listing_id = 11
  and delivery_available = false;

update rental_details
set delivery_available = true,
    delivery_scope = 'areas',
    delivery_areas = 'Palm Jumeirah, Dubai Marina'
where listing_id = 12
  and delivery_available = false;
