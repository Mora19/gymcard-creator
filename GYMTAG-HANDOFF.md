# GymTag: Kontakt- und Rechtshinweis-Korrektur

Stand: 23.10.2026. Ausgangscommit: `4cf4cc63aa9c21a579a555c3462ebded3e89a867`.

## Änderungen

- Gemeinsame WhatsApp-Linkfunktion: Desktop und SSR öffnen direkt `https://web.whatsapp.com/send`; Android, iPhone und iPad verwenden `whatsapp://send`. Telefonnummer `4917642697714` und ursprüngliche Nachrichtentexte bleiben erhalten und URL-kodiert.
- Die Geräteerkennung erfolgt nach dem ersten Rendern, damit Server und Browser beim Start dieselben Links erzeugen. iPads mit Desktop-Kennung werden berücksichtigt. Unbekannte Geräte erhalten den Web-Link.
- Falls keine WhatsApp-App installiert ist oder ein Browser App-Links blockiert: sichtbarer WhatsApp-Web-Link und E-Mail-Kontakt im Kontaktbereich sowie unter der optionalen Bestellzusammenfassung. Eine automatische Erkennung, ob eine externe App wirklich geöffnet wurde, ist nicht zuverlässig möglich.
- `moritz.kloesters@gmail.com` ist im Kontaktbereich und Footer als sichtbarer `mailto:`-Link vorhanden.
- `/impressum` und `/datenschutz` sind eigene, direkt aufrufbare Seiten im vorhandenen Design. Footer und Datenschutzlink im Bestellformular führen dorthin. Der Formularlink öffnet eine neue Registerkarte, damit eingegebene Bestelldaten erhalten bleiben.
- Die rechtlichen Seiten nennen bestätigte Kontakt-/Verarbeitungsinformationen und kennzeichnen fehlende Angaben ausdrücklich. Eine Testphase wird nicht als Ausnahme von Informationspflichten dargestellt.

## Erhalten und geprüft

- Preise: 499 Cent ohne Band, 599 Cent mit Band; Band initial ausgeschaltet. Beide Preise auch im Browser über den Band-Schalter geprüft.
- Unverändert: Produktbilddateien und Bildreferenzen, Preisberechnung, Bestell-Payload, Submit-Sperre, ursprünglicher Zusammenfassungstext, Supabase-Code/Schema/Migrationen, Authentifizierung, Admin und CSV-Format. Die Bestätigung ergänzt lediglich Ausweichlinks.
- Bestehende `/`-Route, Hosting-/Projektkonfiguration und Domains bleiben unverändert. Im Repository befindet sich kein prüfbares QR-Code-Ziel; ein vorhandener gedruckter QR-Code muss vor Ort gescannt und mit der bisherigen Adresse verglichen werden.
- Installation mit bestehender `bun.lock` und `--frozen-lockfile`; keine Paket- oder Lockfileänderungen.
- Produktionsbuild und TypeScript-Prüfung erfolgreich. URL-Prüfung für Desktop, Android, iPhone, iPad und iPod einschließlich Umlauten, Zeilenumbrüchen und Sonderzeichen erfolgreich. `/impressum` und `/datenschutz` sowie Kontakt/Footer im Browser geprüft.
- Geänderte Quelldateien bestehen ESLint mit deaktivierter Formatregel. Der vollständige Standard-Lint ist wegen bestehender Formatierungs-/Windows-Zeilenenden-Befunde und vier vorhandener `no-explicit-any`-Fehler in unveränderten Bestell-/Admin-Dateien nicht grün. Keine großflächige Formatierung vorgenommen.
- Live-Supabase-Funktion `public.create_order` ausschließlich lesend geprüft: berechnet verbindlich `499 + 100` bei Band und ignoriert Browserpreise. Achtung: Die eingecheckten älteren Migrationen bilden diesen Live-Stand noch nicht ab; eine spätere Neuinstallation der Datenbank benötigt einen getrennten Abgleich.
- Keine echte Testbestellung angelegt; keine Nachricht verschickt. Ein Build und eine Linkprüfung bestätigen keine Zustellung über WhatsApp und keine vollständig ausgeführte Bestellung.

## GitHub und Lovable

