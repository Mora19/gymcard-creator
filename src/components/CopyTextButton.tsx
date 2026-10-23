import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CopyTextButton({
  value,
  label,
  manualLabel,
}: {
  value: string;
  label: string;
  manualLabel: string;
}) {
  const [manualCopy, setManualCopy] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(value);
      setManualCopy(false);
      toast.success("In die Zwischenablage kopiert.");
    } catch {
      setManualCopy(true);
    }
  }

  return (
    <div className="max-w-full space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-auto min-h-8 max-w-full whitespace-normal py-2 text-foreground"
        onClick={copyText}
      >
        <Copy className="h-3.5 w-3.5" /> {label}
      </Button>
      {manualCopy && (
        <div className="space-y-2 rounded-md border border-border bg-background p-3 text-left text-foreground">
          <p role="status" className="text-xs">
            Automatisches Kopieren ist hier nicht verfügbar. Markiere den Text und kopiere ihn
            manuell.
          </p>
          <Textarea
            aria-label={manualLabel}
            value={value}
            readOnly
            rows={Math.min(8, value.split("\n").length)}
            onFocus={(event) => event.currentTarget.select()}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
