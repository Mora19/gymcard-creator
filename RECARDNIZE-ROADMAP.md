# recardnize – Entscheidungen, Ideen und nächste Schritte

Stand: 16.11.2026. Diese Datei hält die Nutzerideen dauerhaft im Repository fest. Ein Konzept in dieser Liste ist noch kein bestellbares Produkt und keine zugesagte Funktion.

## Bestätigte Entscheidungen

- Markenname: **recardnize**, statt GymTag. Zunächst „recardnize Kartenhalter“ als Produktbezeichnung; keine zusätzliche Produktmarke erforderlich. Name bewusst für spätere Anwendungen außerhalb des Gyms offenhalten.
- Logo: Moritz hat **Entwurf A** ausgewählt – reine geometrische Wortmarke, „re“/„nize“ hell und „card“ rot. Die ausgewählte Form wird als Vektor in die Website übernommen und für CAD/3D-Druck aufbereitet.
- `recardnize.com` hat Moritz nach eigener Auskunft bei IONOS registriert. Domainkontostatus, Verlängerung, DNS und Markenrechte sind hier nicht geprüft.
- E-Mail: **`hello@recardnize.com`**. Moritz bestätigt am 16.11.2026, dass das Postfach getestet ist und funktioniert. Die zentrale Kontaktadresse ist auf der Website umgestellt; die bestehende Admin-Anmeldung wird dadurch nicht verändert.
- Ansprechpartner und alleiniger Anbieter: Moritz Klösters. Veröffentlichbare vollständige Anschrift und abschließende Datenschutzangaben fehlen weiterhin.
- Preise und Bestelltechnik bleiben bestehen: 4,99 € Basis, 5,99 € mit Band, Supabase/Admin/CSV. Bestehende Website-/QR-Adresse wird nicht automatisch geändert.

## Jetzt umgesetzt

- Sichtbare Marke und Seitentitel auf recardnize umgestellt, auch Studio-Anfrage, Impressum/Datenschutz und Admin-Anzeige. Bilddateinamen, Backend und Auftragsdaten bleiben bestehen.
- Studio-Bereich um konkrete Alltagssituationen und einen gemeinsam abzustimmenden kleinen Praxistest ergänzt. Keine bestehende Kooperation, Mengen, Lieferfähigkeit, kostenlose Muster oder nachgewiesene Verlustreduktion behauptet.
- WhatsApp bietet bewusst Browser oder installierte App an. App-Link ohne neues Fenster; Browser-Link direkt zu WhatsApp Web. Nummer und Nachricht sind zusätzlich kopierbar, bei blockierter Zwischenablage manuell auswählbar. Kein automatisches Öffnen nach Bestellung, kein automatischer Nachrichtenversand.
- Vier Logo-Richtungen als Bildkonzepte im lokalen Ordner `../recardnize-logo-konzepte/`; **A ist ausgewählt**. Verwendbare Vektor- und Modelldateien sowie Maße/Druckhinweise werden unter `brand/` dokumentiert.
- Fertiger 22-Sekunden-Fototeaser unter `../recardnize-produktvideo/`, Full HD, mit Originalfotos, Logo A und hello@. Noch nicht in die öffentliche Website eingebunden; keine gefilmte Leser-/Einsteckdemo.
- Isolierter lokaler Logo-Prototyp unter `../recardnize-konzepte/logo-upload/`: PNG/JPEG und ein eingeschränktes SVG-Subset im Browser prüfen, einfarbige Konturen proportional in eine Millimeterfläche einpassen und als SVG-Entwurf exportieren. Keine Übertragung, Bestellintegration oder automatische Druckfreigabe.

## Vor dem ersten Website-Link an Fitness First

| Schritt | Verantwortlich / Stand | Zweck |
| --- | --- | --- |
| Logo-Richtung auswählen | Moritz; A ausgewählt | Wortmarke als SVG und flaches Modell ausarbeiten; Probedruck am Halter |
| Postfach einrichten und testen | Moritz; funktioniert laut Bestätigung | Website-Kontakt auf hello@ umgestellt; Absendername/Signatur und Mailauthentifizierung bei Bedarf prüfen |
| Domain absichern | Moritz / IONOS; nicht im Konto geprüft | 2FA, aktuelle Zahlungs-/Inhaberdaten, Verlängerung, Transfer Lock; Auth-Code privat halten |
| Betreiber-/Datenschutzangaben vervollständigen | Moritz; Anschrift und kontospezifische Angaben fehlen | Öffentliche Seite und tatsächliche Datenerhebung korrekt beschreiben |
| Produktangaben bestätigen | Moritz; Material, Maße und Fertigungskapazität offen | Keine erfundenen technischen Daten oder Lieferzusagen |
| Kurzes echtes Video aufnehmen | Moritz; offen | Einstecken/Entnehmen, Beschriftung, Band und eigener Lesertest; keine fremden Personen/Mitgliedsdaten |
| Website öffentlich aktualisieren und testen | nach GitHub-/Lovable-Abgleich | Desktop/Mobil, reale Bestellung mit/ohne Band, Admin/CSV und vorhandenen QR vor Ort prüfen |
| Erste Kooperationsanfrage vorbereiten | gemeinsam; kein Versand erfolgt | Zwei reale Produktfotos und Link; Interesse an Muster und begrenztem Test erfragen |

