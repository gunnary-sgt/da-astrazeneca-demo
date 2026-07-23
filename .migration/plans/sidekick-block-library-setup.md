# AstraZeneca Footer — Layout Correction Plan

## Objective
The shipped footer layout does not match the Figma design (node `376-38273`). Re-analyze that node, diff it against the current implementation, and correct `blocks/footer/footer.css` (and `footer.js` if structure needs to change) so the footer matches the design across L/M/S viewports.

## Status
**Awaiting Execute mode to enable the plugin.** You agreed to enable the **excat-figma** plugin. Enabling it means creating `.agents/settings.json` — a write operation that **plan mode blocks**. Switch to Execute mode and I'll immediately write the file, then stop so it reinitializes; on your next message the Figma tools will be live and I'll open node `376-38273`.

## Plan of action
1. **Enable plugin (Execute mode)** — create `.agents/settings.json` = `{"enabledPlugins": {"excat-figma@excat-extended": true}}` (the `.agents/` dir does not exist yet, so it'll be created too). Stop; let it reinitialize on the following message.
2. **Analyze `376-38273`** — screenshot + dev-mode spec (exact grid columns, widths, gaps, padding, region order per breakpoint).
3. **Diff vs current** — compare the Figma spec against the current `footer.css` grid; enumerate concrete deltas.
4. **Correct** — adjust CSS grid / `footer.js` region grouping to match; re-verify at 1440 / 768 / 375 via Playwright; commit, push, publish.

## Current implementation (to be diffed)
From `blocks/footer/footer.css`:
- `footer` — dark `#1a1a1a`, white text, gold `#f0ab00` hover.
- `.footer-inner` — grid: base 1 col; **M** 2-col link columns; **L** `1fr 1fr 1fr 1fr` with:
  - `.footer-brand` col 1
  - `.footer-columns` spanning `grid-column: 2 / 4`, inner `1fr 1fr` (Resources + Quick links)
  - `.footer-connect` col 4 (Connect + Stay updated stacked)
  - `.footer-meta` full-width bottom row `auto 1fr auto` (country selector / legal links centered / copyright right)
- Chevron `›` link rows with bottom borders; 40px circular social icons; gold heading underlines.

## Suspected mismatches to confirm against `376-38273`
(Unverified until Figma re-access — "Overall / not sure" reported.)
- **Column count / widths** at L — design may not be `1fr×4` with columns spanning 2–3.
- **Region order/placement** — Connect+Stay-updated position; whether Resources/Quick links sit beside vs. under brand.
- **Meta bar** — arrangement of country selector, legal links, copyright.
- **Spacing** — section paddings/gaps and heading-underline widths.

## Checklist
- [ ] (Execute mode) Create `.agents/settings.json` enabling `excat-figma@excat-extended`; stop for reinit
- [ ] Open Figma node `376-38273`: capture screenshot + dev-mode measurements (grid columns, widths, gaps, padding, order per L/M/S)
- [ ] Diff the Figma spec against current `footer.css`; list concrete layout deltas
- [ ] Correct `blocks/footer/footer.css` grid/spacing (and `footer.js` region grouping if needed)
- [ ] `npm run lint` (JS + CSS) — resolve issues
- [ ] Verify L (1440), M (768), S (375) via Playwright against the Figma frames
- [ ] Commit, push, upload/publish `/footer` if content changed
- [ ] Confirm corrected footer on preview/live

## Open questions / assumptions
- Layout-only correction: footer content/links unchanged (placeholder `/investors` targets stay) unless the diff reveals missing/removed content.
- Existing social icons and inverted logo are reused.
- Node `376-38273` is the authoritative full-footer layout to match.

## Note
Enabling the plugin and all fixes require **Execute mode** — plan mode cannot write `.agents/settings.json`. Once in Execute mode I'll write the file and stop for reinitialization before analyzing the node.
