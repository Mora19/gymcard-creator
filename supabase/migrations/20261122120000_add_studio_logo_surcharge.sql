BEGIN;

-- apply only to the known server-priced checkout, preserving its contract and grants
DO $migration$
DECLARE
  legacy_price CONSTANT text := $price$  -- Binding unit price computed server-side: 4,99 € base, +1,00 € band
  v_unit := 499 + CASE WHEN v_band THEN 100 ELSE 0 END;$price$;
  studio_price CONSTANT text := $price$  -- Binding unit price: 499 cents base, +100 cents each for band and studio logo.
  v_unit := 499 + CASE WHEN v_band THEN 100 ELSE 0 END
    + CASE WHEN COALESCE((payload->>'with_logo')::boolean, false) THEN 100 ELSE 0 END;$price$;
  checkout_definition text;
  checkout_body_hash text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef(p.oid),
    md5(btrim(replace(p.prosrc, E'\r\n', E'\n'), E'\n\r\t '))
  INTO STRICT checkout_definition, checkout_body_hash
  FROM pg_catalog.pg_proc AS p
  WHERE p.oid = 'public.create_order(jsonb)'::regprocedure
    AND p.prosecdef
    AND pg_catalog.pg_get_function_result(p.oid) = 'TABLE(order_number text, status text)';

  IF checkout_body_hash = '648cb15d786f04fbbf5f90bacd932742' THEN
    RETURN;
  END IF;

  checkout_definition := replace(checkout_definition, E'\r\n', E'\n');
  IF checkout_body_hash <> 'c271521e000ee0fd87694b5e1f6d51b3'
    OR strpos(checkout_definition, legacy_price) = 0 THEN
    RAISE EXCEPTION 'Review public.create_order(jsonb) before installing the studio logo surcharge: unrecognized checkout function body';
  END IF;

  -- The recardnize wrapper requires with_logo=false, so it keeps the base price.
  EXECUTE replace(checkout_definition, legacy_price, studio_price);
END;
$migration$;

COMMIT;