Die bisherige positive informelle Rückmeldung aus Heilbronn ist kein offizielles Testimonial und keine Freigabe. Zuständigkeit, Testumfang, Kosten, Dauer, Logo-Nutzung und nächster Ansprechpartner müssen gemeinsam geklärt werden. Für das erste Gespräch braucht es noch kein Trackerprodukt oder Kontaktportal.

## Nutzerideen – ausdrücklich festgehalten

### 1. Wortmarke und wiedererkennbares Kartenlogo

- Nutzeridee: „re“ und „nize“ in einer Farbe, „card“ hervorgehoben; mehrere kreative Alternativen vergleichen.
- Nach Auswahl: saubere SVG-Pfade ohne Schriftabhängigkeit, farbige und einfarbige Variante, optional kleines eigenständiges Signet.
- **Erst im nächsten Schritt** für 3D-Druck ausarbeiten: Zielgröße, Düsenbreite, Linien-/Spaltbreite, verfügbare Fläche und erhabene/eingelassene Ausführung festlegen; Probedruck. Rasterkonzept ist keine druckfertige STL.
- Danach recardnize-Logo optional als auswählbare Gestaltung statt leerer Fläche; bestehende Studio-Logo-Option nicht stillschweigend umdeuten.

### 2. QR-Fundkontakt ohne offen sichtbare Telefonnummer

- Nutzeridee: an Hidden Contact angelehnt; Finder scannt QR, wählt Anliegen auf Website und Besitzer erhält eine Benachrichtigung, gegebenenfalls über WhatsApp.
- Priorität nach Erstkontakt: ein einfacher, nachvollziehbarer Fundkontakt ist näher am Kernnutzen als ein komplexer Tracker.
- Ein QR mit direktem `wa.me`, `whatsapp://` oder persönlichem `mailto:` verbirgt die Daten nicht. Für einen vermittelten Kontakt ist ein eigener geschützter Dienst oder passender externer Anbieter nötig.
- Denkbarer erster Entwurf: zufälliger nicht erratbarer Token pro Halter; Finder meldet einen Fund ohne öffentliche Kontaktdaten; Besitzer erhält Nachricht über einen bestätigten Kanal. Token sperrbar/neu zuweisbar; Missbrauchsmeldung, Begrenzung von Anfragen, Löschung und Datenschutz einplanen.
- WhatsApp-Automation erst prüfen: API/Anbieter, Einwilligung, Vorlagen, Kosten, Zustellung und alternative Benachrichtigung. Keine private WhatsApp-Automatisierung als zugesicherte Funktion verkaufen.
- Der individuelle Fundkontakt-QR ist ein neues Konzept und ersetzt nicht den bestehenden Website-QR.
- Konkrete Wege sind recherchiert: **HiddenContact/BrandTags OEM** (Aktivierungslinks/Branding für eigene Produkte, aktueller Kleinserienpreis nur per Angebot), **eigener Docker-Dienst** auf Homeserver und später ggf. VPS, oder vorhandenes bezahltes **Supabase** mit Transaktionsmail. Entscheidungsvorlage im lokalen Dokument `../recardnize-konzepte/qr-fundkontakt.md`.
- Für den ersten eigenen Test E-Mail-Benachrichtigung statt WhatsApp-Automation. Brevo als separater EU-orientierter Versanddienst oder vorhandenes IONOS-SMTP prüfen. Keine Website-/Mail-DNS-Einträge ändern, bevor Domain-/Tunnelkonzept feststeht.
- Homeserver-Software, Docker-Unterstützung und bestehende öffentliche Erreichbarkeit sind beim Nutzer angefragt; noch keine Zugänge oder Serveränderungen.

### 3. Version mit Trackerkarte

- Nutzeridee: zusätzlicher Steckplatz für Trackerkarte, mindestens deutlich dicker; vermutlich nur von einer Seite zuverlässig an den Leser zu halten.
- Annahmen sind noch ungetestet. Vor Angebot mechanisches Muster mit konkret gewählter Trackerkarte, Passform, Signal, Leserfunktion, Gewicht und Entnahme prüfen. Keine Ortungs-/RFID-Garantie.
- Zusätzliche Kosten, Akku-/Batteriepflege und mögliche Plattformbindung gegen Nutzen abwägen. Vorerst separate spätere Variante statt Standardprodukt aufblasen.

### 4. Eigene Logos hochladen und druckbar umwandeln

