
CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS TABLE(order_number text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number text;
  new_status text;
BEGIN
  new_number := 'GT-' || lpad(nextval('public.orders_number_seq')::text, 3, '0');

  INSERT INTO public.orders (
    order_number,
    contact_name, contact_phone, contact_email,
    studio, pickup_location, note,
    holder_color, text_color,
    name_on_holder, holder_name,
    phone_on_holder, holder_phone,
    with_logo, with_band, band_color,
    quantity, price_cents,
    status, paid
  ) VALUES (
    new_number,
    payload->>'contact_name',
    payload->>'contact_phone',
    NULLIF(payload->>'contact_email',''),
    payload->>'pickup_location',
    payload->>'pickup_location',
    NULLIF(payload->>'note',''),
    payload->>'holder_color',
    payload->>'text_color',
    (payload->>'name_on_holder')::boolean,
    NULLIF(payload->>'holder_name',''),
    (payload->>'phone_on_holder')::boolean,
    NULLIF(payload->>'holder_phone',''),
    (payload->>'with_logo')::boolean,
    (payload->>'with_band')::boolean,
    NULLIF(payload->>'band_color',''),
    (payload->>'quantity')::int,
    (payload->>'price_cents')::int,
    'new',
    false
  ) RETURNING orders.status INTO new_status;

  RETURN QUERY SELECT new_number, new_status;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO anon, authenticated;
