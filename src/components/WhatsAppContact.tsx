import type { ReactElement } from "react";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { CopyTextButton } from "@/components/CopyTextButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CONTACT_EMAIL,
  WHATSAPP_DISPLAY_NUMBER,
  getWhatsAppAppUrl,
  getWhatsAppWebUrl,
} from "@/lib/contact";

export function WhatsAppContact({
  message,
  children,
}: {
  message: string;
  children: ReactElement;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-lg">
        <DialogHeader className="pr-6">
          <DialogTitle>recardnize per WhatsApp kontaktieren</DialogTitle>
          <DialogDescription>
            Wähle, wo du den Chat öffnen möchtest. Du sendest die vorbereitete Nachricht selbst ab.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button asChild className="h-auto min-h-10 w-full whitespace-normal py-3">
            <a href={getWhatsAppWebUrl(message)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              WhatsApp im Browser öffnen
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto min-h-10 w-full whitespace-normal py-3">
            <a href={getWhatsAppAppUrl(message)}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp-App öffnen
            </a>
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Die App muss installiert sein und der Browser den Aufruf erlauben. Für WhatsApp Web
            meldest du dich gegebenenfalls im neuen Tab an. Die Website kann nicht erkennen, ob
            WhatsApp geöffnet wurde.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-surface/40 p-4">
          <p className="text-sm font-semibold">Falls sich kein Chat öffnet</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Starte WhatsApp selbst, öffne einen Chat mit{" "}
            <span className="whitespace-nowrap text-foreground">{WHATSAPP_DISPLAY_NUMBER}</span>{" "}
            und füge die kopierte Nachricht ein.
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyTextButton
              value={WHATSAPP_DISPLAY_NUMBER}
              label="Nummer kopieren"
              manualLabel="WhatsApp-Nummer zum Kopieren"
            />
            <CopyTextButton
              value={message}
              label="Nachricht kopieren"
              manualLabel="WhatsApp-Nachricht zum Kopieren"
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex max-w-full items-center gap-2 text-brand underline underline-offset-4"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="break-all">{CONTACT_EMAIL}</span>
          </a>
          <CopyTextButton
            value={CONTACT_EMAIL}
            label="E-Mail-Adresse kopieren"
            manualLabel="E-Mail-Adresse zum Kopieren"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
