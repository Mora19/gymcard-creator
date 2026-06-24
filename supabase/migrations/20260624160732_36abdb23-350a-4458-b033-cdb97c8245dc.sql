CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  studio TEXT NOT NULL,
  note TEXT,
  holder_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  name_on_holder BOOLEAN NOT NULL DEFAULT false,
  holder_name TEXT,
  phone_on_holder BOOLEAN NOT NULL DEFAULT false,
  holder_phone TEXT,
  with_logo BOOLEAN NOT NULL DEFAULT false,
  with_band BOOLEAN NOT NULL DEFAULT false,
  band_color TEXT,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);