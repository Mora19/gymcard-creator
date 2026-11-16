# Recardnize – freigegebener Logoentwurf A

Stand: 16.11.2026. Diese Dateien zeichnen die tatsächlich ausgewählte Wortmarke **recardnize** nach. Es wurde keine Schriftart ersetzt und kein neues Logo generiert. Buchstabenform, Abstand, Schreibweise, abgeschrägte Ecken und der getrennte i-Punkt stammen aus der freigegebenen Vorlage.

## Direkt nutzbare Dateien

| Datei | Verwendung |
| --- | --- |
| `recardnize-logo.svg` | Transparente Website-/Druckvorlage: `re` und `nize` in `#F7F7F7`, `card` in `#EF3340`; für dunklen Grund. |
| `recardnize-logo-dark.svg` | Identische Geometrie, `re`/`nize` in `#151619`; für hellen Grund. |
| `recardnize-logo-mono.svg` | Identische Geometrie, vollständig schwarz; für CAD-/Vektorimport. |
| `recardnize-logo-60mm.svg` | Einfarbige CAD-SVG mit expliziten mm-Einheiten; sichtbare Wortmarke exakt 60 mm breit. |
| `recardnize-logo.scad` | Eigenständige parametrische 3D-Quelldatei mit eingebetteten Polygonen; benötigt weder Schrift noch SVG-Dateipfad. |
| `recardnize-logo-60mm.stl` | Fertig trianguliertes Relief, **60 × 9,04065 × 0,6 mm**. |
| `recardnize-logo-100mm.stl` | Größere Probe, **100 × 15,06775 × 0,6 mm**; kein passendes Kartenhaltermaß zugesichert. |
| `recardnize-logo-60mm-card.stl` | Nur die vier Buchstaben `card`, an ihrer unveränderten Position; für rote Materialzuweisung. |
| `recardnize-logo-60mm-re-nize.stl` | Die übrigen Buchstaben und der i-Punkt, ebenfalls in denselben Koordinaten. |
| `recardnize-logo-preview.png` | Ausschließlich Vorschau der fertigen SVG auf dunklem Grund; keine Produktionsquelle. |
| `recardnize-logo-dark-preview.png`, `recardnize-logo-mono-preview.png` | Entsprechende Vorschauen auf hellem Grund. |
| `recardnize-logo.geometry.json`, `validation.json` | Konturpunkte, Herkunft, Parameter und technische Prüfergebnisse. |

Die drei SVGs liegen für die Website zusätzlich unter `src/assets/brand/`. Die Kopien sind bytegleich. Ein SVG enthält elf geschlossene Pfadobjekte und vier echte Innenaussparungen (beide `e`, `a`, `d`), keinen `<text>` und kein eingebettetes Rasterbild. Der Hintergrund ist transparent. Das enge `viewBox="-1 -1 1847 280"` enthält einen Sicherheitsrand von einer Vorlageneinheit. Die sichtbare Geometrie selbst ist 1845 × 278 Einheiten groß. SVG-Breiten-/Höhenattribute dienen der Bildschirmdarstellung; beim CAD-Import immer ausdrücklich die gewünschte Breite in Millimetern einstellen.

**Für CAD bevorzugt `recardnize-logo-60mm.svg` importieren:** Diese zusätzliche Datei hat dieselben schwarzen Pfade, aber `width="60.065040650407mm"` und `height="9.105691056911mm"`. Das schließt den Sicherheitsrand ein; die sichtbare Geometrie bleibt **60 × 9,04065 mm**. Die drei Website-SVGs besitzen dagegen Bildschirmmaße ohne mm-Einheit und können von CAD-Programmen als Pixel interpretiert werden. Nach einem Import die tatsächliche Breite kontrollieren; Programme behandeln SVG-Einheiten teilweise unterschiedlich.

## 3D verwenden und skalieren

1. STL im Slicer mit **Millimeter** als Einheit öffnen. STL speichert selbst keine Einheit und keine Materialfarben.
2. Für eine andere Größe die SCAD-Datei öffnen, `logo_width` (Gesamtbreite in mm) und `relief_height` (Reliefhöhe in mm) ändern, rendern und STL exportieren. Standard: `logo_width = 60`, `relief_height = 0.6`. Die Proportionen bleiben erhalten: Höhe = Breite × 278 / 1845.
3. Das Modell besteht absichtlich aus **elf getrennten geschlossenen Volumina**: zehn Buchstaben plus i-Punkt. Es enthält **keine Basisplatte, Verbindungsstege, Einlassung oder Klebeauflage**. Für ein erhabenes Logo auf dem Kartenhalter die Formen in der richtigen Lage mit dessen tatsächlichem Oberflächenkörper verbinden. Die vorhandene Kartenhaltergeometrie wurde hier nicht verändert.
4. Bei zwei Materialien die beiden 60-mm-Farbteile **gemeinsam als Teile eines Objekts importieren** und ihre ursprünglichen Koordinaten behalten. Einzelnes automatisches Zentrieren zerstört die Ausrichtung. Materialfarben anschließend im Slicer zuweisen. Alternativ das vollständige STL als einfarbiges Relief verwenden.

