-- Grant Data API access on orders that was missing
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Also ensure sequence used by order_number trigger is usable for inserts
GRANT USAGE, SELECT ON SEQUENCE public.orders_number_seq TO anon, authenticated, service_role;