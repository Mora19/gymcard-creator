import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/contact";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({ meta: [{ title: "Datenschutz – GymTag" }] }),
  component: Datenschutz,
});

function Datenschutz() {
  return (
    <LegalPage title="Datenschutz">
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Bestellung und Kontakt</h2>
        <p>
          Das Bestellformular übermittelt Name, Kontaktnummer, eine optional angegebene
          E-Mail-Adresse, Wunschort für die Übergabe, Produktkonfiguration, Stückzahl und optionale
          Anmerkungen zur Bearbeitung der Bestellung. Dazu gehören ein gewählter Name und eine
          gewählte Telefonnummer auf dem Halter; diese sind auf dem fertigen Produkt sichtbar. Die
          Bestelldaten werden über Supabase gespeichert und können über den zugangsbeschränkten
          Adminbereich bearbeitet und als CSV exportiert werden.
        </p>
        <p>
          Die WhatsApp-Zusammenfassung ist freiwillig und wird erst nach dem Speichern der
          Bestellung angeboten. Beim Anklicken wird der vorausgefüllte Text an WhatsApp übergeben;
          du entscheidest dort selbst über das Absenden. Auch der Kontaktbutton öffnet einen
          externen WhatsApp-Dienst. Alternativ kannst du eine E-Mail an{" "}
          <a className="break-all underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          schreiben.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Technische Dienste</h2>
        <p>
          Die Website wird über Lovable bereitgestellt; Produktbilder nutzen die bestehende
          Lovable-Bildbereitstellung. Schriftarten werden von Google Fonts geladen. Dabei fallen
          technisch Verbindungsdaten an, beispielsweise die IP-Adresse. Die konkreten Anbieter,
          deren Verarbeitung, Speicherorte und mögliche Übermittlungen in Drittländer müssen noch
          vollständig geprüft und beschrieben werden.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Noch zu vervollständigen</h2>
        <p>
          Es fehlen insbesondere die vollständigen Angaben zur verantwortlichen Person samt
          Anschrift, die zutreffenden Rechtsgrundlagen je Verarbeitungszweck, Empfänger und
          Dienstleister, Speicher- bzw. Löschfristen sowie vollständige Informationen zu
          Betroffenenrechten und dem Beschwerderecht bei einer Aufsichtsbehörde. Auch technisch
          eingesetzte Cookies, lokale Speicherung und Protokollierung müssen abschließend geprüft
          werden.
        </p>
        <p>
          Für Fragen zu deinen Daten erreichst du uns über die oben genannte E-Mail-Adresse. Diese
          vorläufigen Hinweise ersetzen keine vollständige Datenschutzerklärung.
        </p>
      </section>
    </LegalPage>
  );
}
