CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
 RETURNS TABLE(order_number text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_number text;
  new_status text;
  v_band boolean := COALESCE((payload->>'with_band')::boolean, false);
  v_qty int := (payload->>'quantity')::int;
  v_unit int;
BEGIN
  IF v_qty IS NULL OR v_qty < 1 OR v_qty > 99 THEN
    RAISE EXCEPTION 'invalid quantity';
  END IF;
  IF length(COALESCE(payload->>'contact_name','')) = 0 OR length(COALESCE(payload->>'contact_phone','')) < 4 THEN
    RAISE EXCEPTION 'missing contact';
  END IF;
  -- Binding unit price computed server-side: 4,99 € base, +1,00 € band
  v_unit := 499 + CASE WHEN v_band THEN 100 ELSE 0 END;

  new_number := 'GT-' || lpad(nextval('public.orders_number_seq')::text, 3, '0');

  INSERT INTO public.orders (
    order_number, contact_name, contact_phone, contact_email,
    studio, pickup_location, note, holder_color, text_color,
    name_on_holder, holder_name, phone_on_holder, holder_phone,
    with_logo, with_band, band_color, quantity, price_cents, status, paid
  ) VALUES (
    new_number,
    left(payload->>'contact_name',100),
    left(payload->>'contact_phone',40),
    NULLIF(left(payload->>'contact_email',200),''),
    left(payload->>'pickup_location',120),
    left(payload->>'pickup_location',120),
    NULLIF(left(payload->>'note',1000),''),
    payload->>'holder_color',
    payload->>'text_color',
    COALESCE((payload->>'name_on_holder')::boolean,false),
    NULLIF(left(payload->>'holder_name',40),''),
    COALESCE((payload->>'phone_on_holder')::boolean,false),
    NULLIF(left(payload->>'holder_phone',40),''),
    COALESCE((payload->>'with_logo')::boolean,false),
    v_band,
    CASE WHEN v_band THEN NULLIF(payload->>'band_color','') ELSE NULL END,
    v_qty,
    v_unit,
    'new',
    false
  ) RETURNING orders.status INTO new_status;

  RETURN QUERY SELECT new_number, new_status;
END;
$function$;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
REVOKE INSERT ON public.orders FROM anon;
REVOKE INSERT ON public.orders FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO anon, authenticated;