import { Building2, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, PROVIDER_NAME } from "@/lib/contact";

const studioSubject = encodeURIComponent("recardnize – Muster und Studio-Kooperation anfragen");

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
            Eine persönliche Karte.
            <br /> Ein gemeinsamer Praxistest.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            recardnize ist ein lokal gefertigter, personalisierbarer Halter für Mitgliedskarten. Name,
            Farbe und eine optionale Telefonnummer machen die Karte individuell erkennbar. Wir
            suchen Studios, die gemeinsam mit uns prüfen möchten, wie sich der Halter in ihren
            Alltag einfügt.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">Karte zuordnen:</span> persönliche Beschriftung statt gleich aussehender Karten.</li>
            <li><span className="font-semibold text-foreground">Pfand abgeben:</span> der Name bleibt am Halter sichtbar, etwa beim Ausleihen von Equipment.</li>
            <li><span className="font-semibold text-foreground">Rückkontakt ermöglichen:</span> eine Telefonnummer kann auf Wunsch ergänzt werden.</li>
          </ul>
          <Button
            asChild
            size="lg"
            className="mt-6 h-auto min-h-10 max-w-full whitespace-normal bg-brand px-5 py-3 text-brand-foreground hover:bg-brand/90"
          >
            <a href={`mailto:${CONTACT_EMAIL}?subject=${studioSubject}`}>
              <Mail className="h-4 w-4" aria-hidden="true" /> Muster und Kooperation anfragen
            </a>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Ansprechpartner für die Anfrage: {PROVIDER_NAME} ·{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${studioSubject}`}
              className="break-all underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
          <h3 className="font-display text-lg font-black uppercase">So könnte ein Test starten</h3>
          <ol className="mt-5 space-y-5">
            {[
              {
                title: "Muster kennenlernen",
                text: "Ausführung, Personalisierung und ein mögliches Muster gemeinsam besprechen.",
              },
              {
                title: "Alltagstauglichkeit prüfen",
                text: "Mit einem kleinen, gemeinsam abgestimmten Test Passform, Entnahme, Kartenleser und Zuordnung im Alltag prüfen. Umfang, Dauer und Kosten besprechen wir vorab.",
              },
              {
                title: "Gestaltung gemeinsam abstimmen",
                text: "Eine Ausführung mit Studio-Logo kommt erst nach ausdrücklicher Freigabe infrage.",
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
            recardnize ist ein unabhängig entwickeltes Produkt. Die gezeigte Logo-Gestaltung ist ein
            Beispiel zur Abstimmung; eine offizielle Studio-Kooperation besteht derzeit nicht.
          </p>
        </div>
      </div>
    </section>
  );
}
