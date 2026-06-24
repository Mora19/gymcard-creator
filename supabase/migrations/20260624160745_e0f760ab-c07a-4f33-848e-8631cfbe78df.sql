ALTER TABLE public.orders
  ADD CONSTRAINT contact_name_len CHECK (char_length(contact_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_phone_len CHECK (char_length(contact_phone) BETWEEN 4 AND 40),
  ADD CONSTRAINT contact_email_len CHECK (contact_email IS NULL OR char_length(contact_email) <= 200),
  ADD CONSTRAINT studio_len CHECK (char_length(studio) BETWEEN 1 AND 120),
  ADD CONSTRAINT note_len CHECK (note IS NULL OR char_length(note) <= 1000),
  ADD CONSTRAINT holder_name_len CHECK (holder_name IS NULL OR char_length(holder_name) <= 40),
  ADD CONSTRAINT holder_phone_len CHECK (holder_phone IS NULL OR char_length(holder_phone) <= 40);