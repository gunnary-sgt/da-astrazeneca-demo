# Sauberer Neuaufbau: Reset + frische Figma-Tokens (mobile-first)

## Ziel
Projekt auf die Boilerplate-Basis zurücksetzen und das Design **von Grund auf sauber** neu aufbauen — mit frisch aus Figma gelieferten Token-JSONs und einem **konsistenten mobile-first Breakpoint-System**. Damit verschwinden die inkonsistenten desktop-first M-Tier-Patches, die das aktuelle UI-/Breakpoint-Verhalten verursachen.

**Deine Entscheidungen:**
- Ansatz: **Reset + sauberer Neuaufbau** (`main` → `c9bbc0e`, Backup vorher)
- Breakpoints: **Mobile-first** (Basis = XS, dann `min-width` 768 / 1024 / 1440) — AEM-Standard, robuster
- Token-Quelle: **Du lieferst die Token-JSONs** (Farben, Typo, Grid/Spacing, Komponenten) frisch aus Figma

## Ursachenanalyse (warum das aktuelle Verhalten kaputt ist)
- Das bestehende System ist **desktop-first (Basis = L)** mit pro-Komponente nachgeflickten M-Tier-Overrides (Footer, Hero, Header). Dadurch bekam der 1024–1439-Bereich mehrfach L-Styling → Overflow, falsche Layouts.
- Mehrere Token-JSONs waren zudem **Figma-Export-Artefakte** (Grid-Collection auf L-Mode gepinnt). Ein sauberer Neustart mit korrekt exportierten JSONs verhindert das.

## Phase 1 — Reset (destruktiv, Execute-Mode + Freigabe nötig)
1. Read-only-Bestandsaufnahme: `git remote -v`, `git branch -a`, `git status`, `git log origin/main`.
2. **Backup-Branch** `backup/az-work-2026-07-24` am aktuellen AZ-Tip anlegen + zu `origin` pushen (alles wiederherstellbar).
3. Auf `main` wechseln, mit `origin/main` abgleichen.
4. `git reset --hard c9bbc0e` → Boilerplate-Basis.
5. `git push --force-with-lease origin main`.
6. Verifizieren: lokal & `origin/main` = nur `c9bbc0e`; Backup-Branch vorhanden.

## Phase 2 — Fundament: Tokens + mobile-first Grid
7. **Token-JSONs von dir einlesen** (du lieferst sie): Farben (Light), Typographie (XS/S/M/L), Grid & Spacing (XS/S/M/L), Komponenten. Ich prüfe sie zuerst auf Konsistenz (z. B. ob Werte in ihren eigenen Grid passen), damit keine Export-Artefakte durchrutschen.
8. **`styles/styles.css` neu schreiben**, mobile-first:
   - `:root` = **XS**-Basiswerte (Tokens, Grid-Margin/Gutter/Content-Width, Spacing, Heading-Scale).
   - Aufsteigende `@media (min-width: 768px / 1024px / 1440px)` überschreiben pro Tier.
   - Fonts (Lexia / Helvetica Neue) + Radius wie gehabt.
9. Grid-/Section-Container-Regel mobile-first (Content-Cap + Margins per Tier), `box-sizing: border-box`.

## Phase 3 — Blöcke sauber neu (mobile-first, Figma-verifiziert)
10. Header/Nav, Hero (inkl. Image-Variante + Stat-Card + Quicklinks), Footer, Cards, Columns — jeweils Basis = XS, `min-width`-Sprünge bei 768/1024/1440, gegen die jeweiligen Figma-Frames verifiziert. **Keine** pro-Komponente-Sonderpatches mehr.
11. Pro Block: `npm run lint` + Playwright-Verifikation bei 375 / 900 / 1200 / 1500 (Layout + kein Overflow).

## Phase 4 — Content & Deploy
12. DA-Content (Nav/Footer sind aktuell auf Boilerplate zurückgefallen) neu aufsetzen/wiederherstellen — separat, da Content ≠ Code.
13. Commit(s) + Push; Live nach Code-Sync über alle 4 Tiers verifizieren.

## Offene Punkte (vor/als Erstes zu klären)
- **DA-Content:** Nur Code neu, oder auch Nav/Footer/Seiten-Content in DA neu aufbauen? (Content-Änderungen sind eigenständig destruktiv — separate Bestätigung.)
- **Token-JSONs:** Bitte die frischen Exporte liefern (am besten pro Modus getrennt: XS/S/M/L für Grid+Typo, Light für Farben). Ohne diese kann Phase 2 nicht starten.
- **Andere Branches** (`aem-20260723-*`, `grid-and-component-token-fixes`) — bleiben unangetastet, ok?

## Checklist
- [x] Ansatz geklärt: Reset + Neuaufbau, mobile-first, Token-JSONs vom Nutzer
- [ ] DA-Content-Frage klären (nur Code vs. auch Content) — AskUserQuestion
- [ ] Frische Token-JSONs vom Nutzer erhalten (Farben / Typo / Grid+Spacing / Komponenten)
- [ ] Read-only Git-Bestandsaufnahme
- [ ] Backup-Branch `backup/az-work-2026-07-24` anlegen + pushen
- [ ] `main` → `git reset --hard c9bbc0e`
- [ ] `git push --force-with-lease origin main`
- [ ] Reset verifizieren (lokal + remote = `c9bbc0e`, Backup vorhanden)
- [ ] `styles.css` mobile-first neu aus Token-JSONs schreiben (Tokens + Grid + Typo)
- [ ] Grid/Section-Container mobile-first
- [ ] Blöcke neu/angepasst mobile-first: Header, Hero, Footer, Cards, Columns
- [ ] Pro Block: `npm run lint` + Playwright 375/900/1200/1500
- [ ] DA-Content (Nav/Footer/Seiten) wiederherstellen/aufsetzen — falls gewünscht
- [ ] Commit + Push; Live über 4 Tiers verifizieren
- [ ] Backup-Branchname + Wiederherstellungshinweis an den Nutzer

## Hinweis zur Ausführung
Phase 1 (Reset + Force-Push auf `main`) ist **destruktiv und überschreibt geteilte Historie** — erfordert **Execute-Mode** und deine ausdrückliche Freigabe („go"). Der Backup-Branch sichert die komplette bisherige AZ-Arbeit. Danach starten wir Phase 2, **sobald du die frischen Token-JSONs lieferst**.
