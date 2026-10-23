import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, PROVIDER_NAME } from "@/lib/contact";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({ meta: [{ title: "Datenschutz – GymTag" }] }),
  component: Datenschutz,
});

function Datenschutz() {
  return (
    <LegalPage title="Datenschutz">
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">
          Verantwortlicher und Kontakt
        </h2>
        <p>
          Verantwortlich für GymTag: {PROVIDER_NAME}. Die vollständige Anschrift wird noch ergänzt.
        </p>
        <p>
          Fragen zu deinen Daten kannst du an{" "}
          <a className="break-all underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>{" "}
          richten.
        </p>
      </section>
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
          Name, Kontaktnummer und Wunschort für die Übergabe sind Pflichtangaben. Ohne diese Angaben
          kann das Bestellformular nicht abgesendet werden. E-Mail-Adresse und Anmerkungen sind
          freiwillig; die Personalisierung wählst du im Konfigurator aus.
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
          Die Website wird über Lovable bereitgestellt. Die beiden Produktfotos werden zusammen mit
          den Website-Dateien bereitgestellt. Schriftarten werden von Google Fonts geladen. Dabei
          fallen technisch Verbindungsdaten an, beispielsweise die IP-Adresse. Die konkreten
          Anbieter, deren Verarbeitung, Speicherorte und mögliche Übermittlungen in Drittländer
          müssen noch vollständig geprüft und beschrieben werden.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">
          Anmeldung im Adminbereich
        </h2>
        <p>
          Für eine Bestellung ist kein Kundenkonto erforderlich. Der Adminbereich verwendet Supabase
          Auth zur Anmeldung. Die Anmeldesitzung wird lokal im Browser gespeichert. In der
          Lovable-Vorschau kann die Sitzung auch mit dem Editor ausgetauscht werden.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">
          Technische Fehlerberichte
        </h2>
        <p>
          Bei technischen Fehlern können Fehlermeldungen im Browser und auf dem Server protokolliert
          werden. Sofern die Lovable-Fehlererfassung in der jeweiligen Umgebung verfügbar ist,
          können Fehlermeldungen und der aufgerufene Seitenpfad auch an diesen Dienst übergeben
          werden. Umfang und Speicherdauer der beim Hosting anfallenden Protokolle müssen noch
          abschließend geklärt werden.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Deine Rechte</h2>
        <p>
          Unter den jeweiligen gesetzlichen Voraussetzungen kannst du Auskunft, Berichtigung,
          Löschung oder Einschränkung der Verarbeitung deiner personenbezogenen Daten verlangen.
          Auch Rechte auf Datenübertragbarkeit und Widerspruch können bestehen. Soweit eine
          Verarbeitung auf deiner Einwilligung beruht, kannst du diese mit Wirkung für die Zukunft
          widerrufen. Außerdem kannst du dich bei einer Datenschutzaufsichtsbehörde beschweren.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Noch zu vervollständigen</h2>
        <p>
          Es fehlen insbesondere die Anschrift des Verantwortlichen, die zutreffenden
          Rechtsgrundlagen je Verarbeitungszweck, konkrete Empfänger und Dienstleister, Speicher-
          bzw. Löschfristen und die Benennung der zuständigen Aufsichtsbehörde. Auch technisch
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
