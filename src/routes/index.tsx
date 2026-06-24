import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CreditCard,
  Phone,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MapPin,
  Package,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import heroImage from "@/assets/hero-card-holder.jpg";
import { submitOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personalisierter 3D-Kartenhalter fürs Gym – ab 7,90 €" },
      {
        name: "description",
        content:
          "Nie wieder Kartenchaos. Personalisierter 3D-gedruckter Kartenhalter für deine Gym-Karte – mit Name, optional Telefonnummer und Band für die Flasche. Abholung im Studio.",
      },
      { property: "og:title", content: "Nie wieder Kartenchaos – dein Gym-Kartenhalter" },
      {
        property: "og:description",
        content: "Konfiguriere deinen 3D-gedruckten Kartenhalter in 60 Sekunden.",
      },
    ],
  }),
  component: LandingPage,
});

const HOLDER_COLORS = ["Schwarz", "Weiß", "Rot", "Dunkelgrau"] as const;
const TEXT_COLORS = ["Rot", "Weiß", "Schwarz"] as const;
const BAND_COLORS = ["Rot", "Schwarz", "Weiß"] as const;

type HolderColor = (typeof HOLDER_COLORS)[number];
type TextColor = (typeof TEXT_COLORS)[number];
type BandColor = (typeof BAND_COLORS)[number];

const HOLDER_HEX: Record<HolderColor, string> = {
  Schwarz: "#0d0d0d",
  Weiß: "#f5f5f5",
  Rot: "#c8261c",
  Dunkelgrau: "#2a2a2c",
};
const TEXT_HEX: Record<TextColor, string> = {
  Rot: "#e63946",
  Weiß: "#ffffff",
  Schwarz: "#0a0a0a",
};
const BAND_HEX: Record<BandColor, string> = {
  Rot: "#c8261c",
  Schwarz: "#111111",
  Weiß: "#f5f5f5",
};

const BASE_PRICE = 790; // cents
const BAND_PRICE = 100;
const PHONE_PRICE = 100;

