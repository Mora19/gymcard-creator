BEGIN;

CREATE OR REPLACE FUNCTION public.create_order_with_checked_studio_price(
  payload jsonb,
  expected_unit_price integer
)
RETURNS TABLE(order_number text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_number text;
  new_status text;
  saved_unit_price integer;
  saved_with_studio_logo boolean;
BEGIN
  IF jsonb_typeof(payload) IS DISTINCT FROM 'object'
    OR (payload->'with_logo') IS DISTINCT FROM 'true'::jsonb
    OR COALESCE(payload->'with_recardnize_logo', 'false'::jsonb) IS DISTINCT FROM 'false'::jsonb
    OR expected_unit_price IS NULL OR expected_unit_price <= 0 THEN
    RAISE EXCEPTION 'Invalid studio order or price' USING ERRCODE = '22023';
  END IF;

  SELECT created.order_number, created.status
    INTO STRICT new_number, new_status
    FROM public.create_order(payload - 'price_cents' - 'with_recardnize_logo') AS created;

  IF new_number IS NULL OR btrim(new_number) = '' THEN
    RAISE EXCEPTION 'The checkout did not return an order number';
  END IF;

  SELECT o.price_cents, o.with_logo AND NOT o.with_recardnize_logo
    INTO STRICT saved_unit_price, saved_with_studio_logo
    FROM public.orders AS o
    WHERE o.order_number = new_number;

  IF saved_unit_price IS DISTINCT FROM expected_unit_price
    OR saved_with_studio_logo IS DISTINCT FROM true THEN
    -- The insert and the check share a transaction, so no order survives a mismatch.
    RAISE EXCEPTION 'The studio price is not ready' USING ERRCODE = 'PT409';
  END IF;

  RETURN QUERY SELECT new_number, new_status;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_checked_studio_price(jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_checked_studio_price(jsonb, integer)
  TO anon, authenticated;

COMMIT;
