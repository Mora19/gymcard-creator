import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
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
import productFront from "@/assets/gymtag-front-transparent.png";
import productOpen from "@/assets/gymtag-open-transparent.png";
import recardnizePrintLogo from "@/assets/brand/recardnize-logo.svg";
import { submitOrder } from "@/lib/orders.functions";
import {
  BAND_SURCHARGE_CENTS,
  BASE_PRICE_CENTS,
  STUDIO_LOGO_SURCHARGE_CENTS,
  getUnitPriceCents,
} from "@/lib/orderPricing";
import { CONTACT_EMAIL, getWhatsAppWebUrl } from "@/lib/contact";
import { CopyTextButton } from "@/components/CopyTextButton";
import { StudioSection } from "@/components/StudioSection";
import { WhatsAppContact } from "@/components/WhatsAppContact";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "recardnize – personalisierter Kartenhalter fürs Gym" },
      {
        name: "description",
        content:
          "3D-gedruckter Kartenhalter für deine Gym-Karte ab 4,99 €. Mit Name, optional Telefonnummer und Band für die Flasche. Lokal gefertigt.",
      },
      { property: "og:title", content: "recardnize – deine Karte. Wiedererkennbar." },
      {
        property: "og:description",
        content:
          "Personalisierter 3D-Kartenhalter mit Name, optionaler Telefonnummer und Band. Lokal gefertigt ab 4,99 €.",
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

const RECARDNIZE_EXCLUDED_HOLDER_COLORS: readonly HolderColor[] = ["Weiß", "Rot"];

const HOLDER_LOGOS = [
  { value: "none", label: "Ohne Logo" },
  { value: "studio", label: "Studio-Logo" },
  { value: "recardnize", label: "recardnize" },
] as const;

type HolderLogo = (typeof HOLDER_LOGOS)[number]["value"];

function LandingPage() {
  // Configurator state
  const [holderLogo, setHolderLogo] = useState<HolderLogo>("none");
  const [logoChoiceReady, setLogoChoiceReady] = useState(false);
  const [withName, setWithName] = useState(true);
  const [name, setName] = useState("");
  const [withPhoneOnHolder, setWithPhoneOnHolder] = useState(false);
  const [phoneOnHolder, setPhoneOnHolder] = useState("");
  const [holderColor, setHolderColor] = useState<HolderColor>("Schwarz");
  const [textColor, setTextColor] = useState<TextColor>("Rot");
  const [withBand, setWithBand] = useState(false);
  const [bandColor, setBandColor] = useState<BandColor>("Rot");

  // Order form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    summary: string;
    orderNumber?: string | null;
    details: { label: string; value: string; bold?: boolean }[];
  } | null>(null);
  const submitLock = useRef(false);

  useEffect(() => {
    setLogoChoiceReady(true);
  }, []);

  const unitPriceCents = getUnitPriceCents({ withBand, withStudioLogo: holderLogo === "studio" });
  const priceCents = unitPriceCents * quantity;

  function handleLogoChange(logo: HolderLogo) {
    setHolderLogo(logo);
    if (logo === "recardnize" && RECARDNIZE_EXCLUDED_HOLDER_COLORS.includes(holderColor)) {
      setHolderColor("Schwarz");
    }
    if (logo === "recardnize" && textColor === "Schwarz") {
      setTextColor("Rot");
    }
  }

  // Prevent identical holder + text color (no contrast)
  const conflictsWithHolder = (t: TextColor) => t === (holderColor as string);
  useEffect(() => {
    if (conflictsWithHolder(textColor)) {
      const fallback = TEXT_COLORS.find((c) => !conflictsWithHolder(c));
      if (fallback) setTextColor(fallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holderColor]);


  const submit = useServerFn(submitOrder);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error("Bitte stimme den Datenschutzbestimmungen zu.");
      return;
    }
    if (!contactName || !contactPhone || !pickupLocation) {
      toast.error("Bitte fülle Name, WhatsApp-Nummer und Wunschort für die Übergabe aus.");
      return;
    }
    if ((withName && !name.trim()) || (withPhoneOnHolder && !phoneOnHolder.trim())) {
      toast.error("Bitte gib den gewählten Aufdruck ein oder schalte die Option aus.");
      return;
    }
    if (submitLock.current || submitted) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail || "",
          pickup_location: pickupLocation,
          note,
          holder_color: holderColor,
          text_color: textColor,
          name_on_holder: withName,
          holder_name: withName ? name : "",
          phone_on_holder: withPhoneOnHolder,
          holder_phone: withPhoneOnHolder ? phoneOnHolder : "",
          with_logo: holderLogo === "studio",
          with_recardnize_logo: holderLogo === "recardnize",
          with_band: withBand,
          band_color: withBand ? bandColor : "",
          quantity,
          price_cents: unitPriceCents,
        },
      });

      const summary = [
        "*Neue Bestellung Kartenhalter*",
        res?.order_number ? `Bestell-Nr: ${res.order_number}` : null,
        `Name: ${contactName}`,
        `WhatsApp: ${contactPhone}`,
        `Abholort: ${pickupLocation}`,
        `Stückzahl: ${quantity}`,
        `Halter: ${holderColor}, Text: ${textColor}`,
        withName ? `Name auf Halter: ${name}` : "Ohne Name",
        withPhoneOnHolder ? `Tel auf Halter: ${phoneOnHolder}` : null,
        holderLogo === "studio" ? "Mit Studio-Logo (sofern freigegeben)" : null,
        holderLogo === "recardnize" ? "Mit recardnize-Logo" : null,
        withBand ? `Band: ${bandColor}` : "Ohne Band",
        `Gesamtpreis: ${formatPrice(priceCents)}`,
        note ? `Notiz: ${note}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      setSubmitted({
        summary,
        orderNumber: res?.order_number ?? null,
        details: [
          { label: "Kunde", value: contactName.trim() },
          ...(withName ? [{ label: "Name auf Halter", value: name.trim() }] : []),
          ...(withPhoneOnHolder ? [{ label: "Tel auf Halter", value: phoneOnHolder.trim() }] : []),
          { label: "Halterfarbe", value: holderColor },
          { label: "Textfarbe", value: textColor },
          { label: "Logo", value: HOLDER_LOGOS.find(({ value }) => value === holderLogo)?.label ?? "Ohne Logo" },
          { label: "Band", value: withBand ? `ja · ${bandColor}` : "nein" },
          { label: "Stückzahl", value: String(quantity) },
          { label: "Gesamtpreis", value: formatPrice(priceCents), bold: true },
        ],
      });
      toast.success("Bestellung gespeichert! Wir melden uns per WhatsApp.");
      setTimeout(() => {
        document
          .getElementById("bestellbestaetigung")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } catch (err) {
      console.error(err);
      submitLock.current = false;
      toast.error("Etwas ist schiefgelaufen. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  const scrollToConfig = () =>
    document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });

  const question = "Hi! Ich habe eine Frage zum personalisierten Kartenhalter.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <BrandLogo className="w-[136px] sm:w-[170px]" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="#fuer-studios" className="mr-2 hidden text-sm text-muted-foreground hover:text-foreground md:inline">Für Studios</a>
            <WhatsAppContact message={question}>
              <Button type="button" size="sm" variant="outline" className="h-9 px-2 sm:px-3" aria-label="Frage per WhatsApp stellen">
                <Phone className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Frage stellen</span>
              </Button>
            </WhatsAppContact>
            <Button
              onClick={scrollToConfig}
              size="sm"
              aria-label="Jetzt bestellen"
              className="h-9 bg-brand px-2 text-brand-foreground hover:bg-brand/90 sm:px-3"
            >
              <span className="sm:hidden">Bestellen</span>
              <span className="hidden sm:inline">Jetzt bestellen</span>
            </Button>
          </div>
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
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pb-14 pt-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-center md:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-sm bg-brand px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Testaktion · Lokal gefertigt
            </div>
            <h1 className="font-display text-[clamp(2.5rem,11vw,3rem)] font-black uppercase leading-[0.95] tracking-tight md:text-[clamp(3rem,6vw,4.5rem)]">
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
              <WhatsAppContact message={question}>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 border-border bg-surface text-base font-semibold hover:bg-accent"
              >
                <Phone className="mr-2 h-4 w-4" /> Per WhatsApp fragen
              </Button>
              </WhatsAppContact>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {["3D-gedruckt", "Lokal gefertigt", "Übergabe nach Absprache"].map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
            <a
              href="#fuer-studios"
              className="mt-5 inline-block rounded-sm text-sm font-semibold text-foreground underline underline-offset-4 hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand md:hidden"
            >
              Für Studios und Kooperationen
            </a>
          </div>

          <div className="relative">
            <div
              className="relative overflow-hidden rounded-2xl border border-border/80 bg-[#0b0b0d] p-6 sm:p-8"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <img
                src={productFront}
                alt="Schwarzer 3D-gedruckter Kartenhalter mit roter Beispielbeschriftung „Max Mustermann“, Fitness First Logo und Beispieltelefonnummer"
                width={1672}
                height={940}
                className="mx-auto block w-full max-w-[420px] object-contain drop-shadow-[0_20px_40px_rgba(230,57,70,0.25)]"
              />
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-[#111114] p-3">
                <img
                  src={productOpen}
                  alt="Geöffneter Kartenhalter mit eingesteckter roter Mitgliedskarte"
                  width={1975}
                  height={796}
                  className="block h-20 w-28 shrink-0 rounded-md object-contain sm:h-24 sm:w-32"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand">
                    Karte rein · fertig
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Karte einfach von oben einschieben – sitzt fest, bleibt sichtbar.
                  </div>
                </div>
              </div>
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
            { icon: MapPin, t: "Lokal gefertigt · Übergabe nach Absprache" },
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
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
                  logo={holderLogo}
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
                    placeholder="z. B. Max Mustermann"
                    aria-label="Name für den Aufdruck"
                    required={!submitted}
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 22))}
                    maxLength={22}
                    className="bg-background"
                  />
                )}

                <ToggleRow
                  label="Telefonnummer auf dem Kartenhalter (optional)"
                  hint="Öffentlich sichtbar aufgedruckt – hilft, wenn die Karte verloren geht. Kein Muss: einfach ausschalten."
                  checked={withPhoneOnHolder}
                  onChange={setWithPhoneOnHolder}
                />
                {withPhoneOnHolder && (
                  <Input
                    placeholder="z. B. 0170 1234567"
                    aria-label="Telefonnummer für den Aufdruck"
                    type="tel"
                    required={!submitted}
                    value={phoneOnHolder}
                    onChange={(e) => setPhoneOnHolder(e.target.value.slice(0, 25))}
                    className="bg-background"
                  />
                )}
                <fieldset
                  disabled={!logoChoiceReady || submitting || !!submitted}
                  className="space-y-2 disabled:opacity-60"
                >
                  <legend className="mb-2 text-sm font-semibold">Logo auf dem Halter</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {HOLDER_LOGOS.map(({ value, label }) => (
                      <label key={value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="holder-logo"
                          value={value}
                          checked={holderLogo === value}
                          onChange={() => handleLogoChange(value)}
                          className="peer sr-only"
                        />
                        <span className="block rounded-md border border-border bg-background px-3 py-2 text-center text-sm peer-checked:border-brand peer-checked:bg-brand/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                          {label}
                          {value !== "none" && (
                            <span className="block text-xs text-muted-foreground">
                              {value === "studio"
                                ? `+${formatPrice(STUDIO_LOGO_SURCHARGE_CENTS)} / Stück`
                                : "Inklusive"}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Studio-Logos brauchen eine Freigabe. Das recardnize-Logo wird weiß und rot
                    gedruckt. Deine Textfarbe gilt für Name und Telefonnummer.
                  </p>
                </fieldset>
              </ConfigCard>

              <ConfigCard title="Look">
                <ColorRow
                  label="Halterfarbe"
                  options={HOLDER_COLORS}
                  value={holderColor}
                  onChange={setHolderColor}
                  hexMap={HOLDER_HEX}
                  disabledOptions={
                    holderLogo === "recardnize" ? RECARDNIZE_EXCLUDED_HOLDER_COLORS : undefined
                  }
                  disabledHint="Mit recardnize ist der Halter schwarz oder dunkelgrau, damit beide Logofarben sichtbar bleiben."
                />
                <ColorRow
                  label="Textfarbe"
                  options={TEXT_COLORS}
                  value={textColor}
                  onChange={setTextColor}
                  hexMap={TEXT_HEX}
                  disabledOptions={TEXT_COLORS.filter(
                    (color) => conflictsWithHolder(color) || (holderLogo === "recardnize" && color === "Schwarz"),
                  )}
                  disabledHint={
                    holderLogo === "recardnize"
                      ? "Für recardnize kannst du den Text in Rot oder Weiß drucken."
                      : "Gleiche Farbe wie der Halter – kein Kontrast."
                  }
                />

              </ConfigCard>

              <ConfigCard title="Band für die Flasche">
                <ToggleRow
                  label="Band hinzufügen"
                  hint={`+${formatPrice(BAND_SURCHARGE_CENTS)} · Hängt deine Karte direkt an die Trinkflasche.`}
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
                  <Field label="Kontaktnummer für deine Bestellung (WhatsApp) * – wird nicht gedruckt">
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
                  <Field label="Wunschort / Studio für die Übergabe *">
                    <Input
                      required
                      placeholder="z. B. Heilbronn, Bad Rappenau, Fitness First Musterstr."
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      maxLength={120}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Stückzahl *">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Weniger"
                      >
                        −
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                        }
                        className="w-20 bg-background text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                        aria-label="Mehr"
                      >
                        +
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(unitPriceCents)} / Stück
                      </span>
                    </div>
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
                  <p className="text-xs text-muted-foreground">
                    Deine Angaben werden nur zur Bearbeitung deiner Bestellung verwendet.
                  </p>
                  <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      Ich stimme der Verarbeitung meiner Daten zur Bearbeitung
                      meiner Bestellung zu (<Link to="/datenschutz" target="_blank" rel="noreferrer" className="underline">Datenschutz</Link>).
                    </span>
                  </label>
                </div>
              </ConfigCard>

              {submitted ? (
                <div id="bestellbestaetigung" className="scroll-mt-20 rounded-2xl border border-brand/40 bg-brand/10 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-brand" />
                  <h3 className="font-display text-2xl font-black uppercase">
                    Bestellung gespeichert!
                  </h3>
                  {submitted.orderNumber && (
                    <p className="mt-1 font-mono text-sm text-brand">Bestell-Nr. {submitted.orderNumber}</p>
                  )}
                  <div className="mx-auto mt-4 max-w-sm space-y-1 rounded-md border border-border bg-background/40 p-4 text-left text-sm">
                    {submitted.details.map(({label, value, bold}) => (
                      <SummaryRow key={label} k={label} v={value} bold={bold} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Deine Bestellung ist bereits bei uns gespeichert – du musst nichts weiter tun. Wir melden uns per WhatsApp mit den Details zur Übergabe.
                  </p>
                  <WhatsAppContact message={submitted.summary}>
                  <Button
                    type="button"
                    size="lg"
                    className="mt-5 h-auto min-h-10 max-w-full whitespace-normal bg-brand px-4 py-3 text-brand-foreground hover:bg-brand/90"
                  >
                    <Phone className="mr-2 h-4 w-4" /> Zusammenfassung per WhatsApp senden
                  </Button>
                  </WhatsAppContact>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Optional: Kontaktweg wählen und die vorbereitete Zusammenfassung selbst absenden.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Falls WhatsApp nicht öffnet: <a href={getWhatsAppWebUrl(submitted.summary)} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp Web</a>
                    {" · "}<a href={`mailto:${CONTACT_EMAIL}`} className="underline">E-Mail-Kontakt</a>. Deine Bestellung bleibt gespeichert.
                  </p>
                  <div className="mt-3">
                    <CopyTextButton value={submitted.summary} label="Zusammenfassung kopieren" manualLabel="Bestellzusammenfassung zum Kopieren" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Bei blockiertem Browser-Aufruf: in deinem WhatsApp einen Chat mit +49 176 42697714 öffnen und den kopierten Text einfügen. Du sendest ihn selbst ab.
                    </p>
                  </div>
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
              { n: "02", icon: Phone, title: "Bestellung absenden", text: "Deine Bestellung wird gespeichert. Wir melden uns per WhatsApp und bestätigen dir alle Details." },
              { n: "03", icon: Clock, title: "Übergabe nach Absprache", text: "Sobald dein Halter fertig ist, vereinbaren wir per WhatsApp die Übergabe." },
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
            Warum recardnize?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CreditCard, title: "Nie wieder lose Karte", text: "Schluss mit Suchen am Empfang. Karte sitzt fest im Halter." },
              { icon: Tag, title: "Sofort dein Halter", text: "Dein Name groß und rot. Direkt erkennbar, wem die Karte gehört." },
              { icon: ShieldCheck, title: "Telefonnummer bei Verlust", text: "Optional auf den Halter gedruckt – damit deine Karte schnell zurückfindet." },
              { icon: Package, title: "Band für die Flasche", text: "Mit Band hängt der Halter direkt an deiner Trinkflasche – nie wieder vergessen." },
              { icon: Clock, title: "Übergabe nach Absprache", text: "Lokal gefertigt. Wir melden uns per WhatsApp mit den Details zur Übergabe." },
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
            Ab <span className="text-brand">4,99 €</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Basis-Halter mit Name in deiner Wunschfarbe. Erweiterbar – ganz nach dir.
          </p>
          <div className="mx-auto mt-8 max-w-md space-y-2 rounded-xl border border-border bg-surface p-6 text-left text-sm">
            <PriceRow label="Basis-Halter (personalisiert)" value={formatPrice(BASE_PRICE_CENTS)} />
            <PriceRow label="Band für die Flasche" value={`+${formatPrice(BAND_SURCHARGE_CENTS)}`} />
            <PriceRow label="Telefonnummer auf Halter" value="inklusive" />
            <PriceRow label="Studio-Logo (mit Freigabe)" value={`+${formatPrice(STUDIO_LOGO_SURCHARGE_CENTS)}`} />
            <PriceRow label="recardnize-Logo" value="inklusive" />
            <PriceRow label="Weitere Extras auf Anfrage" value="—" muted />
          </div>
          <Button
            onClick={scrollToConfig}
            size="lg"
            className="mt-8 min-h-12 max-w-full whitespace-normal bg-brand px-4 text-base font-black uppercase tracking-wide text-brand-foreground hover:bg-brand/90 sm:px-8"
          >
            Jetzt deinen konfigurieren
          </Button>
        </div>
      </section>

      <StudioSection />

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
                a: "Jeder Halter wird lokal und individuell für dich gefertigt – meist geht es zügig. Wir melden uns per WhatsApp, sobald dein Halter fertig ist.",
              },
              {
                q: "Wie bekomme ich meinen Halter?",
                a: "Die Übergabe erfolgt nach Absprache – wir melden uns per WhatsApp mit den Details. Studio-Abholung ist bei zukünftigen Kooperationen möglich.",
              },
              {
                q: "Ist das Studio-Logo möglich?",
                a: "Nur wenn dein Studio die Nutzung des Logos offiziell freigegeben hat. Ohne Freigabe drucken wir es nicht.",
              },
              {
                q: "Muss ich direkt bezahlen?",
                a: "Nein. Du bezahlst bei der Übergabe. Vorab brauchst du nichts zu überweisen.",
              },
              {
                q: "Kann ich auch ohne Telefonnummer bestellen?",
                a: "Die Telefonnummer auf dem Halter ist freiwillig. Du kannst sie im Konfigurator ausschalten. Die Kontaktangaben für die Bestellabstimmung sind davon getrennt.",
              },
              {
                q: "Funktioniert die Mitgliedskarte auch im Halter am Kartenleser?",
                a: "Im bisherigen eigenen Praxistest konnte die Karte im Halter bleiben. Je nach Karte und Leser kann ein näheres Anhalten nötig sein. Die Funktion an anderen Lesern ist damit noch nicht bestätigt; bei einem Studio-Test prüfen wir sie gemeinsam vor Ort.",
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
      <section id="kontakt" className="bg-foreground py-8 text-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70">WhatsApp</div>
              <div className="font-display text-xl font-black">0176 42697714</div>
              <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block break-all text-sm underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
              <a href={getWhatsAppWebUrl(question)} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs underline underline-offset-4">
                Direkt zu WhatsApp Web
              </a>
              <div className="mt-2">
                <CopyTextButton value="+49 176 42697714" label="Nummer kopieren" manualLabel="WhatsApp-Nummer zum Kopieren" />
                <p className="mt-2 max-w-sm text-xs opacity-80">
                  Browser-Aufruf blockiert? Nummer kopieren und den Chat direkt in deinem WhatsApp öffnen. Oder schreib uns per E-Mail.
                </p>
              </div>
            </div>
          </div>
          <WhatsAppContact message={question}>
          <Button
            type="button"
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Direkt fragen
          </Button>
          </WhatsAppContact>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-surface/40 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <Link to="/" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <BrandLogo className="w-40" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <WhatsAppContact message={question}>
            <button type="button" className="hover:text-foreground">
              WhatsApp Kontakt
            </button>
            </WhatsAppContact>
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-foreground">{CONTACT_EMAIL}</a>
            <a href="#fuer-studios" className="hover:text-foreground">Für Studios</a>
            <Link to="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
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
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

function ColorRow<T extends string>({
  label,
  options,
  value,
  onChange,
  hexMap,
  disabledOptions,
  disabledHint,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  hexMap: Record<T, string>;
  disabledOptions?: readonly T[];
  disabledHint?: string;
}) {
  const isDisabled = (o: T) => disabledOptions?.includes(o) ?? false;
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o === value;
          const disabled = isDisabled(o);
          return (
            <button
              key={o}
              type="button"
              disabled={disabled}
              title={disabled ? disabledHint : undefined}
              onClick={() => !disabled && onChange(o)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                disabled
                  ? "cursor-not-allowed border-dashed border-border/60 bg-background/40 text-muted-foreground/40 line-through"
                  : active
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
      {disabledOptions && disabledOptions.length > 0 && disabledHint && (
        <p className="mt-2 text-xs text-muted-foreground">{disabledHint}</p>
      )}
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

function SummaryRow({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className={`min-w-0 break-words text-right ${bold ? "font-bold text-brand" : "font-medium"}`}>{v}</span>
    </div>
  );
}

/* Dimensions in millimeters from the readable cross-section of the printed holder. */
const HOLDER_OUTLINE =
  "M11.53 0H99.55A4 4 0 0 1 103.55 4V60A4 4 0 0 1 99.55 64H11.53A4 4 0 0 1 7.53 60V48C7.53 46.7 6.89 45.83 5.85 44.86L1.75 41.1C.63 40.08 .03 38.95 .03 37.6V26.4C.03 25.05 .63 23.92 1.75 22.9L5.85 19.14C6.89 18.17 7.53 17.3 7.53 16V4A4 4 0 0 1 11.53 0Z M2.53 27.5A2.5 2.5 0 0 1 7.53 27.5V36.5A2.5 2.5 0 0 1 2.53 36.5Z";
// Cross-section of the existing studio inlay, in its position on the holder.
const STUDIO_LOGO_OUTLINE = [
  "M32.24,24.41 31.67,28.26 26.28,28.26 26.85,24.41Z",
  "M26.93,35.48 24.24,35.48 25.89,24.41 19.13,24.41 18.56,28.26 21.25,28.26 20.18,35.48 17.48,35.48 16.91,39.33 26.35,39.33Z",
  "M28.88,29.83 26.04,29.83 25.50,33.49 28.34,33.49Z",
  "M43.37,29.73 42.53,35.46 41.08,35.46 41.76,30.93 38.74,30.93 37.88,36.76 36.44,36.76 37.90,26.97 42.46,26.97 42.26,28.25 39.14,28.25 38.93,29.73Z",
  "M78.33,29.73 73.88,29.73 74.11,28.25 77.22,28.25 77.42,26.97 72.85,26.97 71.40,36.76 72.84,36.76 73.70,30.93 76.72,30.93 76.04,35.46 77.48,35.46Z",
  "M47.64,29.73 46.14,29.73 46.41,28.03 44.93,28.25 44.04,34.53 44.20,35.08 44.62,35.44 45.79,35.55 47.09,35.13 46.75,34.17 45.76,34.43 45.50,34.14 45.98,30.93 47.45,30.93Z",
  "M91.14,29.73 89.65,29.73 89.91,28.03 88.43,28.25 87.54,34.20 87.59,34.83 88.12,35.45 89.30,35.55 90.59,35.13 90.26,34.17 89.26,34.43 89.00,34.14 89.48,30.93 90.96,30.93Z",
  "M53.49,31.13 53.41,30.25 53.14,29.85 52.70,29.63 51.49,29.73 50.06,30.33 50.06,29.63 48.83,29.81 47.98,35.46 49.43,35.46 49.99,31.64 51.70,30.98 51.95,31.06 52.02,31.31 51.40,35.46 52.83,35.46Z",
  "M63.95,29.88 61.74,29.61 61.01,29.73 60.35,30.21 60.03,31.43 60.18,32.17 60.58,32.59 62.00,33.40 62.22,33.93 62.02,34.33 61.67,34.42 59.76,34.14 59.53,35.21 60.63,35.51 61.85,35.56 62.62,35.41 63.13,35.10 63.53,34.23 63.58,33.12 63.13,32.59 61.52,31.61 61.44,31.17 61.57,30.84 61.94,30.74 63.75,30.96Z",
  "M68.74,29.88 66.53,29.61 65.54,29.85 65.16,30.21 64.83,31.43 64.99,32.17 66.92,33.50 67.02,33.93 66.82,34.33 66.47,34.42 64.56,34.14 64.33,35.21 65.42,35.51 66.67,35.56 67.43,35.41 67.93,35.10 68.33,34.23 68.37,33.12 67.94,32.59 66.32,31.61 66.23,31.17 66.38,30.84 66.73,30.74 68.54,30.96Z",
  "M86.92,29.88 86.73,30.96 84.92,30.74 84.57,30.84 84.42,31.17 84.50,31.61 86.13,32.59 86.56,33.12 86.51,34.23 86.11,35.10 85.61,35.41 84.85,35.56 83.61,35.51 82.51,35.21 82.74,34.14 84.65,34.42 85.00,34.33 85.20,33.93 85.10,33.50 83.18,32.17 83.01,31.43 83.34,30.21 83.72,29.85 84.72,29.61Z",
  "M82.44,30.89 80.75,31.92 80.22,35.46 78.78,35.46 79.62,29.81 80.87,29.63 80.84,30.46 82.30,29.61Z",
  "M59.05,31.09 58.93,31.79 58.55,32.34 57.39,33.00 55.77,33.50 55.70,33.92 55.85,34.33 56.18,34.40 58.39,33.74 58.72,34.82 57.18,35.43 56.01,35.58 55.23,35.48 54.52,35.00 54.27,33.87 54.57,31.78 54.89,30.71 55.28,30.18 56.64,29.61 57.91,29.70 58.72,30.21Z",
  "M57.67,31.14 57.38,31.71 55.95,32.24 56.10,31.39 56.53,30.83 57.31,30.74Z",
].join(" ");
const PRINT_TEXT_X = 16.7;
const PRINT_FONT = "Segoe UI, Inter, sans-serif";

function HolderPreview({
  holderColor,
  textColor,
  withName,
  name,
  withPhone,
  phone,
  logo,
  withBand,
  bandColor,
}: {
  holderColor: HolderColor;
  textColor: TextColor;
  withName: boolean;
  name: string;
  withPhone: boolean;
  phone: string;
  logo: HolderLogo;
  withBand: boolean;
  bandColor: BandColor;
}) {
  const id = useId();
  const shadeId = id + "-shade";
  const textureId = id + "-texture";
  const holderHex = HOLDER_HEX[holderColor];
  const textHex = TEXT_HEX[textColor];
  const isLightHolder = holderColor === "Weiß";
  const displayName = name.trim() || "Dein Name";
  const displayPhone = phone.trim() || "Deine Nummer";
  const nameSize = displayName.length > 20 ? 6.7 : displayName.length > 16 ? 7.2 : 8;
  const phoneSize = displayPhone.length > 16 ? 6.9 : 8;
  const bandPath = "M5 29C-4 29 -9 19 -15.5 23C-22 27 -22 37 -15.5 41C-9 45 -4 35 5 35";

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg
        viewBox={withBand ? "-23 -5 131 74" : "-4 -5 112 74"}
        className="aspect-[131/74] w-full drop-shadow-xl"
        role="img"
        aria-label="Vorschau Kartenhalter"
      >
        <defs>
          <linearGradient id={shadeId} x1="0%" x2="75%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.13" />
            <stop offset="42%" stopColor="#fff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.24" />
          </linearGradient>
          <pattern id={textureId} width="2.6" height="2.35" patternUnits="userSpaceOnUse">
            <g fill={isLightHolder ? "#000" : "#fff"} opacity={isLightHolder ? 0.09 : 0.21}>
              <circle cx=".23" cy=".42" r=".13" />
              <circle cx="1.16" cy=".21" r=".08" />
              <circle cx=".64" cy="1.54" r=".11" />
              <circle cx="2.1" cy="1.71" r=".14" />
              <circle cx="1.82" cy=".87" r=".1" />
            </g>
            <g fill="#000" opacity="0.35">
              <circle cx=".36" cy="1.07" r=".08" />
              <circle cx="1.42" cy="1.42" r=".12" />
              <circle cx="2.45" cy=".36" r=".09" />
            </g>
          </pattern>
        </defs>

        {withBand && (
          <g strokeLinecap="round" fill="none">
            <path d={bandPath} stroke={BAND_HEX[bandColor]} strokeWidth="3.6" />
            <path d={bandPath} stroke="#fff" strokeOpacity=".16" strokeWidth=".45" />
          </g>
        )}
        <path
          d={HOLDER_OUTLINE}
          fillRule="evenodd"
          fill={holderHex}
          stroke={isLightHolder ? "#aaa" : "#070708"}
          strokeWidth=".44"
        />
        <path d={HOLDER_OUTLINE} fillRule="evenodd" fill={"url(#" + shadeId + ")"} />
        <path d={HOLDER_OUTLINE} fillRule="evenodd" fill={"url(#" + textureId + ")"} />

        {withName && (
          <text
            x={PRINT_TEXT_X}
            y="11.8"
            dominantBaseline="central"
            fill={textHex}
            fontFamily={PRINT_FONT}
            fontSize={nameSize}
            fontWeight="700"
          >
            {displayName}
          </text>
        )}

        {logo === "studio" && (
          <path d={STUDIO_LOGO_OUTLINE} fillRule="evenodd" fill={textHex} />
        )}

        {logo === "recardnize" && (
          <image href={recardnizePrintLogo} x="16.66" y="25.81" width="74.08" height="11.23" />
        )}

        {withPhone && (
          <text
            x={PRINT_TEXT_X}
            y="52.1"
            dominantBaseline="central"
            fill={textHex}
            fontFamily={PRINT_FONT}
            fontSize={phoneSize}
            fontWeight="700"
          >
            {displayPhone}
          </text>
        )}
      </svg>

      <div className="mt-3 space-y-1 text-center">
        <div className="text-xs text-muted-foreground">Live-Vorschau des Halters</div>
        {logo === "studio" && (
          <div className="text-[11px] text-muted-foreground/80">
            Studio-Logo nur mit offizieller Freigabe möglich.
          </div>
        )}
      </div>
    </div>
  );
}
