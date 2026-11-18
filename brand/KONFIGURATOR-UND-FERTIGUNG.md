# recardnize im Karten-Konfigurator und in der Fertigung

Stand 18.11.2026. Der Konfigurator ist im Branch `recardnize-logo-configurator` vorbereitet. Der bisherige Produktionsstand ist weiterhin `main`.

## 1. OpenSCAD am bestehenden Halter ergänzen

1. Die aktuelle Kartenhalter-SCAD samt eingebundenen Dateien und dem bisherigen Exportskript kopieren. Mit der unveränderten Fitness-First-Auswahl eine Referenz-STL bzw. die vorhandenen Materialteile exportieren. Dieselbe Druckausrichtung und dasselbe Slicer-Profil für den Vergleich nehmen.
2. [recardnize-logo.scad](recardnize-logo.scad) neben die Haupt-SCAD der Kopie legen. In der Hauptdatei `use <recardnize-logo.scad>` ergänzen. Das Modul `recardnize_logo(width=60, height=0.4)` zeichnet nur den Schriftzug. Seine lokale Unterkante liegt bei Y=0 und die Unterseite bei Z=0. Breite und Höhe lassen sich in Millimetern einstellen.
3. An derselben Logo-Position einen eigenen Zweig für recardnize hinzufügen. Der bestehende Fitness-First-Zweig und dessen Parameter bleiben erhalten. Orientierung, Zentrierung und Aussparung anhand der vorhandenen Hauptdatei bestimmen. Falls das alte Logo bündig oder mit der Druckseite nach unten gefertigt wird, die gleiche Methode auf die neue Form anwenden. OpenSCAD-`color()` beeinflusst die Vorschau. Für eine zweite Filamentfarbe dieselben Koordinaten für Grundkörper und Logo-Materialteil verwenden.
4. `0,40 mm` ist die gewählte Ausgangshöhe. Bei zwei tatsächlich 0,20 mm hohen Schichten passt das zu deinem jetzigen Verfahren. Erste Schicht und Z-Lage im Slicer prüfen. Bei 60 mm Schriftzugbreite ist der kleinste Buchstabenabstand ungefähr 0,35 mm. Darauf achten, dass der Slicer die Innenräume und den i-Punkt erhält. Falls ein Spalt zuläuft, zuerst die Breite oder die betroffenen Konturen anpassen, soweit die Druckfläche es erlaubt.
5. Drei Varianten mit denselben Einstellungen exportieren. Alt gegen neu für Fitness First vergleichen, anschließend die Variante ohne Logo und recardnize auf Position, Leserichtung, Farbwechsel und Passform prüfen. Für recardnize erst ein Muster drucken.

Der Ordner enthält die [geprüfte Einzel-STL mit 0,4 mm Höhe](recardnize-logo-60mm-0.4mm.stl). Die Hauptdatei und das Exportskript der Fertigung liegen in einem separaten lokalen Projekt. Dessen Testkopie übernimmt das vorhandene gespiegelte Einlegeverfahren. Dieses Repository enthält die Website und das Logo-Modul.

## 2. Bestellungen der richtigen Fertigung zuordnen

| Auswahl | Bestelldaten | Dateiausgabe |
| --- | --- | --- |
| Ohne Logo | beide Logo-Felder false | `orders.csv`, `include_logo=false` |
| Studio-Logo | bisheriges `with_logo=true` | `orders.csv`, `include_logo=true`, bestehender Ablauf |
| recardnize | neues `with_recardnize_logo=true` | `orders-recardnize.csv`, `logo_variant=recardnize` |

Den bestehenden CSV-Import weiter mit `orders.csv` betreiben. Für `orders-recardnize.csv` einen getrennten Eingabezweig hinzufügen, der den neuen Modulaufruf wählt. Die zusätzliche Spalte steht am Ende. Der Import sollte einen fehlenden bzw. unbekannten Variantenwert melden. Beim automatischen Start von OpenSCAD dieselbe Übergabetechnik wie bei den bisherigen Bestellungen verwenden und zulässige Logo-Varianten fest vorgeben. Eine STL oder ein Satz Materialteile je Auftrag mit der Bestellnummer als Zuordnung ablegen.

