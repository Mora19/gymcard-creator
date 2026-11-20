import { Building2, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, PROVIDER_NAME } from "@/lib/contact";

const studioSubject = encodeURIComponent("recardnize – Muster für den Studioalltag");

export function StudioSection() {
  return (
    <section
      id="fuer-studios"
      aria-labelledby="studio-heading"
      className="scroll-mt-20 border-b border-border/60 bg-surface/40 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand">
            <Building2 className="h-4 w-4" aria-hidden="true" /> Für Studios
          </div>
          <h2
            id="studio-heading"
            className="font-display text-3xl font-black uppercase sm:text-4xl"
          >
            Mitgliedskarten im Studio leichter zuordnen
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            recardnize ist ein lokal 3D-gedruckter Halter, der Mitgliedskarten mit Namen und Farbe
            unterscheidbar macht. Die Karte bleibt entnehmbar. Eine Telefonnummer ist beim
            Aufdruck freiwillig.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-semibold text-foreground">Am Empfang.</span> Der Name bleibt
              sichtbar, wenn Mitglieder ihre Karte als Pfand für einen Gewichtsgürtel abgeben.
            </li>
            <li>
              <span className="font-semibold text-foreground">Im Wellnessbereich.</span> Persönlich
              beschriftete Karten lassen sich leichter auseinanderhalten.
            </li>
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-6 h-auto min-h-10 max-w-full whitespace-normal bg-brand px-5 py-3 text-brand-foreground hover:bg-brand/90"
          >
            <a href={`mailto:${CONTACT_EMAIL}?subject=${studioSubject}`}>
              <Mail className="h-4 w-4" aria-hidden="true" /> Muster anfragen
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {PROVIDER_NAME} ·{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${studioSubject}`}
              className="inline-block underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
          <h3 className="font-display text-lg font-black uppercase">Vorschlag für ein Pilotprojekt</h3>
          <ol className="mt-5 space-y-5">
            {[
              {
                title: "Muster am Kartenleser prüfen",
                text: "Wir prüfen gemeinsam Passform, Entnahme und das Vorhalten an den Lesern im Club.",
              },
              {
                title: "Mit einer kleinen Gruppe starten",
                text: "Freiwillige Mitglieder probieren den Halter aus. Umfang, Dauer und Kosten stimmen wir mit dem Studio vorab ab.",
              },
              {
                title: "Rückmeldungen aus dem Alltag auswerten",
                text: "Mitglieder und Studioteam geben Rückmeldung zur Handhabung und zur Zuordnung beim Ausleihen.",
              },
            ].map((step) => (
              <li key={step.title} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold">{step.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            recardnize ist ein unabhängig entwickeltes Produkt. Eine Ausführung mit Studio-Logo
            setzt die Freigabe des Studios voraus.
          </p>
        </div>
      </div>
    </section>
  );
}