- Nutzeridee: eigene Logos hochladen, sinnvoll skalieren und in druckbare Form umwandeln.
- Kurzfristig eigene Motive per E-Mail prüfen und Layout manuell freigeben; so sind noch kein Uploaddienst und keine vollautomatischen Druckversprechen nötig.
- Später: geeignete Dateiformate, Rechtebestätigung, Größen-/Komplexitätsgrenzen, sichere Verarbeitung, Mindestlinien, Kontrast und Freigabe vor Druck. Vektorisierung benötigt oft Nacharbeit; nicht jedes Foto/Logo eignet sich automatisch.
- Erster lokaler Prototyp vorhanden (siehe oben). Produktionsweg bleibt: lokale Vorschau → bewusster privater Upload → isolierte erneute Prüfung/Umwandlung → feste Millimeterfläche/Mindeststärken → persönliche Gestaltungs-/Druckfreigabe. Gute SVG-Konturen möglichst erhalten; mehrfarbige Rasterbilder gesondert aufbereiten.

### 5. Weitere Anwendungen und Marketing

- Marke über Fitness hinaus offenhalten: personalisierte Kartenhalter und Wiedererkennung, ohne schon weitere Produkte zu versprechen.
- Echte kurze Anwendungsvideos zuerst. Problemszenen an neutraler Ablage nachstellen; keine erfundenen Funktionsnachweise oder vermeintlich echten Studio-Kooperationen durch KI-Bilder.
- Spätere Ergänzungen: Studio-Musterpaket, kompakter Produktsteckbrief, manuelle Gestaltungsfreigabe, dokumentierte Passform-/Lesertests. Nachfrage und Fertigungskapazität vor einer großen Variantenliste prüfen.
- Weitere sinnvolle nächste Verbesserungen: ein echter Halter mit Logo A als Musterfoto; bestätigte Maße, Material, Pflegehinweise und Fertigungskapazität in einem kurzen Produktsteckbrief; gut lesbare Kennzeichnung der Studio-Logo-Fotos als Gestaltungsbeispiel; QR-Kontrast/Größe und Scanbarkeit am echten Halter prüfen. Keine unbekannten Produktdaten erfinden.

## Domain, E-Mail und Hosting

Die registrierte Domain kann niemand durch ein billigeres Angebot einfach übernehmen. Risiken sind insbesondere Ablauf/Nichtverlängerung oder ein unberechtigter Kontozugriff. Registrierung ist unabhängig von einer Markenanmeldung; vor größerer Logo-/Druckinvestition Namens-/Markenrecherche durchführen. Kein Ergebnis einer vollständigen Ähnlichkeitsrecherche liegt vor.

Empfehlung vorerst: Domain und Postfach bei IONOS, Website bei bestehendem Lovable-Hosting. Nur DNS verbinden, keinen Domaintransfer auslösen; dabei bestehende Mail-Einträge erhalten. Ein Hostingwechsel kann später separat erfolgen.

Das Repository enthält TanStack Start mit serverseitigen Funktionen und Supabase. Es ist keine reine statische HTML-Seite, die unverändert in ein Mail-/Webspacepaket kopiert werden kann. IONOS Deploy Now unterstützt laut FAQ Node nur für den Build, nicht als SSR-Laufzeit. Ein geeigneter Server/VPS wäre ein eigener Betriebs- und Migrationsschritt. GitHub hält den Quellcode unabhängig verfügbar; Datenbank, Auth, Secrets und Hosting müssen bei jedem Umzug getrennt geplant werden. Die älteren eingecheckten Datenbankmigrationen müssen vor einer Neuinstallation mit dem tatsächlichen Live-Stand abgeglichen werden.

## Quellen

- IONOS Transfer Lock / Auth-Code: https://www.ionos.de/hilfe/index.php?id=218
- IONOS automatische Verlängerung: https://www.ionos.de/hilfe/domains/laufzeiten-und-kuendigung/automatische-verlaengerung-einer-domain/
- IONOS Kontosicherheit: https://www.ionos.de/hilfe/sicherheit/kontosicherheit-erhoehen/sicherheit-ihres-11-ionos-kontos-erhoehen/
- IONOS SPF: https://www.ionos.de/hilfe/domains/mailserver-und-verwandte-records-konfigurieren/spam-versand-vermeiden-mit-spf-record/
- IONOS DKIM: https://www.ionos.de/hilfe/domains/mailserver-und-verwandte-records-konfigurieren/e-mail-authentifizierung-mit-dkim/
- Lovable Hosting und Portabilität: https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership
- Lovable eigene Domain: https://docs.lovable.dev/features/custom-domain
- IONOS Deploy Now: https://docs.ionos.space/docs/faq/
- DPMA Markenrecherche: https://www.dpma.de/marken/markenrecherche/
- Fitness First Marketingkontakt: https://www.fitnessfirst.de/service/kontakt
- Hidden Contact vermittelt Fundnachrichten: https://hiddencontact.com/
- WhatsApp Click-to-Chat enthält die vollständige Zielnummer: https://faq.whatsapp.com/5913398998672934
- WhatsApp Business-Nutzungsregeln: https://whatsappbusiness.com/policy/

Es wurden keine Domain-/DNS-Verträge geändert, keine kostenpflichtigen Angebote gebucht und keine Kooperationsmail versandt.
