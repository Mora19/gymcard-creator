import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  CreditCard,
  Phone,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Package,
  Loader2,
  Tag,
  Link2,
  Clock,
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
      { title: "Nie wieder Kartenchaos – personalisierter Gym-Kartenhalter" },
      {
        name: "description",
        content:
          "3D-gedruckter Kartenhalter für deine Gym-Karte. Mit Name, optional Telefonnummer und Band für die Flasche. Lokal gefertigt, im Studio abholbar.",
      },
      { property: "og:title", content: "Nie wieder Kartenchaos – dein Gym-Kartenhalter" },
      {
        property: "og:description",
        content:
          "Personalisierter Kartenhalter mit Name, Telefonnummer und Band. Jetzt in 60 Sekunden konfigurieren.",
      },
    ],
  }),
  component: LandingPage,
});

const WHATSAPP_NUMBER = "4917642697714"; // 0176 42697714

const HOLDER_COLORS = ["Schwarz", "Weiß", "Rot", "Dunkelgrau"] as const;
const TEXT_COLORS = ["Rot", "Weiß", "Schwarz"] as const;
const BAND_COLORS = ["Rot", "Schwarz", "Weiß"] as const;

type HolderColor = (typeof HOLDER_COLORS)[number];
type TextColor = (typeof TEXT_COLORS)[number];
type BandColor = (typeof BAND_COLORS)[number];

