import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/contact";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/" className="text-sm text-brand underline underline-offset-4">
          Zurück zu GymTag
        </Link>
        <h1 className="font-display text-3xl font-black">{title}</h1>
        <p className="rounded-xl border border-brand/40 bg-brand/10 p-4 text-sm">
          Vorläufiger Informationsstand: Die rechtlichen Angaben sind noch unvollständig und müssen
          ergänzt und geprüft werden. Eine Testphase hebt gesetzliche Informationspflichten nicht
          auf.
        </p>
        <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
        <nav
          aria-label="Rechtliche Informationen"
          className="flex flex-wrap gap-5 border-t border-border pt-6 text-sm"
        >
          <Link to="/impressum" className="underline underline-offset-4">
            Impressum
          </Link>
          <Link to="/datenschutz" className="underline underline-offset-4">
            Datenschutz
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="break-all underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </nav>
      </div>
    </main>
  );
}