## 3. Website-Entwurf freigeben

1. Staging-Kopie von Supabase verwenden. Vor der Migration die **tatsächliche** `public.create_order(jsonb)` prüfen. Sie muss den Preis serverseitig als 499 Cent plus gegebenenfalls 100 Cent für das Band bestimmen und die Nummer der neu erzeugten Bestellung zurückgeben. Die ältere eingecheckte Version weicht von der früher geprüften Live-Funktion ab. Eine frische Datenbank braucht deshalb zuerst diesen Abgleich. Die neue Migration prüft zusätzlich, ob `order_number` eindeutig ist.
2. Die [additive Migration](../supabase/migrations/20261118120000_add_recardnize_logo_orders.sql) zuerst in Staging anwenden. Sie ergänzt ein separates Kennzeichen, legt eine zweite Bestellfunktion an und verwendet für deren Preis und Bestellnummer die vorhandene Funktion. Alte Aufträge erhalten für das neue Kennzeichen den Standardwert false.
3. In der Testversion alle drei Optionen ohne und mit Band bestellen. In Admin bzw. Datenbank 499/599 Cent je Stück und Logo-Auswahl prüfen. Beide CSVs im tatsächlichen Fertigungsskript testen. Die CSV-Dateien enthalten keine Preis-Spalte.
4. Sobald der Drucktest und die Tests in Staging erfolgreich sind, die additive Migration für die produktive Datenbank freigeben und danach den Branch veröffentlichen. Bei einem späteren Rollback müssen recardnize-Aufträge weiterhin im neuen Export oder separat erfasst werden, bevor ein alter Admin-Stand wieder verwendet wird.

Geprüft wurden alle drei Varianten im Browser bis zur Bestellbestätigung mit einer lokalen Test-API. Die Migration lief separat in lokalem PostgreSQL mit Testdaten und einer nachgebildeten serverseitigen Preisfunktion. Der Zugriff auf die Lovable-Datenbank war in dieser Sitzung wegen eines internen Verbindungsfehlers nicht verfügbar.

## Eigene Website-Domain

Die schnellste Umstellung ist, `recardnize.com` als eigene Domain am bestehenden Lovable-Projekt zu verbinden. Die dafür angezeigten Web-DNS-Einträge bei IONOS setzen und die Mail-Einträge für hello@ beibehalten. Lovable verlangt für das erstmalige Verbinden einen bezahlten Tarif. [Lovable-Anleitung](https://docs.lovable.dev/features/custom-domain)

Unabhängiges Hosting ist ebenfalls möglich. Das GitHub-Projekt enthält die Website mit Layout, Bildern und Bestelllogik. Der aktuelle Build erzeugt einen Nitro-Worker für Cloudflare. Im lokalen Workers-Emulator liefern Startseite, Impressum, Datenschutz, Login und Logo-Datei bereits HTTP 200. Für den tatsächlichen Umzug zuerst eine Vorschau mit Testdatenbank und passenden Supabase-Einstellungen einrichten. Danach Bestellung, Admin-Anmeldung, CSV und die bestehende QR-Zieladresse prüfen. Erst dann die Domain umschalten. Für die üblichen Cloudflare Custom Domains ist eine aktive Cloudflare-DNS-Zone nötig. Bei einem Wechsel der Nameserver müssen die IONOS-Maileinträge vollständig übernommen werden. [Nitro auf Cloudflare](https://nitro.build/deploy/providers/cloudflare) · [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) · [IONOS-Mail mit externem DNS](https://www.ionos.de/hilfe/e-mail/problemloesungen-mail-basicmail-business/mx-eintraege-fuer-e-mail-empfang-ueber-ionos-mailserver-anpassen/)
