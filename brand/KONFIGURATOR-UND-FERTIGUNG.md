# recardnize im Konfigurator und in der Fertigung

Stand 22.11.2026. Die Website-Änderungen liegen im GitHub-Branch `recardnize-logo-configurator`. Der Druckgenerator liegt in der privaten Arbeitskopie des Desktop-Ordners.

## recardnize drucken

1. Lege im Ordner der Arbeitskopie den Admin-Export als **orders-recardnize.csv** ab und öffne **START_RECARDNIZE.bat**. Für einen Test mit Beispieldaten verwende `.\START_SYNTHETISCH.ps1 -Variante recardnize`. Jeder Auftrag landet in seinem eigenen Ordner unter **generated-recardnize**.
2. Öffne das erzeugte Bambu-Studio-Projekt, falls vorhanden. Alternativ importiere die Halterbasis und die farbig benannten Inlay-STLs gemeinsam als Teile eines Objekts. Behalte deren Positionen bei. **Weiß** ist `re` und `nize`, **Rot** ist `card`. Name und Telefonnummer kommen zur gewählten Textfarbe.
3. Prüfe am Bambu Lab P2S die Zuordnung der AMS-Filamente. Wähle die strukturierte PEI-Platte und 0,20 mm für die ersten beiden Schichten. Der bündige Farbeinsatz misst 0,40 mm. Die Platte erzeugt die Oberflächenstruktur. Beide Halterteile werden in der vorhandenen Druckorientierung geslicet.
4. Prüfe in den ersten beiden Schichten Weiß, Rot und Grundfarbe sowie den i-Punkt und die Innenräume. Drucke ein Muster und prüfe Leserichtung, Passform und Kartenleser.

Das [OpenSCAD-Modul](recardnize-logo.scad) verwendet dieselbe Wortmarke wie die Website. Mit `recardnize_logo(width=74, height=0.4, part="re-nize")` und `part="card"` entstehen die Farbteile in denselben Koordinaten. Die Standardoption `part="all"` erzeugt weiterhin die komplette Kontur. Der Halter, die Anordnung der beiden Teile und die Fitness-First-Geometrie bleiben erhalten.

## Varianten und Preise je Stück

| Auswahl | Ohne Band | Mit Band | Admin-Export |
| --- | ---: | ---: | --- |
| Ohne Logo | 4,99 € | 5,99 € | `orders.csv` |
| Studio-Logo mit Freigabe | 5,99 € | 6,99 € | `orders.csv` |
| recardnize in Weiß und Rot | 4,99 € | 5,99 € | `orders-recardnize.csv` |

Der Standardexport läuft weiterhin über **START_GENERATOR.bat**. Beide Admin-CSVs übertragen den tatsächlich gespeicherten Stückpreis in `unit_price`. Frühere Studio-Bestellungen behalten ihren Betrag. Historische CSVs ohne die Spalte behalten ihren bisherigen Preis-Fallback. Beim recardnize-Export kennzeichnet `logo_variant=recardnize` die Druckvariante.

Die Vorschau beruht auf dem gemessenen Halter mit 96 × 64 mm Hauptkörper und mittiger 5 × 14 mm Bandöffnung. Beim recardnize-Logo stehen Schwarz und Dunkelgrau für den Halter sowie Rot und Weiß für die Beschriftung zur Auswahl.

## Website freigeben

- Teste die komplette Supabase-Migrationsfolge zuerst im separaten Testprojekt. Die Migration für das Logo-Feld fügt den recardnize-Bestellweg hinzu. Die beiden nachfolgenden Migrationen sichern die serverseitige Preisberechnung und ergänzen den Studio-Aufpreis. Bei einer unbekannten produktiven Bestellfunktion bricht die Preis-Migration ab und muss vor dem nächsten Versuch geprüft werden.
- Teste alle sechs Kombinationen aus Logo und Band, mindestens eine Menge größer als eins und beide CSVs im Fertigungsgenerator. Teste parallel die Admin-Anmeldung und den Bestand historischer Bestellungen.
- Schalte den produktiven Checkout während des gemeinsamen Wechsels von Datenbank und Webbuild ab. Eine ältere Seite könnte sonst noch 4,99 € anzeigen, während die neue Datenbank für Studio 5,99 € speichert. Prüfe Preis und Export vor dem Öffnen. Bei einem Rollback den Checkout erneut kurz pausieren und recardnize-Aufträge weiter getrennt exportieren.
- Details zur Testumgebung und eigenen Domain stehen in [HOSTING.md](../HOSTING.md).