function LandingPage() {
  // Configurator state
  const [withLogo, setWithLogo] = useState(false);
  const [withName, setWithName] = useState(true);
  const [name, setName] = useState("ALEX");
  const [withPhoneOnHolder, setWithPhoneOnHolder] = useState(false);
  const [phoneOnHolder, setPhoneOnHolder] = useState("");
  const [holderColor, setHolderColor] = useState<HolderColor>("Schwarz");
  const [textColor, setTextColor] = useState<TextColor>("Rot");
  const [withBand, setWithBand] = useState(true);
  const [bandColor, setBandColor] = useState<BandColor>("Rot");

  // Order form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [studio, setStudio] = useState("");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ whatsappUrl: string } | null>(null);

  const priceCents = useMemo(() => {
    let p = BASE_PRICE;
    if (withBand) p += BAND_PRICE;
    if (withPhoneOnHolder) p += PHONE_PRICE;
    return p;
  }, [withBand, withPhoneOnHolder]);

  const submit = useServerFn(submitOrder);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Bitte stimme den Datenschutzbestimmungen zu.");
      return;
    }
    if (!contactName || !contactPhone || !studio) {
      toast.error("Bitte fülle Name, Handynummer und Studio aus.");
      return;
    }
    setSubmitting(true);
    try {
      await submit({
        data: {
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail || "",
          studio,
          note,
          holder_color: holderColor,
          text_color: textColor,
          name_on_holder: withName,
          holder_name: withName ? name : "",
          phone_on_holder: withPhoneOnHolder,
          holder_phone: withPhoneOnHolder ? phoneOnHolder : "",
          with_logo: withLogo,
          with_band: withBand,
          band_color: withBand ? bandColor : "",
          price_cents: priceCents,
        },
      });

      const summary = [
        "*Neue Bestellung Kartenhalter*",
        `Name: ${contactName}`,
        `Studio: ${studio}`,
        `Halter: ${holderColor}, Text: ${textColor}`,
        withName ? `Name auf Halter: ${name}` : "Ohne Name",
        withPhoneOnHolder ? `Tel auf Halter: ${phoneOnHolder}` : null,
        withLogo ? "Mit Studio-Logo (falls freigegeben)" : null,
        withBand ? `Band: ${bandColor}` : "Ohne Band",
        `Preis: ${formatPrice(priceCents)}`,
      ]
        .filter(Boolean)
        .join("\n");
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
      setSubmitted({ whatsappUrl });
      toast.success("Bestellung gesendet! Wir melden uns kurz.");
    } catch (err) {
      console.error(err);
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  const scrollToConfig = () =>
    document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });

  const whatsappFrage = `https://wa.me/?text=${encodeURIComponent(
    "Hi! Ich habe eine Frage zum personalisierten Kartenhalter.",
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
              <CreditCard className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">GymTag</span>
          </div>
          <Button
            onClick={scrollToConfig}
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Personalisieren
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-border/60"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Testaktion · Lokal gefertigt
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Nie wieder
              <br />
              <span className="text-brand">Kartenchaos.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Personalisierter Kartenhalter für deine Gym-Karte – mit Name,
              optional mit Telefonnummer und Band für die Flasche.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={scrollToConfig}
                className="h-12 bg-brand text-base font-semibold text-brand-foreground hover:bg-brand/90"
              >
                Jetzt personalisieren
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 border-border bg-surface text-base font-semibold hover:bg-accent"
              >
                <a href={whatsappFrage} target="_blank" rel="noreferrer">
                  <Phone className="mr-2 h-4 w-4" /> Per WhatsApp fragen
                </a>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {["3D-gedruckt", "Individuell", "Abholung im Studio"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="overflow-hidden rounded-2xl border border-border/80"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <img
                src={heroImage}
                alt="3D-gedruckter Kartenhalter mit rotem Band"
                width={1280}
                height={1280}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-full opacity-60 blur-3xl"
              style={{ background: "radial-gradient(circle, oklch(0.62 0.24 25 / 0.4), transparent 70%)" }}
            />
          </div>
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section id="konfigurator" className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">
              Live-Konfigurator
            </p>
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Deine Karte. Dein Name. Dein Style.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
            {/* PREVIEW */}
            <div className="md:sticky md:top-24 md:self-start">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <HolderPreview
                  holderColor={holderColor}
                  textColor={textColor}
                  withName={withName}
                  name={name}
                  withPhone={withPhoneOnHolder}
                  phone={phoneOnHolder}
                  withLogo={withLogo}
                  withBand={withBand}
                  bandColor={bandColor}
                />
                <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Aktueller Preis</span>
                  <span className="font-display text-3xl font-bold text-brand">
                    {formatPrice(priceCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* OPTIONS + FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <ConfigCard title="Look">
                <ColorRow
                  label="Farbe Halter"
                  options={HOLDER_COLORS}
                  value={holderColor}
                  onChange={setHolderColor}
                  hexMap={HOLDER_HEX}
                />
                <ColorRow
                  label="Farbe Text"
                  options={TEXT_COLORS}
                  value={textColor}
                  onChange={setTextColor}
                  hexMap={TEXT_HEX}
                />
              </ConfigCard>

              <ConfigCard title="Personalisierung">
                <ToggleRow
                  label="Studio-Logo auf dem Halter"
                  hint="Nur verfügbar, wenn die Nutzung des Studio-Logos freigegeben ist."
                  checked={withLogo}
                  onChange={setWithLogo}
                />
                <ToggleRow
                  label="Name auf dem Halter"
                  checked={withName}
                  onChange={setWithName}
                />
                {withName && (
                  <Input
                    placeholder="z. B. ALEX"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 14))}
                    maxLength={14}
                    className="bg-background"
                  />
                )}
                <ToggleRow
                  label="Telefonnummer auf dem Halter"
                  hint="+1 € · Bei Verlust direkt erreichbar"
                  checked={withPhoneOnHolder}
                  onChange={setWithPhoneOnHolder}
                />
                {withPhoneOnHolder && (
                  <Input
                    placeholder="z. B. 0170 1234567"
                    value={phoneOnHolder}
                    onChange={(e) => setPhoneOnHolder(e.target.value.slice(0, 25))}
                    className="bg-background"
                  />
                )}
              </ConfigCard>

              <ConfigCard title="Band für die Flasche">
                <ToggleRow
                  label="Band hinzufügen"
                  hint="+1 € · Hängt deine Karte an die Trinkflasche"
                  checked={withBand}
                  onChange={setWithBand}
                />
                {withBand && (
                  <ColorRow
                    label="Bandfarbe"
                    options={BAND_COLORS}
                    value={bandColor}
                    onChange={setBandColor}
                    hexMap={BAND_HEX}
                  />
                )}
              </ConfigCard>

              <ConfigCard title="Deine Daten">
                <div className="grid gap-4">
                  <Field label="Dein Name *">
                    <Input
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      maxLength={100}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Handynummer / WhatsApp *">
                    <Input
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      maxLength={40}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="E-Mail (optional)">
                    <Input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      maxLength={200}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Studio / Abholort *">
                    <Input
                      required
                      placeholder="z. B. FitX Musterstraße"
                      value={studio}
                      onChange={(e) => setStudio(e.target.value)}
                      maxLength={120}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Anmerkung (optional)">
                    <Textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={1000}
                      className="bg-background"
                    />
                  </Field>
                  <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      Ich stimme der Verarbeitung meiner Daten zur Bearbeitung
                      meiner Bestellung zu (Datenschutz).
                    </span>
                  </label>
                </div>
              </ConfigCard>

              {submitted ? (
                <div className="rounded-2xl border border-brand/40 bg-brand/10 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-brand" />
                  <h3 className="font-display text-2xl font-bold">Bestellung erhalten!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Wir melden uns kurz per WhatsApp und sagen dir Bescheid,
                    sobald dein Halter zur Abholung bereit ist.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-5 bg-brand text-brand-foreground hover:bg-brand/90"
                  >
                    <a href={submitted.whatsappUrl} target="_blank" rel="noreferrer">
                      <Phone className="mr-2 h-4 w-4" /> Zusammenfassung per WhatsApp senden
                    </a>
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-14 w-full bg-brand text-base font-bold text-brand-foreground hover:bg-brand/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Wird gesendet…
                    </>
                  ) : (
                    <>Bestellung absenden · {formatPrice(priceCents)}</>
                  )}
                </Button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-border/60 bg-surface/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-display text-4xl font-bold md:text-5xl">
            Warum GymTag?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CreditCard, title: "Nie wieder lose Karte", text: "Schluss mit Suchen am Empfang. Karte sitzt fest." },
              { icon: Sparkles, title: "Direkt wiedererkennbar", text: "Dein Name, deine Farbe – sofort dein Halter." },
              { icon: ShieldCheck, title: "Mit Telefonnummer bei Verlust", text: "Optional eingraviert. Wer ihn findet, erreicht dich sofort." },
              { icon: Package, title: "Band für die Flasche", text: "Hängt deine Karte direkt an die Trinkflasche." },
              { icon: Zap, title: "Schnell im Studio abholbar", text: "Wenige Tage Fertigung. Abholung direkt im Studio." },
              { icon: MapPin, title: "Lokal gefertigt", text: "Hier 3D-gedruckt – individuell für dich produziert." },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand/40"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-brand/15 text-brand">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-display text-4xl font-bold md:text-5xl">
            So funktioniert's
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { n: "01", title: "Konfigurieren", text: "Farbe, Name, Band – in 60 Sekunden zusammengestellt." },
              { n: "02", title: "Bestellung absenden", text: "Wir melden uns per WhatsApp mit allen Details." },
              { n: "03", title: "Im Studio abholen", text: "Sobald fertig, holst du den Halter direkt im Studio ab." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-surface p-7">
                <div className="font-display text-5xl font-bold text-brand">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        className="border-b border-border/60 py-16 md:py-24"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-foreground">
            Testaktion
          </span>
          <h2 className="mt-5 font-display text-5xl font-bold md:text-6xl">
            Ab <span className="text-brand">7,90 €</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Basis-Halter mit Name in deiner Wunschfarbe. Erweiterbar – ganz nach dir.
          </p>
          <div className="mx-auto mt-8 max-w-md space-y-2 rounded-xl border border-border bg-surface p-6 text-left text-sm">
            <PriceRow label="Basis-Halter (personalisiert)" value="7,90 €" />
            <PriceRow label="Band für die Flasche" value="+1,00 €" />
            <PriceRow label="Telefonnummer auf Halter" value="+1,00 €" />
            <PriceRow label="Weitere Extras auf Anfrage" value="—" muted />
          </div>
          <Button
            onClick={scrollToConfig}
            size="lg"
            className="mt-8 h-12 bg-brand px-8 text-base font-semibold text-brand-foreground hover:bg-brand/90"
          >
            Jetzt deinen konfigurieren
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center font-display text-4xl font-bold md:text-5xl">
            Häufige Fragen
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "Wie lange dauert die Fertigung?",
                a: "In der Regel 2–4 Werktage. Wir melden uns per WhatsApp, sobald dein Halter zur Abholung bereit ist.",
              },
              {
                q: "Wie läuft die Abholung?",
                a: "Du holst deinen Halter direkt im Studio an der Theke ab – einfach Bescheid sagen, dass du einen GymTag bestellt hast.",
              },
              {
                q: "Ist das Studio-Logo möglich?",
                a: "Nur wenn dein Studio die Nutzung des Logos freigegeben hat. Frag im Zweifel kurz nach – wir klären das gerne.",
              },
              {
                q: "Muss ich direkt bezahlen?",
                a: "Nein. Du bezahlst entspannt bei der Abholung im Studio. Vorab brauchst du nichts zu überweisen.",
              },
              {
                q: "Kann ich auch ohne Telefonnummer bestellen?",
                a: "Klar. Die Telefonnummer auf dem Halter ist komplett optional – nur eine zusätzliche Sicherheit bei Verlust.",
              },
            ].map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-surface px-5"
              >
                <AccordionTrigger className="py-5 text-left font-semibold hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-brand text-brand-foreground">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <span className="font-display font-bold text-foreground">GymTag</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href={whatsappFrage} target="_blank" rel="noreferrer" className="hover:text-foreground">
              WhatsApp Kontakt
            </a>
            <a href="#" className="hover:text-foreground">Impressum</a>
            <a href="#" className="hover:text-foreground">Datenschutz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- helpers ---------- */

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function ConfigCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 font-display text-base font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="mt-0.5 shrink-0" />
    </div>
  );
}

function ColorRow<T extends string>({
  label,
  options,
  value,
  onChange,
  hexMap,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  hexMap: Record<T, string>;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "border-brand bg-brand/15 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-brand/40"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: hexMap[o] }}
              />
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PriceRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-semibold ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

/* ---------- live preview ---------- */

function HolderPreview({
  holderColor,
  textColor,
  withName,
  name,
  withPhone,
  phone,
  withLogo,
  withBand,
  bandColor,
}: {
  holderColor: HolderColor;
  textColor: TextColor;
  withName: boolean;
  name: string;
  withPhone: boolean;
  phone: string;
  withLogo: boolean;
  withBand: boolean;
  bandColor: BandColor;
}) {
  const holderHex = HOLDER_HEX[holderColor];
  const textHex = TEXT_HEX[textColor];
  const bandHex = BAND_HEX[bandColor];
  const isLightHolder = holderColor === "Weiß";

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg viewBox="0 0 320 200" className="w-full" aria-label="Vorschau Kartenhalter">
        <defs>
          <linearGradient id="holderShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* band */}
        {withBand && (
          <>
            <path
              d="M 260 30 Q 305 50 290 100 Q 275 150 250 130"
              stroke={bandHex}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="252" cy="42" r="6" fill="#888" />
          </>
        )}

        {/* card body */}
        <rect
          x="20"
          y="25"
          width="240"
          height="150"
          rx="14"
          fill={holderHex}
          stroke={isLightHolder ? "#cccccc" : "#000000"}
          strokeWidth="1"
        />
        <rect x="20" y="25" width="240" height="150" rx="14" fill="url(#holderShade)" />

        {/* slot for card */}
        <rect
          x="34"
          y="115"
          width="212"
          height="45"
          rx="6"
          fill="none"
          stroke={isLightHolder ? "#999" : "#ffffff22"}
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* logo placeholder */}
        {withLogo && (
          <g transform="translate(36, 38)">
            <circle cx="14" cy="14" r="14" fill={textHex} opacity="0.18" />
            <path
              d="M 4 14 L 10 14 M 10 8 L 10 20 M 18 8 L 18 20 M 18 14 L 24 14"
              stroke={textHex}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* name */}
        {withName && (
          <text
            x={withLogo ? 80 : 36}
            y="62"
            fill={textHex}
            fontFamily="Space Grotesk, sans-serif"
            fontSize="26"
            fontWeight="700"
            letterSpacing="1"
          >
            {(name || "DEIN NAME").slice(0, 14)}
          </text>
        )}

        {/* phone */}
        {withPhone && (
          <text
            x="36"
            y="96"
            fill={textHex}
            opacity="0.85"
            fontFamily="Inter, sans-serif"
            fontSize="13"
            fontWeight="500"
          >
            ☎ {phone || "Deine Nummer"}
          </text>
        )}

        {!withName && !withPhone && !withLogo && (
          <text
            x="160"
            y="78"
            textAnchor="middle"
            fill={textHex}
            opacity="0.5"
            fontFamily="Inter, sans-serif"
            fontSize="12"
          >
            Aktiviere eine Option für die Vorschau
          </text>
        )}
      </svg>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ChevronDown className="h-3 w-3" />
        Live-Vorschau · aktualisiert sich automatisch
      </div>
    </div>
  );
}
