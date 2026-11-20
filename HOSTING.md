# recardnize auf eigener Domain

Die Website mit Layout, Bildern, Konfigurator und Admin liegt im GitHub-Repository. Der Build erzeugt einen Cloudflare Worker. Bestellungen und Admin brauchen seine Server-Laufzeit. Der bestehende Domain- und Mailvertrag für `recardnize.com` kann bei IONOS bleiben. [Lovable über unabhängiges Hosting](https://docs.lovable.dev/tips-tricks/deployment-hosting-ownership) · [Nitro auf Cloudflare](https://nitro.build/deploy/providers/cloudflare)

## Hosting wählen

| Option | Kosten laut Anbieter | Für diese Website |
| --- | --- | --- |
| Cloudflare Workers | Free für die Vorschau, Paid ab 5 US-Dollar/Monat plus Nutzung oberhalb des Kontingents | Der vorhandene Build passt. Beim Free-Tarif stehen pro Aufruf 10 ms CPU zur Verfügung. Für den öffentlichen Bestellbetrieb empfiehlt sich bei SSR der Paid-Tarif. [Preise](https://developers.cloudflare.com/workers/platform/pricing/) · [SSR-Limits](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/) |
| IONOS Deploy Now | Tarifabhängig | Baut JavaScript-Projekte und hostet statische Dateien oder PHP. Für die laufenden TanStack-Serverfunktionen wäre ein anderer Tarif erforderlich. [IONOS Deploy Now FAQ](https://docs.ionos.space/docs/faq/) |
| IONOS VPS S+ | 5 €/Monat, 10 € Einrichtung | Ein eigener Linux-Server könnte den Node-Build ausführen. Updates, HTTPS, Monitoring und Wiederherstellung liegen bei dir. Der Node-Build braucht einen eigenen Abnahmetest. [IONOS VPS](https://www.ionos.de/server/vps) |
| Lovable Pro | Ab 25 US-Dollar/Monat laut Preisliste | Integrierter Editor und Custom Domain. Für einen unabhängigen Betrieb sind GitHub und passend eingerichtete Backend-Dienste ausreichend. [Lovable-Preise](https://lovable.dev/pricing) |

## 1. Lokal in der Cloudflare-Laufzeit prüfen

Im Repository mit installierten Projektabhängigkeiten und Node.js 24 in PowerShell starten. Der Vorbereitungsbefehl baut mit Platzhalterwerten und prüft das Upload-Format. Die Ausgabe liegt unter `.output`. Alle Aufrufe benutzen `recardnize-staging` als Worker-Namen.

```powershell
.\scripts\prepare-worker-preview.ps1
npx.cmd --prefer-offline --yes wrangler@4.164.0 dev --local --config .output/server/wrangler.preview.json --ip 127.0.0.1 --port 8793
```

Öffne `http://127.0.0.1:8793`. Prüfe Startseite, Bilder, Logos, Rechtslinks, `/auth` und Weiterleitung von `/admin`. `Strg+C` beendet den lokalen Worker. Der lokale Modus verwendet eine reservierte `.invalid`-Adresse für Supabase.

## 2. Vorschau mit eigenem Supabase-Testprojekt bereitstellen

1. Melde dich im [Supabase Dashboard](https://supabase.com/dashboard/) an und lege ein separates Testprojekt an. Übernimm ausschließlich das Schema. Verwende für das Testen erfundene Bestelldaten und einen separaten Test-Admin.
2. Die Supabase-Migrationen richten die Preisberechnung je Stück, die eindeutige Bestellnummer und die zusätzliche Logo-Variante ein. Die komplette Folge wurde lokal mit Testdaten geprüft. Wende sie in einem separaten Checkout ausschließlich auf das Testprojekt an. Kontrolliere die in `supabase link` angegebene Projekt-ID vor dem Dry-run und vor dem anschließenden Push. [Supabase-Migrationen](https://supabase.com/docs/guides/deployment/database-migrations)

   ```powershell
   npx.cmd supabase login
   npx.cmd supabase link --project-ref DEIN_TESTPROJEKT
   npx.cmd supabase db push --dry-run
   npx.cmd supabase db push
   ```

   Lege für den Test-Admin in **Authentication → Users** einen bestätigten Benutzer an. Kopiere die UUID dieses Benutzers und führe im **SQL Editor** des Testprojekts folgendes aus. Prüfe in den Anmelde-Einstellungen auch die Vorschau-Adresse.

   ```sql
   insert into public.user_roles (user_id, role)
   values ('UUID_DES_TESTBENUTZERS', 'admin');
   ```

3. Öffne im Testprojekt **Connect** bzw. **Settings → API Keys** und kopiere die **Project URL** und den **Publishable key** (`sb_publishable_…`). Der Schlüssel darf im Browser stehen. Private Supabase-Schlüssel und Zugangsdaten gehören in den Passwortmanager oder die Worker-Secrets. Die bestehenden Order- und Admin-Funktionen verwenden den Publishable Key zusammen mit der Benutzeranmeldung.
4. Führe am selben Ort folgende Befehle aus. Wrangler öffnet für den Login den Browser. Melde dich dort mit deinem Cloudflare-Konto an und bestätige die Autorisierung. `whoami` muss das eigene Konto anzeigen. Beim erstmaligen Einrichten ggf. unter **Workers & Pages** die `workers.dev`-Subdomain einrichten.

   ```powershell
   .\scripts\prepare-worker-preview.ps1 -StagingUrl 'https://DEIN-TESTPROJEKT.supabase.co' -StagingPublishableKey 'sb_publishable_DEIN_TESTSCHLUESSEL'
   npx.cmd --prefer-offline --yes wrangler@4.164.0 login
   npx.cmd --prefer-offline --yes wrangler@4.164.0 whoami
   npx.cmd --prefer-offline --yes wrangler@4.164.0 deploy --config .output/server/wrangler.preview.json
   ```

5. Schütze die interne Vorschau unter **Workers & Pages → recardnize-staging → Settings → Domains & Routes** über Cloudflare Access und erlaube dein Testkonto. Öffne die ausgegebene URL im Inkognito-Fenster und prüfe am Rechner und am Handy die Startseite. Lege je eine Testbestellung mit **Ohne Logo**, **Studio-Logo** und **recardnize** an. Prüfe Preise von 4,99 € bzw. 5,99 € mit Band je Stück, Bestellnummern, Admin-Anmeldung und beide CSV-Exporte. Öffne das bestehende QR-Ziel separat. [Cloudflare Access für workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/#access)

Das Skript legt Build- und Worker-Variablen gemeinsam aus demselben Testprojekt fest. Die im Repository konfigurierte Supabase-URL wird als Vorschau abgewiesen. Erzeuge die Konfiguration nach jedem Build erneut, da Nitro den Ausgabeordner neu erstellt.

## 3. Eigene Domain erst nach der Abnahme verbinden

1. Vervollständige die Betreiberanschrift und die Datenschutzhinweise für die tatsächlich eingesetzten Dienste, Zwecke und Löschfristen. Kläre vor einem öffentlichen Shop zudem den Einsatz der Studio-Marke in den Produktbildern und im Konfigurator sowie die Angaben im Verbraucher-Checkout. [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) · [Art. 13 DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=de) · [§ 312j BGB](https://www.gesetze-im-internet.de/bgb/__312j.html)
2. Prüfe die vorhandene Produktionsdatenbank einschließlich Admin und Preis-RPCs. Sichere Daten und Schema vor Änderungen. Ein unbekannter Funktionsstand führt zum Abbruch der Preis-Migration und muss zuerst geprüft werden. Richte einen eigenen Produktions-Worker für die freigegebene Version ein. Der Staging-Worker und seine Datenbank dienen weiterhin dem Testen.
3. Exportiere oder dokumentiere im IONOS-Konto unter **Domains & SSL → recardnize.com → DNS** die vollständige Zone. Am 20. November 2026 zeigten die öffentlichen DNS-Abfragen für `recardnize.com` IONOS-Nameserver und IONOS-MX. Bei einem Wechsel zu Cloudflare DNS müssen unter anderem MX, SPF, DKIM und ein vorhandener DMARC-Eintrag übernommen werden. Prüfe auch weitere Verifizierungs-, Autodiscover- und DNSSEC-Einstellungen. [IONOS-Mail mit externem DNS](https://www.ionos.de/hilfe/e-mail/problemloesungen-mail-basicmail-business/mx-eintraege-fuer-e-mail-empfang-ueber-ionos-mailserver-anpassen/) · [Cloudflare-DNS-Umzug](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
4. Lege `recardnize.com` als Zone in demselben Cloudflare-Konto an. Vergleiche jeden importierten Datensatz mit der IONOS-Liste und ergänze fehlende Einträge. Ändere erst danach bei IONOS die **Nameserver** auf die beiden angezeigten Cloudflare-Werte. Sobald die Zone aktiv ist, verbinde `recardnize.com` in **Workers & Pages → Produktions-Worker → Settings → Domains & Routes → Add → Custom Domain**. Verbinde `www` zusätzlich, falls es genutzt werden soll. [Cloudflare Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
5. Teste HTTPS, Bestellungen, Admin, CSV und die bisherige QR-Adresse erneut. Sende von `hello@recardnize.com` an ein externes Konto und antworte von dort. Dokumentiere die bestätigte Live-URL. Für den Rückweg stehen die gesicherten IONOS-DNS-Einstellungen und der bisherige Website-Host bereit.
