# recardnize im Karten-Konfigurator und in der Fertigung

Stand 20.11.2026. Der Konfigurator ist im Branch `recardnize-logo-configurator` vorbereitet. Der bisherige Produktionsstand ist weiterhin `main`.

## 1. OpenSCAD am bestehenden Halter ergänzen

1. Die private Fertigungs-Testkopie `recardnize-fertigung-test` basiert auf dem bestätigten Desktop-Ordner `GymTag_Automation`. Das originale Startskript bleibt der Einstieg für die bestehende Produktion. Für die Tests den separaten Ordner verwenden.
2. In der Testkopie ist [recardnize-logo.scad](recardnize-logo.scad) bereits mit `use` eingebunden. Das Modul erhält Breite und Höhe in Millimetern und erzeugt die ausgewählte Wortmarke. Der neue Zweig setzt sie mit 74 mm Breite und 0,40 mm Höhe in die mittlere Logo-Zone. Die bestehende Spiegelung und Platzierung für beide Halterteile gilt auch für diesen Zweig.
3. Erst Basis und Inlay gemeinsam als zwei Teile **eines Objekts** in Bambu Studio öffnen. Die relative Position der STLs beibehalten und dem Inlay wie beim bestehenden Fitness-First-Druck das Kontrastfilament zuweisen.
4. Bei zwei tatsächlich 0,20 mm hohen Schichten ergibt `0,40 mm` zwei Inlay-Schichten. In der Schichtvorschau erste Schichthöhe, den i-Punkt und die Innenräume beider `e` prüfen. Bei 74 mm Breite beträgt der kleinste Buchstabenabstand ungefähr 0,43 mm.
5. Ein Muster drucken. Beim Wenden Leserichtung prüfen, anschließend Karte einstecken, entnehmen und am üblichen Leser testen. Die Fitness-First- und Ohne-Logo-STLs aus der Kopie sind im Vergleich mit dem Desktop-Original bytegleich.

Der Ordner enthält die [geprüfte Einzel-STL mit 0,4 mm Höhe](recardnize-logo-60mm-0.4mm.stl). Die Hauptdatei und das Exportskript der Fertigung liegen in einem separaten lokalen Projekt. Dessen Testkopie übernimmt das vorhandene gespiegelte Einlegeverfahren. Dieses Repository enthält die Website und das Logo-Modul.

## 2. Bestellungen der richtigen Fertigung zuordnen

| Auswahl | Bestelldaten | Dateiausgabe |
| --- | --- | --- |
| Ohne Logo | beide Logo-Felder false | `orders.csv`, `include_logo=false` |
| Studio-Logo | bisheriges `with_logo=true` | `orders.csv`, `include_logo=true`, bestehender Ablauf |
| recardnize | neues `with_recardnize_logo=true` | `orders-recardnize.csv`, `logo_variant=recardnize` |

Die Testkopie verarbeitet `orders.csv` weiterhin im Standardzweig mit Ausgabe in `generated/`. Für `orders-recardnize.csv` wählt sie das neue Logo und erzeugt STL, Druckliste und Dashboard in `generated-recardnize/`. Das erhält beide Auftragslisten. Die zusätzliche Spalte steht am Ende. Im privaten Ordner liegt die genaue Bedienung für den Test und die Übernahme. Bei eindeutig erkannten Website-Zeilen ohne expliziten Preis rechnet der Generator mit 4,99 € und optional 1,00 € für das Band. Sonstige Eingaben verwenden die bisherige Preisregel.

## 3. Website-Entwurf freigeben

1. Staging-Kopie von Supabase verwenden. Vor der Migration die **tatsächliche** `public.create_order(jsonb)` prüfen. Sie muss den Preis serverseitig als 499 Cent plus gegebenenfalls 100 Cent für das Band bestimmen und die Nummer der neu erzeugten Bestellung zurückgeben. Die ältere eingecheckte Version weicht von der früher geprüften Live-Funktion ab. Eine frische Datenbank braucht deshalb zuerst diesen Abgleich. Die neue Migration prüft zusätzlich, ob `order_number` eindeutig ist.
2. Die [additive Migration](../supabase/migrations/20261118120000_add_recardnize_logo_orders.sql) zuerst in Staging anwenden. Sie ergänzt ein separates Kennzeichen, legt eine zweite Bestellfunktion an und verwendet für deren Preis und Bestellnummer die vorhandene Funktion. Alte Aufträge erhalten für das neue Kennzeichen den Standardwert false.
3. In der Testversion alle drei Optionen ohne und mit Band bestellen. In Admin bzw. Datenbank 499/599 Cent je Stück und Logo-Auswahl prüfen. Beide CSVs im tatsächlichen Fertigungsskript testen. Die CSV-Dateien enthalten keine Preis-Spalte.
4. Sobald der Drucktest und die Tests in Staging erfolgreich sind, die additive Migration für die produktive Datenbank freigeben und danach den Branch veröffentlichen. Bei einem späteren Rollback müssen recardnize-Aufträge weiterhin im neuen Export oder separat erfasst werden, bevor ein alter Admin-Stand wieder verwendet wird.

Geprüft wurden alle drei Varianten im Browser bis zur Bestellbestätigung mit einer lokalen Test-API. Die Migration lief separat in lokalem PostgreSQL mit Testdaten und einer nachgebildeten serverseitigen Preisfunktion. Der Zugriff auf die Lovable-Datenbank war in dieser Sitzung wegen eines internen Verbindungsfehlers nicht verfügbar.

## Eigene Website-Domain

Die schnellste Umstellung ist, `recardnize.com` als eigene Domain am bestehenden Lovable-Projekt zu verbinden. Die dafür angezeigten Web-DNS-Einträge bei IONOS setzen und die Mail-Einträge für hello@ beibehalten. Lovable verlangt für das erstmalige Verbinden einen bezahlten Tarif. [Lovable-Anleitung](https://docs.lovable.dev/features/custom-domain)

Unabhängiges Hosting ist ebenfalls möglich. Das GitHub-Projekt enthält die Website mit Layout, Bildern und Bestelllogik. Der aktuelle Build erzeugt einen Nitro-Worker für Cloudflare. Im lokalen Workers-Emulator liefern Startseite, Impressum, Datenschutz, Login und Logo-Datei bereits HTTP 200. Für den tatsächlichen Umzug zuerst eine Vorschau mit Testdatenbank und passenden Supabase-Einstellungen einrichten. Danach Bestellung, Admin-Anmeldung, CSV und die bestehende QR-Zieladresse prüfen. Erst dann die Domain umschalten. Für die üblichen Cloudflare Custom Domains ist eine aktive Cloudflare-DNS-Zone nötig. Bei einem Wechsel der Nameserver müssen die IONOS-Maileinträge vollständig übernommen werden. [Nitro auf Cloudflare](https://nitro.build/deploy/providers/cloudflare) · [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) · [IONOS-Mail mit externem DNS](https://www.ionos.de/hilfe/e-mail/problemloesungen-mail-basicmail-business/mx-eintraege-fuer-e-mail-empfang-ueber-ionos-mailserver-anpassen/)
