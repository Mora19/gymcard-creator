import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const orderSchema = z.object({
  contact_name: z.string().trim().min(1).max(100),
  contact_phone: z.string().trim().min(4).max(40),
  contact_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  pickup_location: z.string().trim().min(1).max(120),
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
  quantity: z.number().int().min(1).max(99),
  price_cents: z.number().int().nonnegative(),
});

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    });

    const payload = {
      contact_name: data.contact_name,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email || "",
      pickup_location: data.pickup_location,
      note: data.note || "",
      holder_color: data.holder_color,
      text_color: data.text_color,
      name_on_holder: data.name_on_holder,
      holder_name: data.name_on_holder ? data.holder_name || "" : "",
      phone_on_holder: data.phone_on_holder,
      holder_phone: data.phone_on_holder ? data.holder_phone || "" : "",
      with_logo: data.with_logo,
      with_band: data.with_band,
      band_color: data.with_band ? data.band_color || "" : "",
      quantity: data.quantity,
      price_cents: data.price_cents,
    };

    const { data: row, error } = await supabase
      .rpc("create_order", { payload })
      .single();

    if (error) {
      console.error("[orders.create_order]", JSON.stringify(error), error);
      throw new Error("Bestellung konnte nicht gespeichert werden.");
    }
    const result = row as { order_number: string; status: string };
    return { order_number: result.order_number, status: result.status };
  });

export type AdminOrder = {
  id: string;
  order_number: string | null;
  created_at: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  holder_name: string | null;
  holder_phone: string | null;
  name_on_holder: boolean;
  phone_on_holder: boolean;
  with_logo: boolean;
  holder_color: string;
  text_color: string;
  with_band: boolean;
  band_color: string | null;
  quantity: number;
  pickup_location: string | null;
  studio: string | null;
  paid: boolean;
  status: string;
  note: string | null;
  price_cents: number;
};

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error("Rollenprüfung fehlgeschlagen");
  if (!data) throw new Error("Forbidden: Admin-Rechte erforderlich");
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AdminOrder[];
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "printed", "ready", "delivered", "cancelled"]).optional(),
        paid: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.supabase, context.userId);
    const patch: { status?: string; paid?: boolean } = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.paid !== undefined) patch.paid = data.paid;
    const { error } = await context.supabase.from("orders").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
