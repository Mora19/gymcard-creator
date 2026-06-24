import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  contact_name: z.string().trim().min(1).max(100),
  contact_phone: z.string().trim().min(4).max(40),
  contact_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  studio: z.string().trim().min(1).max(120),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  holder_color: z.enum(["Schwarz", "Weiß", "Rot", "Dunkelgrau"]),
  text_color: z.enum(["Rot", "Weiß", "Schwarz"]),
  name_on_holder: z.boolean(),
  holder_name: z.string().trim().max(40).optional().or(z.literal("")),
  phone_on_holder: z.boolean(),
  holder_phone: z.string().trim().max(40).optional().or(z.literal("")),
  with_logo: z.boolean(),
  with_band: z.boolean(),
  band_color: z.enum(["Rot", "Schwarz", "Weiß"]).optional().or(z.literal("")),
  price_cents: z.number().int().nonnegative(),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const payload = {
      ...data,
      contact_email: data.contact_email || null,
      note: data.note || null,
      holder_name: data.name_on_holder ? data.holder_name || null : null,
      holder_phone: data.phone_on_holder ? data.holder_phone || null : null,
      band_color: data.with_band ? data.band_color || null : null,
    };

    const { data: row, error } = await supabase
      .from("orders")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[orders.insert]", error);
      throw new Error("Bestellung konnte nicht gespeichert werden.");
    }
    return { id: row.id };
  });
