BEGIN;

-- The legacy RPC returns an order number, not a row id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_index AS i
    JOIN pg_catalog.pg_attribute AS a
      ON a.attrelid = i.indrelid AND a.attnum = i.indkey[0]
    WHERE i.indrelid = 'public.orders'::regclass
      AND a.attname = 'order_number'
      AND i.indisunique AND i.indisvalid AND i.indimmediate
      AND i.indnkeyatts = 1 AND i.indpred IS NULL
  ) THEN
    RAISE EXCEPTION 'The orders table requires a unique order_number for the recardnize RPC';
  END IF;
END;
$$;

ALTER TABLE public.orders
  ADD COLUMN with_recardnize_logo boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT orders_one_logo CHECK (NOT (with_logo AND with_recardnize_logo));

-- Reuse the existing checkout for order numbers and server-side pricing.
-- The follow-up update belongs to the same transaction as the insert.
CREATE FUNCTION public.create_order_with_recardnize_logo(payload jsonb)
RETURNS TABLE(order_number text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_number text;
  new_status text;
  new_id uuid;
BEGIN
  IF jsonb_typeof(payload) IS DISTINCT FROM 'object'
    OR (payload->'with_logo') IS DISTINCT FROM 'false'::jsonb THEN
    RAISE EXCEPTION 'Select exactly one logo' USING ERRCODE = '22023';
  END IF;

  SELECT created.order_number, created.status
    INTO STRICT new_number, new_status
    FROM public.create_order(payload - 'price_cents' - 'with_recardnize_logo') AS created;

  IF new_number IS NULL OR btrim(new_number) = '' THEN
    RAISE EXCEPTION 'The checkout did not return an order number';
  END IF;

  UPDATE public.orders AS o
    SET with_recardnize_logo = true
    WHERE o.order_number = new_number
      AND o.with_logo = false
      AND o.with_recardnize_logo = false
    RETURNING o.id INTO STRICT new_id;

  RETURN QUERY SELECT new_number, new_status;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_with_recardnize_logo(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_with_recardnize_logo(jsonb) TO anon, authenticated;

COMMIT;
