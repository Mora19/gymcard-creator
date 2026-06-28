
-- Ensure trigger exists to auto-assign visible order numbers
DROP TRIGGER IF EXISTS trg_assign_order_number ON public.orders;
CREATE TRIGGER trg_assign_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.assign_order_number();

-- Backfill any existing rows missing an order_number
UPDATE public.orders
SET order_number = 'GT-' || lpad(nextval('public.orders_number_seq')::text, 3, '0')
WHERE order_number IS NULL;

-- Promote moritz.kloesters@gmail.com to admin if registered
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = 'moritz.kloesters@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