- Repository: [Mora19/gymcard-creator](https://github.com/Mora19/gymcard-creator), verbundener Branch `main`.
- [Lovable-Projekt](https://lovable.dev/projects/f7cf723e-3714-4a28-82ff-6958946abd34), ID `f7cf723e-3714-4a28-82ff-6958946abd34`.
- [Lovable-Vorschau](https://id-preview--f7cf723e-3714-4a28-82ff-6958946abd34.lovable.app).
- Zu Beginn identischer GitHub-/Lovable-Commit `4cf4cc63aa9c21a579a555c3462ebded3e89a867`. Änderungen als normaler, vorwärts gerichteter Commit; keine veröffentlichte Historie umgeschrieben.
- GitHub-Synchronisation in den Editor und Veröffentlichung der öffentlichen Seite sind getrennte Schritte. Nach Übernahme muss Lovable den neuen Commit anzeigen; für eine öffentliche Aktualisierung anschließend den bestehenden Publish-/Update-Vorgang im gleichen Projekt verwenden. Keine neue Domain und kein neuer QR-Code nötig, sofern die bisherige veröffentlichte Adresse beibehalten wird.

## Offene Angaben und manuelle Schritte

1. **Anbieterangaben vervollständigen:** Der Nutzer hat Moritz Klösters als alleinigen Anbieter bestätigt; der Name steht jetzt in Impressum und Datenschutz. Die ladungsfähige Anschrift fehlt weiterhin. Weitere Angaben nur ergänzen, soweit sie tatsächlich vorliegen und gesetzlich erforderlich sind.
2. **Datenschutz vervollständigen:** Verantwortlicher/Kontakt; tatsächliche Zwecke und Rechtsgrundlagen; Dienstleister und Empfänger (insbesondere Lovable/Hosting, Supabase, Google Fonts, WhatsApp und E-Mail); Regionen/Drittlandübermittlungen und Garantien; Auftragsverarbeitungsvereinbarungen; Speicher-/Löschfristen; Betroffenenrechte, ggf. Widerruf, Beschwerderecht/zuständige Aufsichtsbehörde; Pflichtfelder und Folgen fehlender Angaben. Tatsächliche Cookies, lokale Speicherung, Auth-Sitzungen, Fehlerberichte und Hosting-Protokolle prüfen. Die vorläufigen Seiten sind noch keine vollständigen Rechtstexte.
3. **Vor regulärer Nutzung:** fehlende Informationen prüfen und die beiden Seiten vervollständigen; auch für aktuelle Datenerhebung gelten die Informationspflichten.
4. **Öffentliche Version aktualisieren:** im bestehenden Lovable-Projekt den synchronisierten Stand prüfen und über Publish/Update veröffentlichen. Danach die bisherige öffentliche Adresse und beide Rechtshinweis-URLs direkt aufrufen.
5. **Am echten Gerät:** über den vorhandenen QR-Code öffnen; Desktop-Link, Android/iPhone mit installierter App und die Web-/E-Mail-Ausweichlinks prüfen. Mobil ohne App muss ein Ausweichkontakt weiterhin erreichbar sein. WhatsApp Web kann eine Anmeldung oder Gerätekopplung verlangen.
6. **Betreiber-Testbestellung:** einmal ohne/mit Band bestellen, Bestätigung/Bestellnummer und Admin prüfen; CSV muss 499/599 Cent pro Stück ausweisen. Testauftrag anschließend im Admin als storniert markieren. Dies verändert Bestelldaten und wurde hier dem Betreiber überlassen.

## Primärquellen für die noch zu vervollständigenden Angaben

- [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html)
- [DSGVO, insbesondere Artikel 13/14](https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=celex%3A32016R0679)
- [Datenschutzkonferenz: Informationspflichten, Kurzpapier 10](https://www.datenschutzkonferenz-online.de/media/kp/dsk_kpnr_10.pdf)

## Nachprüfung vor der Vorstellung

- Nutzer bestätigt: `ERR_BLOCKED_BY_RESPONSE` beim PC-Aufruf stammt aus der Lovable-Vorschau; die mobile Weiterleitung funktioniert. Derselbe Desktop-Link lädt im getrennten Browser bis zur WhatsApp-Anmeldung. Die konkrete Browserblockade ist damit nicht am Nutzer-PC behoben; eine Vorschau-Beschränkung ist die wahrscheinliche Ursache. Auch neue Tabs aus eingebetteten Vorschauen können deren Sandbox-Beschränkungen übernehmen.
- PC-Test: GymTag über Lovables **Open in new tab** außerhalb der eingebetteten Vorschau öffnen und dort WhatsApp testen. Alternativ die WhatsApp-Adresse in einen über das Pluszeichen frisch geöffneten Browser-Tab einfügen und bestätigen. Keine Browser-Schutzfunktionen abschalten.
- Zusätzliche Absicherung: **Nummer kopieren** im Kontaktbereich und **Zusammenfassung kopieren** nach erfolgreicher Speicherung. Bei verweigertem Zwischenablagezugriff erscheint automatisch ein beschriftetes, manuell markierbares Textfeld. Die Buttons haben `type="button"` und legen keine Bestellung an; Nachrichten werden weiter ausschließlich vom Nutzer abgesendet.
- Schmale Ansicht verbessert: Kopfzeile passt auch bei 320 Pixeln; auf kleinen Displays heißt der Bestellbutton „Bestellen“, seine zugängliche Beschriftung bleibt „Jetzt bestellen“. Der lange WhatsApp-Button darf umbrechen; lange Werte in der Bestellzusammenfassung ebenfalls. Dokumentsprache auf Deutsch gesetzt.
- Geprüft: neuer Build, TypeScript, geänderte Dateien ohne Formatregel, unveränderte Preis-/Payload-/Nachrichtenlogik und Backend-Dateien. Kontakt/Kopfzeile bei 320 Pixeln visuell geprüft; manuelles Textfeld mit absichtlich gesperrtem Zwischenablagezugriff im Browser geprüft. Die Bestellbestätigung wurde ohne echte Testbestellung nur anhand ihres Codes geprüft.
- Quellen zur Vorschau-Ursache: [W3C: COOP und Sandbox-Popups](https://w3c.github.io/webappsec/mitigation-guidance/COOP/rollouts.html), [Chrome: Vererbung von Sandbox-Beschränkungen](https://googlechrome.github.io/samples/allow-popups-to-escape-sandbox/index.html), [Lovable: Vorschau separat öffnen](https://docs.lovable.dev/features/projects/preview).

## Austausch der zwei Produktfotos auf Nutzerwunsch

- Neue Vorderansicht aus Nutzerfoto 1 und offene Ansicht aus Nutzerfoto 4, mit eingebauter imagegen-Bildbearbeitung freigestellt. Fotocharakter, Druckstruktur und Beschriftung geprüft; keine Änderung am Produktdesign beauftragt.
- `src/assets/gymtag-front-transparent.png` (1672 × 940) und `src/assets/gymtag-open-transparent.png` (1975 × 796) ersetzen die beiden Bildverweise im oberen Produktbereich. Die bisherigen JSON-Bildverweise bleiben als Rückfallmöglichkeit erhalten.
- Beide Dateien enthalten echte Transparenz, einschließlich der Öse: Alphakanal 0–255; Ecken und Ösenöffnung vollständig transparent. Die bisher sichtbaren Karoflächen entfallen. Keine Alpha- oder Bildbearbeitung nach dem imagegen-Export.
- Alternativtext auf die neue Beispielbeschriftung „Max Mustermann“ angepasst; das kleine Foto erhält eine begrenzte Breite, damit der Text daneben auf schmalen Displays Platz behält.
- Produktionsbuild, TypeScript und tatsächliche Bildladung im Browser erfolgreich geprüft. Bestellfunktionen, Preise, Kontaktlinks, Admin, CSV, Supabase und QR-/Hostingkonfiguration bleiben unverändert.

## Bereich für Studios und bestätigte Anbieterangaben

- Neuer Abschnitt `/#fuer-studios` mit Beschreibung, Ansprechpartner, Muster-/Kooperationsanfrage per E-Mail und einem Vorschlag für einen gemeinsam abgestimmten Praxistest. Link im Footer ergänzt. Keine neue Formularspeicherung und kein automatischer Versand.
- Keine bestehenden Kooperationen, kostenlosen Muster oder nachgewiesenen Testergebnisse zugesagt. Logo-Nutzung weiterhin nur nach ausdrücklicher Freigabe; eine Freigabe selbst ist noch offen.
- Anbietername Moritz Klösters ist vom Nutzer bestätigt und zentral in `src/lib/contact.ts` hinterlegt. Eine neue geschäftliche E-Mail-Adresse wird erst nach Einrichtung und Funktionstest eingesetzt.
- Datenschutzinformationen an den tatsächlichen Code angepasst: lokal gebündelte Produktbilder, Admin-Anmeldesitzung, bedingte Fehlerberichte, Pflichtfelder und qualifizierte Betroffenenrechte. Rechtstexte bleiben ausdrücklich unvollständig, solange Anschrift, Rechtsgrundlagen, Löschkonzept und kontospezifische Dienstleister-/Vertragsangaben fehlen.
- Build, TypeScript, gezielter ESLint und Browseransicht des neuen Studio-Bereichs sowie E-Mail-Ziel geprüft. Bestell-Payload, Preise, Supabase, Admin, CSV und Bilddateien unverändert.
