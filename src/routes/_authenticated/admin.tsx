import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listOrders, updateOrder, type AdminOrder } from "@/lib/orders.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Download, LogOut, RefreshCw, Tag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · GymTag Bestellungen" }] }),
  component: AdminPage,
});

const CSV_HEADERS = [
  "order_id",
  "customer_name",
  "contact_phone",
  "holder_name",
  "holder_phone",
  "include_name",
  "include_phone",
  "include_logo",
  "holder_color",
  "text_color",
  "include_band",
  "band_color",
  "quantity",
  "pickup_location",
  "paid",
  "status",
  "notes",
] as const;

function csvEscape(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Replace semicolons, line breaks, quotes to keep CSV clean.
  const clean = str.replace(/[\r\n]+/g, " ").replace(/;/g, ",");
  if (clean.includes('"')) return `"${clean.replace(/"/g, '""')}"`;
  return clean;
}

function orderToCsvRow(o: AdminOrder) {
  return [
    o.order_number ?? "",
    o.contact_name,
    o.contact_phone,
    o.name_on_holder ? o.holder_name ?? "" : "",
    o.phone_on_holder ? o.holder_phone ?? "" : "",
    o.name_on_holder ? "true" : "false",
    o.phone_on_holder ? "true" : "false",
    o.with_logo ? "true" : "false",
    o.holder_color,
    o.text_color,
    o.with_band ? "true" : "false",
    o.with_band ? o.band_color ?? "" : "",
    String(o.quantity),
    o.pickup_location ?? o.studio ?? "",
    o.paid ? "true" : "false",
    o.status,
    o.note ?? "",
  ]
    .map(csvEscape)
    .join(";");
}

function downloadCsv(orders: AdminOrder[]) {
  const lines = [CSV_HEADERS.join(";"), ...orders.map(orderToCsvRow)];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

const STATUS_OPTIONS = ["new", "printed", "ready", "delivered", "cancelled"] as const;

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const patchOrder = useServerFn(updateOrder);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function setStatus(o: AdminOrder, status: string) {
    try {
      await patchOrder({ data: { id: o.id, status: status as any } });
      toast.success("Status aktualisiert");
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Fehler");
    }
  }

  async function togglePaid(o: AdminOrder) {
    try {
      await patchOrder({ data: { id: o.id, paid: !o.paid } });
      refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Fehler");
    }
  }

  const orders = data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground">
              <Tag className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold uppercase">GymTag · Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Neu laden
            </Button>
            <Button
              size="sm"
              onClick={() => downloadCsv(orders)}
              disabled={orders.length === 0}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <Download className="mr-2 h-4 w-4" /> CSV exportieren
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-3xl font-black uppercase">Bestellungen</h1>
          <span className="text-sm text-muted-foreground">{orders.length} Einträge</span>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">Lade…</div>}
        {isError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            {(error as Error).message}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Noch keine Bestellungen.
          </div>
        )}

        {orders.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-background/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left">Nr.</th>
                  <th className="px-3 py-3 text-left">Kunde</th>
                  <th className="px-3 py-3 text-left">Telefon</th>
                  <th className="px-3 py-3 text-left">Halter</th>
                  <th className="px-3 py-3 text-left">Farben</th>
                  <th className="px-3 py-3 text-left">Band</th>
                  <th className="px-3 py-3 text-right">Anz.</th>
                  <th className="px-3 py-3 text-right">Preis</th>
                  <th className="px-3 py-3 text-left">Abholort</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Bezahlt</th>
                  <th className="px-3 py-3 text-left">Notiz</th>
                  <th className="px-3 py-3 text-left">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-border align-top">
                    <td className="px-3 py-3 font-mono text-xs">{o.order_number ?? o.id.slice(0, 8)}</td>
                    <td className="px-3 py-3">{o.contact_name}</td>
                    <td className="px-3 py-3">{o.contact_phone}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{o.name_on_holder ? o.holder_name : <span className="text-muted-foreground">– kein Name –</span>}</div>
                      {o.phone_on_holder && <div className="text-xs text-muted-foreground">Tel: {o.holder_phone}</div>}
                      {o.with_logo && <div className="text-xs text-brand">+ Logo</div>}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <div>Halter: {o.holder_color}</div>
                      <div>Text: {o.text_color}</div>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {o.with_band ? <>ja · {o.band_color}</> : <span className="text-muted-foreground">nein</span>}
                    </td>
                    <td className="px-3 py-3 text-right">{o.quantity}</td>
                    <td className="px-3 py-3 text-right font-semibold">{formatPrice(o.price_cents * o.quantity)}</td>
                    <td className="px-3 py-3">{o.pickup_location ?? o.studio}</td>
                    <td className="px-3 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o, e.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => togglePaid(o)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.paid ? "bg-emerald-500/20 text-emerald-300" : "bg-muted text-muted-foreground"}`}
                      >
                        {o.paid ? "bezahlt" : "offen"}
                      </button>
                    </td>
                    <td className="max-w-[220px] px-3 py-3 text-xs text-muted-foreground">{o.note}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleString("de-DE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
