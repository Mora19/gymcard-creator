import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { submitOrder } from "@/lib/orders.functions";
import { CONTACT_EMAIL, getWhatsAppUrl } from "@/lib/contact";
import { CopyTextButton } from "@/components/CopyTextButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nie wieder Kartenchaos – personalisierter Gym-Kartenhalter" },
      {
        name: "description",
        content:
          "3D-gedruckter Kartenhalter für deine Gym-Karte ab 4,99 €. Mit Name, optional Telefonnummer und Band für die Flasche. Lokal gefertigt.",
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

const BASE_PRICE = 499; // cents – 4,99 € (must match create_order in DB)
const BAND_PRICE = 100;
const PHONE_PRICE = 0;
const LOGO_PRICE = 0;

function LandingPage() {
  // Configurator state
  const [withLogo, setWithLogo] = useState(false);
  const [withName, setWithName] = useState(true);
  const [name, setName] = useState("Max Mustermann");
  const [withPhoneOnHolder, setWithPhoneOnHolder] = useState(true);
  const [phoneOnHolder, setPhoneOnHolder] = useState("0170 1234567");
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
  const [submitted, setSubmitted] = useState<{ whatsappUrl: string; whatsappWebUrl: string; summary: string; orderNumber?: string | null } | null>(null);
  const [whatsappUserAgent, setWhatsappUserAgent] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    const isIPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    setWhatsappUserAgent(isIPad ? "iPad" : navigator.userAgent);
  }, []);

  const unitPriceCents = useMemo(() => {
    let p = BASE_PRICE;
    if (withBand) p += BAND_PRICE;
    if (withPhoneOnHolder) p += PHONE_PRICE;
    if (withLogo) p += LOGO_PRICE;
    return p;
  }, [withBand, withPhoneOnHolder, withLogo]);
  const priceCents = unitPriceCents * quantity;

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
          with_logo: withLogo,
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
        withLogo ? "Mit Studio-Logo (sofern freigegeben)" : null,
        withBand ? `Band: ${bandColor}` : "Ohne Band",
        `Gesamtpreis: ${formatPrice(priceCents)}`,
        note ? `Notiz: ${note}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const whatsappUrl = getWhatsAppUrl(summary, whatsappUserAgent);
      setSubmitted({ whatsappUrl, whatsappWebUrl: getWhatsAppUrl(summary), summary, orderNumber: res?.order_number ?? null });
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
  const whatsappFrage = getWhatsAppUrl(question, whatsappUserAgent);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground sm:h-8 sm:w-8">
              <Tag className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold tracking-tight sm:text-lg">GymTag</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild size="sm" variant="outline" className="h-9 px-2 sm:px-3">
              <a href={whatsappFrage} target="_blank" rel="noreferrer" aria-label="Frage per WhatsApp stellen">
                <Phone className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Frage stellen</span>
                <span className="sm:hidden ml-1">WhatsApp</span>
              </a>
            </Button>
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
              {["3D-gedruckt", "Lokal gefertigt", "Übergabe nach Absprache"].map((b) => (
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
                    placeholder="z. B. Max Mustermann"
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
                    value={phoneOnHolder}
                    onChange={(e) => setPhoneOnHolder(e.target.value.slice(0, 25))}
                    className="bg-background"
                  />
                )}
                <ToggleRow
                  label="Studio-Logo"
                  hint="Studio-Logo nur mit offizieller Freigabe möglich (z. B. Fitness First)."
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
                  disabledOptions={TEXT_COLORS.filter(conflictsWithHolder)}
                  disabledHint="Gleiche Farbe wie der Halter – kein Kontrast."
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
                    <SummaryRow k="Kunde" v={contactName} />
                    {withName && <SummaryRow k="Name auf Halter" v={name} />}
                    {withPhoneOnHolder && <SummaryRow k="Tel auf Halter" v={phoneOnHolder} />}
                    <SummaryRow k="Halterfarbe" v={holderColor} />
                    <SummaryRow k="Textfarbe" v={textColor} />
                    <SummaryRow k="Band" v={withBand ? `ja · ${bandColor}` : "nein"} />
                    <SummaryRow k="Stückzahl" v={String(quantity)} />
                    <SummaryRow k="Gesamtpreis" v={formatPrice(priceCents)} bold />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Deine Bestellung ist bereits bei uns gespeichert – du musst nichts weiter tun. Wir melden uns per WhatsApp mit den Details zur Übergabe.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-5 h-auto min-h-10 max-w-full whitespace-normal bg-brand px-4 py-3 text-brand-foreground hover:bg-brand/90"
                  >
                    <a href={submitted.whatsappUrl} target="_blank" rel="noreferrer">
                      <Phone className="mr-2 h-4 w-4" /> Zusammenfassung per WhatsApp senden
                    </a>
                  </Button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Optional: öffnet WhatsApp mit vorausgefüllter Nachricht an 0176 42697714 – du sendest sie selbst ab.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Falls WhatsApp nicht öffnet: <a href={submitted.whatsappWebUrl} target="_blank" rel="noreferrer" className="underline">WhatsApp Web</a>
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
            Warum GymTag?
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
            <PriceRow label="Basis-Halter (personalisiert)" value="4,99 €" />
            <PriceRow label="Band für die Flasche" value="+1,00 €" />
            <PriceRow label="Telefonnummer auf Halter" value="inklusive" />
            <PriceRow label="Studio-Logo (mit Freigabe)" value="inklusive" />
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
              <a href={getWhatsAppUrl(question)} target="_blank" rel="noreferrer" className="mt-1 block text-xs underline underline-offset-4">
                Falls die App nicht öffnet: WhatsApp Web
              </a>
              <div className="mt-2">
                <CopyTextButton value="+49 176 42697714" label="Nummer kopieren" manualLabel="WhatsApp-Nummer zum Kopieren" />
                <p className="mt-2 max-w-sm text-xs opacity-80">
                  Browser-Aufruf blockiert? Nummer kopieren und den Chat direkt in deinem WhatsApp öffnen. Oder schreib uns per E-Mail.
                </p>
              </div>
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
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all hover:text-foreground">{CONTACT_EMAIL}</a>
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

/* ---------- live preview (real 3D-printed holder, fixed 3-zone layout) ---------- */

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

  // 3D-print line texture
  const textureLines = Array.from({ length: 46 }, (_, i) => 28 + i * 6);

  const displayName = (name || "Dein Name").slice(0, 22);
  const displayPhone = phone || "0170 1234567";

  // Card body: x=58, w=278 → interior 58..336. Left text baseline:
  const X_LEFT = 86;

  // Fixed zone Y positions (text baselines, viewBox 360x300)
  const Y_NAME = 92;
  const Y_LOGO = 168;
  const Y_PHONE = 240;

  // Dynamic name sizing: 30 (short) → 16 (max length)
  const nameLen = displayName.length;
  const nameFontSize = Math.max(16, Math.min(30, 32 - Math.max(0, nameLen - 8) * 1.05));
  const phoneFontSize = displayPhone.length > 14 ? 18 : 21;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <svg
        viewBox="0 0 360 300"
        className="w-full drop-shadow-2xl"
        aria-label="Vorschau Kartenhalter"
      >
        <defs>
          <linearGradient id="holderShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
          <filter id="raised" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <clipPath id="cardClip">
            <rect x="58" y="30" width="278" height="240" rx="20" />
          </clipPath>
        </defs>

        {/* Band through eyelet */}
        {withBand && (
          <g>
            <path
              d="M 42 152 Q 8 130 22 100 Q 40 78 58 110"
              stroke={bandHex}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity="0.95"
            />
            <path
              d="M 42 152 Q 8 130 22 100 Q 40 78 58 110"
              stroke="#000000"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              opacity="0.18"
            />
          </g>
        )}

        {/* Eyelet ear */}
        <g>
          <path
            d="M 58 130 Q 36 130 30 150 Q 28 165 30 180 Q 36 200 58 200 Z"
            fill={holderHex}
            stroke={isLightHolder ? "#bdbdbd" : "#000000"}
            strokeWidth="1.2"
          />
          <ellipse cx="44" cy="165" rx="9" ry="11" fill="#000000" opacity="0.6" />
          <ellipse cx="44" cy="165" rx="6" ry="8" fill="#0a0a0a" />
        </g>

        {/* Card body */}
        <rect
          x="58"
          y="30"
          width="278"
          height="240"
          rx="20"
          fill={holderHex}
          stroke={isLightHolder ? "#bdbdbd" : "#000000"}
          strokeWidth="1.4"
        />

        {/* 3D print texture */}
        <g clipPath="url(#cardClip)" opacity={isLightHolder ? 0.07 : 0.22}>
          {textureLines.map((y) => (
            <line
              key={y}
              x1="58"
              x2="336"
              y1={y}
              y2={y}
              stroke={isLightHolder ? "#000000" : "#ffffff"}
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Shading */}
        <rect x="58" y="30" width="278" height="240" rx="20" fill="url(#holderShade)" />

        {/* ZONE 1 — NAME (top, left-aligned) */}
        {withName && (
          <g filter="url(#raised)">
            <text
              x={X_LEFT}
              y={Y_NAME}
              textAnchor="start"
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontSize={nameFontSize}
              fontWeight="800"
              letterSpacing="0.4"
            >
              {displayName}
            </text>
          </g>
        )}

        {/* ZONE 2 — LOGO row (middle, left-aligned): F block + "Fitness First" */}
        {withLogo && (
          <g filter="url(#raised)">
            {/* F block */}
            <g transform={`translate(${X_LEFT}, ${Y_LOGO - 32})`}>
              <rect x="0" y="0" width="40" height="44" rx="3" fill={textHex} />
              <text
                x="20"
                y="35"
                textAnchor="middle"
                fill={holderHex}
                fontFamily="Space Grotesk, sans-serif"
                fontSize="36"
                fontWeight="900"
              >
                F
              </text>
            </g>
            {/* Fitness First wordmark — single line, like the real card */}
            <text
              x={X_LEFT + 50}
              y={Y_LOGO + 4}
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontSize="22"
              fontWeight="800"
              fontStyle="italic"
              letterSpacing="0.4"
            >
              Fitness First
            </text>
          </g>
        )}

        {/* ZONE 3 — PHONE (bottom, left-aligned) */}
        {withPhone && (
          <g filter="url(#raised)">
            <text
              x={X_LEFT}
              y={Y_PHONE}
              textAnchor="start"
              fill={textHex}
              fontFamily="Space Grotesk, sans-serif"
              fontSize={phoneFontSize}
              fontWeight="800"
              letterSpacing="0.8"
            >
              {displayPhone}
            </text>
          </g>
        )}

        {!withName && !withPhone && !withLogo && (
          <text
            x="197"
            y="158"
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



      <div className="mt-3 space-y-1 text-center">
        <div className="text-xs text-muted-foreground">
          Live-Vorschau · echte 3D-Druck-Optik
        </div>
        {withLogo && (
          <div className="text-[11px] text-muted-foreground/80">
            Studio-Logo nur mit offizieller Freigabe möglich.
          </div>
        )}
      </div>
    </div>
  );
}