const HOLDER_HEX: Record<HolderColor, string> = {
  Schwarz: "#0d0d0d",
  Weiß: "#f1f1f1",
  Rot: "#b81e16",
  Dunkelgrau: "#26262a",
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
  const [name, setName] = useState("MORITZ");
  const [withPhoneOnHolder, setWithPhoneOnHolder] = useState(true);
  const [phoneOnHolder, setPhoneOnHolder] = useState("0176 42697714");
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
      toast.error("Bitte fülle Name, WhatsApp-Nummer und Studio aus.");
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
        `WhatsApp: ${contactPhone}`,
        `Studio: ${studio}`,
        `Halter: ${holderColor}, Text: ${textColor}`,
        withName ? `Name auf Halter: ${name}` : "Ohne Name",
        withPhoneOnHolder ? `Tel auf Halter: ${phoneOnHolder}` : null,
        withLogo ? "Mit Studio-Logo (sofern freigegeben)" : null,
        withBand ? `Band: ${bandColor}` : "Ohne Band",
        `Preis: ${formatPrice(priceCents)}`,
        note ? `Notiz: ${note}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(summary)}`;
      setSubmitted({ whatsappUrl });
      toast.success("Bestellung gesendet! Wir melden uns kurz per WhatsApp.");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  const scrollToConfig = () =>
    document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });

  const whatsappFrage = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi! Ich habe eine Frage zum personalisierten Kartenhalter.",
  )}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
              <Tag className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">GymTag</span>
          </div>
          <Button
            onClick={scrollToConfig}
            size="sm"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Jetzt bestellen
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden border-b border-border/60"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        {/* red diagonal accent like flyer */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 hidden h-48 w-2/3 md:block"
          style={{
            background:
              "linear-gradient(115deg, transparent 55%, #e63946 55%, #e63946 60%, transparent 60%, transparent 65%, #e63946 65%, #e63946 68%, transparent 68%)",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 md:grid-cols-[1.05fr_1fr] md:items-center md:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-sm bg-brand px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Testaktion · Lokal gefertigt
            </div>
            <h1 className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
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
                className="h-12 bg-brand text-base font-bold uppercase tracking-wide text-brand-foreground hover:bg-brand/90"
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
              className="overflow-hidden rounded-2xl border border-border/80 bg-white"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <img
                src={heroImage}
                alt="Schwarzer 3D-gedruckter Gym-Kartenhalter mit roter erhabener Schrift, daneben offener Halter mit eingesteckter roter Mitgliedskarte"
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

      {/* BENEFIT STRIP */}
      <section className="border-b border-border/60 bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-2 md:grid-cols-5">
          {[
            { icon: CreditCard, t: "Nie wieder lose Karte" },
            { icon: Tag, t: "Direkt erkennbar, wem sie gehört" },
            { icon: Phone, t: "Optional Telefon bei Verlust" },
            { icon: Link2, t: "Wieder an die Flasche" },
            { icon: MapPin, t: "Lokal gefertigt · Abholung im Studio" },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/15 text-brand">
                <b.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium leading-tight">{b.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section id="konfigurator" className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
              Live-Konfigurator
            </p>
            <h2 className="font-display text-4xl font-black uppercase md:text-5xl">
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
                  <span className="font-display text-3xl font-black text-brand">
                    {formatPrice(priceCents)}
                  </span>
                </div>
              </div>
            </div>

            {/* OPTIONS + FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <ConfigCard title="A · Text auf dem Halter">
                <ToggleRow
                  label="Name auf dem Halter"
                  hint="Erscheint groß oben – damit jeder sieht, wem die Karte gehört."
                  checked={withName}
                  onChange={setWithName}
                />
                {withName && (
                  <Input
                    placeholder="z. B. MORITZ"
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 14))}
                    maxLength={14}
                    className="bg-background"
                  />
                )}
                <ToggleRow
                  label="Telefonnummer auf dem Halter"
                  hint="+1 € · Damit deine Karte bei Verlust leichter zurückkommt."
                  checked={withPhoneOnHolder}
                  onChange={setWithPhoneOnHolder}
                />
                {withPhoneOnHolder && (
                  <Input
                    placeholder="z. B. 0176 42697714"
                    value={phoneOnHolder}
                    onChange={(e) => setPhoneOnHolder(e.target.value.slice(0, 25))}
                    className="bg-background"
                  />
                )}
                <ToggleRow
                  label="Studio-Logo"
                  hint="Studio-Logo nur mit offizieller Freigabe möglich. Vorschau zeigt neutrales „GYM“."
                  checked={withLogo}
                  onChange={setWithLogo}
                />
              </ConfigCard>

              <ConfigCard title="Look">
                <ColorRow
                  label="Halterfarbe"
                  options={HOLDER_COLORS}
                  value={holderColor}
                  onChange={setHolderColor}
                  hexMap={HOLDER_HEX}
                />
                <ColorRow
                  label="Textfarbe"
                  options={TEXT_COLORS}
                  value={textColor}
                  onChange={setTextColor}
                  hexMap={TEXT_HEX}
                />
              </ConfigCard>

              <ConfigCard title="Band für die Flasche">
                <ToggleRow
                  label="Band hinzufügen"
                  hint="+1 € · Hängt deine Karte direkt an die Trinkflasche."
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

              <ConfigCard title="B · Kontaktdaten für die Bestellung">
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
                  <Field label="WhatsApp / Telefonnummer *">
                    <Input
                      required
                      type="tel"
                      placeholder="z. B. 0170 1234567"
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
                      placeholder="z. B. Fitness First Musterstraße"
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
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-brand" />
                  <h3 className="font-display text-2xl font-black uppercase">
                    Bestellung erhalten!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Wir melden uns kurz per WhatsApp und geben dir Bescheid,
                    sobald dein Halter zur Abholung im Studio bereit ist
                    (in der Regel innerhalb einer Woche).
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
                  <p className="mt-3 text-xs text-muted-foreground">
                    Geht direkt an 0176 42697714
                  </p>
                </div>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="h-14 w-full bg-brand text-base font-black uppercase tracking-wide text-brand-foreground hover:bg-brand/90"
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

      {/* HOW IT WORKS */}
      <section className="border-b border-border/60 bg-surface/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
              In 3 Schritten
            </p>
            <h2 className="font-display text-4xl font-black uppercase md:text-5xl">
              So funktioniert's
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { n: "01", icon: Sparkles, title: "Konfigurieren", text: "Farbe, Name, Telefonnummer und Band – in 60 Sekunden zusammengestellt." },
              { n: "02", icon: Phone, title: "Bestellung absenden", text: "Wir melden uns per WhatsApp und bestätigen dir alle Details." },
              { n: "03", icon: Clock, title: "Innerhalb 1 Woche abholen", text: "Sobald fertig, holst du den Halter direkt im Studio an der Theke ab." },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border border-border bg-surface p-7">
                <div className="absolute -top-3 left-6 rounded-sm bg-brand px-2 py-1 text-xs font-black uppercase tracking-wider text-brand-foreground">
                  Schritt {s.n}
                </div>
                <div className="mt-2 grid h-10 w-10 place-items-center rounded-md bg-brand/15 text-brand">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-black uppercase">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS DETAIL */}
      <section className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-display text-4xl font-black uppercase md:text-5xl">
            Warum GymTag?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CreditCard, title: "Nie wieder lose Karte", text: "Schluss mit Suchen am Empfang. Karte sitzt fest im Halter." },
              { icon: Tag, title: "Sofort dein Halter", text: "Dein Name groß und rot. Direkt erkennbar, wem die Karte gehört." },
              { icon: ShieldCheck, title: "Telefonnummer bei Verlust", text: "Optional auf den Halter gedruckt – damit deine Karte schnell zurückfindet." },
              { icon: Package, title: "Band für die Flasche", text: "Mit Band hängt der Halter direkt an deiner Trinkflasche – nie wieder vergessen." },
              { icon: Clock, title: "In 1 Woche im Studio", text: "Wenige Tage Fertigung. Abholung direkt an der Theke deines Studios." },
              { icon: MapPin, title: "Lokal gefertigt", text: "Hier 3D-gedruckt – individuell für dich produziert, nichts von der Stange." },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand/40"
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-brand/15 text-brand">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-black uppercase">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
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
          <span className="inline-block rounded-sm bg-brand px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-brand-foreground">
            Testaktion
          </span>
          <h2 className="mt-5 font-display text-5xl font-black uppercase md:text-6xl">
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
            className="mt-8 h-12 bg-brand px-8 text-base font-black uppercase tracking-wide text-brand-foreground hover:bg-brand/90"
          >
            Jetzt deinen konfigurieren
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border/60 py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center font-display text-4xl font-black uppercase md:text-5xl">
            Häufige Fragen
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "Wie lange dauert die Fertigung?",
                a: "In der Regel innerhalb 1 Woche. Wir melden uns per WhatsApp, sobald dein Halter zur Abholung bereit ist.",
              },
              {
                q: "Wie läuft die Abholung?",
                a: "Du holst deinen Halter direkt im Studio an der Theke ab – einfach Bescheid sagen, dass du einen GymTag bestellt hast.",
              },
              {
                q: "Ist das Studio-Logo möglich?",
                a: "Nur wenn dein Studio die Nutzung des Logos offiziell freigegeben hat. Ohne Freigabe drucken wir es nicht.",
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

      {/* WHATSAPP CTA BAR */}
      <section className="bg-foreground py-8 text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">WhatsApp</div>
              <div className="font-display text-xl font-black">0176 42697714</div>
            </div>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <a href={whatsappFrage} target="_blank" rel="noreferrer">
              Direkt fragen
            </a>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-brand text-brand-foreground">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <span className="font-display font-black uppercase text-foreground">GymTag</span>
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
      <h3 className="mb-4 font-display text-sm font-black uppercase tracking-[0.18em] text-muted-foreground">
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
        <div className="text-sm font-semibold">{label}</div>
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
      <div className="mb-2 text-sm font-semibold">{label}</div>
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

/* ---------- live preview (looks like the real 3D-printed holder) ---------- */

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

  // Build subtle 3D-print line texture
  const textureLines = Array.from({ length: 40 }, (_, i) => 30 + i * 7);

  const displayName = (name || "DEIN NAME").slice(0, 14);
  const displayPhone = phone || "0170 1234567";

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 280"
        className="w-full drop-shadow-2xl"
        aria-label="Vorschau Kartenhalter"
      >
        <defs>
          <linearGradient id="holderShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="textShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
          <filter id="raised" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <clipPath id="cardClip">
            <rect x="55" y="35" width="280" height="210" rx="18" />
          </clipPath>
        </defs>

        {/* Band */}
        {withBand && (
          <g>
            <path
              d="M 40 60 Q 10 35 28 18 Q 48 4 60 28"
              stroke={bandHex}
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M 40 60 Q 10 35 28 18 Q 48 4 60 28"
              stroke="#000000"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              opacity="0.15"
            />
          </g>
        )}

        {/* Card body */}
        <rect
          x="55"
          y="35"
          width="280"
          height="210"
          rx="18"
          fill={holderHex}
          stroke={isLightHolder ? "#bdbdbd" : "#000000"}
          strokeWidth="1.2"
        />

        {/* 3D print line texture inside the body */}
        <g clipPath="url(#cardClip)" opacity={isLightHolder ? 0.08 : 0.18}>
          {textureLines.map((y) => (
            <line
              key={y}
              x1="55"
              x2="335"
              y1={y}
              y2={y}
              stroke={isLightHolder ? "#000000" : "#ffffff"}
              strokeWidth="0.6"
            />
          ))}
        </g>

        {/* Shading overlay */}
        <rect x="55" y="35" width="280" height="210" rx="18" fill="url(#holderShade)" />

        {/* Eyelet ear on the left */}
        <g>
          <path
            d="M 55 110 Q 35 110 30 125 Q 28 140 30 155 Q 35 170 55 170 Z"
            fill={holderHex}
            stroke={isLightHolder ? "#bdbdbd" : "#000000"}
            strokeWidth="1.2"
          />
          <circle
            cx="42"
            cy="140"
            r="8"
            fill="#000000"
            opacity="0.55"
          />
          <circle cx="42" cy="140" r="5.5" fill="#1a1a1a" />
        </g>

        {/* Card slot (subtle inner outline like the real opened holder) */}
        <rect
          x="70"
          y="55"
          width="250"
          height="170"
          rx="10"
          fill="none"
          stroke={isLightHolder ? "#999" : "#ffffff"}
          strokeOpacity={isLightHolder ? 0.4 : 0.08}
          strokeWidth="1"
        />

        {/* Logo (neutral GYM symbol) */}
        {withLogo && (
          <g transform="translate(78, 78)">
            <rect
              x="0"
              y="0"
              width="58"
              height="28"
              rx="6"
              fill={textHex}
              opacity="0.16"
            />
            <text
              x="29"
              y="20"
              textAnchor="middle"
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontWeight="900"
              fontSize="16"
              letterSpacing="2"
            >
              GYM
            </text>
          </g>
        )}

        {/* NAME — large, raised, top */}
        {withName && (
          <g filter="url(#raised)">
            <text
              x="195"
              y={withLogo ? 122 : 130}
              textAnchor="middle"
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontSize={displayName.length > 9 ? 32 : 40}
              fontWeight="900"
              letterSpacing="1.5"
            >
              {displayName}
            </text>
            {/* highlight stroke for raised look */}
            <text
              x="195"
              y={withLogo ? 122 : 130}
              textAnchor="middle"
              fill="url(#textShade)"
              fontFamily="Space Grotesk, sans-serif"
              fontSize={displayName.length > 9 ? 32 : 40}
              fontWeight="900"
              letterSpacing="1.5"
              opacity="0.5"
            >
              {displayName}
            </text>
          </g>
        )}

        {/* PHONE — bottom */}
        {withPhone && (
          <g filter="url(#raised)">
            <text
              x="195"
              y={withName ? 195 : 150}
              textAnchor="middle"
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontSize="22"
              fontWeight="800"
              letterSpacing="1"
            >
              {displayPhone}
            </text>
          </g>
        )}

        {!withName && !withPhone && !withLogo && (
          <text
            x="195"
            y="145"
            textAnchor="middle"
            fill={textHex}
            opacity="0.5"
            fontFamily="Inter, sans-serif"
            fontSize="13"
          >
            Aktiviere eine Option für die Vorschau
          </text>
        )}
      </svg>

      <div className="mt-3 text-center text-xs text-muted-foreground">
        Live-Vorschau · echte 3D-Druck-Optik
      </div>
    </div>
  );
}
