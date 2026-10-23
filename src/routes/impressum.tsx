import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, PROVIDER_NAME } from "@/lib/contact";

export const Route = createFileRoute("/impressum")({
  head: () => ({ meta: [{ title: "Impressum – GymTag" }] }),
  component: Impressum,
});

function Impressum() {
  return (
    <LegalPage title="Impressum">
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">Kontakt zu GymTag</h2>
        <p>Anbieter: {PROVIDER_NAME}</p>
        <p>
          E-Mail:{" "}
          <a className="break-all underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>Telefon / WhatsApp: 0176 42697714</p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-foreground">
          Noch ausstehende Anbieterangaben
        </h2>
        <p>
          Die ladungsfähige Anschrift des Anbieters ist noch zu ergänzen. Diese Seite ist deshalb
          weiterhin unvollständig. Weitere Angaben werden berücksichtigt, soweit sie für die
          tatsächliche Tätigkeit gesetzlich erforderlich sind.
        </p>
        <p>Diese Kontaktangaben bilden noch kein vollständiges Impressum.</p>
      </section>
    </LegalPage>
  );
}