**Vor einem Seriendruck bleiben Slicer-Prüfung und Probedruck nötig.** Geometrieprüfung bestätigt noch keine Haftung, Passung, Oberflächenqualität oder Materialverträglichkeit. Der kleinste modellierte Abstand zwischen benachbarten Teilen beträgt bei 60 mm Breite etwa **0,350 mm** (`r` zu `d`); eine 0,4-mm-Düse und Materialfluss können diesen Spalt beeinflussen. Auch die kleinen `e`-Innenräume und den getrennten i-Punkt in der Schichtvorschau kontrollieren. Die 100-mm-Probe vergrößert diesen Mindestabstand auf etwa 0,584 mm. Ohne Maß-/Druckprüfung das Modell nicht beliebig verkleinern. Die tatsächliche Ausrichtung und Z-Lage auf dem gewünschten Kartenhalter müssen anhand dessen vorhandenen CAD-Modells festgelegt werden.

## Herkunft und deterministische Umwandlung

- Vorlage: `recardnize-konzept-a-wortmarke.png`, 2172 × 724 Pixel, ausdrücklich gewählter Entwurf A.
- SHA-256 der unveränderten Vorlage: `6da57cf2aeea4731e8cdb37eacf5ba626638582cd611d9348a7299a5748fc830`.
- Konturermittlung aus der Helligkeitsmaske `max(R,G,B) > 120`; Konturen unter 30 Quadratpixeln werden als Rauschen verworfen. Die Vorlage wird nur gelesen und nicht verändert. Es wurden keine Zwischenbilder als Logo ausgeliefert.
- Hierarchische Konturen bewahren Außenformen und Innenlöcher. Douglas-Peucker-Vereinfachung mit maximal 0,75 Vorlagenpixeln reduziert Pixelrauschen; scharfe Ecken bleiben als echte Pfadecken erhalten. Das Ergebnis verwendet Polygonpfade statt fontabhängiger Textobjekte. Keine automatische Neugestaltung, keine Schrift- oder Abstandskorrektur.
- Gemessene maximale Konturabweichung gegenüber der segmentierten Vorlage: **0,749532 Pixel**, entsprechend **0,024375 mm** bei 60 mm Gesamtbreite. Dies ist eine Abweichung gegenüber der ermittelten Pixelkontur, keine zugesicherte Fertigungstoleranz.
- Sämtliche SVG-Farbvarianten, SCAD und STL stammen aus denselben Konturpunkten. Für 3D wird nur die vertikale SVG-Koordinatenrichtung gespiegelt und in mm skaliert, damit die Schrift bei Betrachtung von oben korrekt lesbar bleibt. Z reicht von 0 bis 0,6 mm.
- Triangulierung: Mapbox Earcut; Extrusion und STL-Ausgabe: Trimesh. Die Wiederherstellung ist in `tools/trace-logo.py` enthalten. Aufruf mit Python: `python tools/trace-logo.py PFAD_ZUR_FREIGEGEBENEN_PNG --root REPOSITORYORDNER`. Benötigte Pakete/Versionen stehen in `validation.json`; keine dieser Bibliotheken ist eine Laufzeitabhängigkeit der Website.
- `tools/render-preview.cjs` rendert ausschließlich die fertigen SVGs mit Sharp zu QA-Vorschauen. Die PNG-Vorschau ist kein Ersatz für die Vektordatei.

## Prüfung

Die exportierten binären STL-Dateien wurden erneut eingelesen und auf geschlossene Flächen, konsistente Orientierung, positives Volumen und die erwarteten Millimeterabmessungen geprüft. Alle elf Einzelkörper sind geschlossen. Die Topologie enthält exakt die vier Innenlöcher der Vorlage; es gibt keine zusätzlichen Rauschinseln oder versehentlichen Hohlräume.

| STL | Außenmaße in mm | Volumen in mm³ | Dreiecke |
| --- | --- | --- | --- |
| 60 mm | 60 × 9,04065 × 0,6 | 152,501 | 1840 |
| 100 mm | 100 × 15,06775 × 0,6 | 423,614 | 1840 |

Die SVG wurde gerendert und mit der Vorlage visuell verglichen. OpenSCAD war in dieser Arbeitsumgebung nicht installiert; die SCAD-Datei wurde deshalb nicht mit OpenSCAD kompiliert. Die tatsächlich gelieferten STL-Dateien wurden unabhängig davon direkt erzeugt und technisch geprüft. Die Parameterdatei bleibt für spätere Anpassungen verfügbar.
