# AstraZeneca Footer — Design Correction Plan (v3, with exact spacing)

## Objective
Re-align `blocks/footer/footer.css` (+ `footer.js`) to the updated Figma footer across L (`376-27137`), M (`376-27140`), S (`376-27143`), fix **social icons rendering black instead of white**, and apply **exact spacing + the fixed 64px gold-bar length** below every headline.

## Status
**Ready to execute — Execute mode required to write files.** All nodes + spacing analyzed.

## Root cause: black social icons
`decorateIcons` (aem.js) renders `<span class="icon icon-linkedin">` as `<img src="/icons/linkedin.svg">`. An externally-referenced SVG in an `<img>` renders in isolation → `fill="currentColor"` resolves to **black**, and parent CSS `color` can't reach inside. **Fix: inline the SVGs into the DOM** in `footer.js` (fetch → inject `<svg>`), so `currentColor` + CSS drive white default / gold hover. Social circle: **40px**, dark `#1a1a1a` fill, subtle `#3c4242`/white-alpha border, **white glyph**.

## Gold bar (horizontal line under headlines) — FIXED LENGTH
Every headline separator ("Rectangle 3") is exactly **`width: 64px`, `height: 2px`, color `#f0ab00`**. This applies to: Resources, Quick links, Connect with us, Stay updated, **and** the brand divider (between disclaimer and Veeva lines). Must be a fixed 64px bar — **not** full-width. (Current CSS already uses 64px — keep and verify all instances.)

## Exact spacing spec (from L-viewport dev mode)
**Footer container:** padding `80px 80px 8px` (top/side/bottom); **row gap `64px`** between Footer Content and Meta Nav.
**Footer Content:** flex row, **gap `40px`** between the four column groups.
- **col 1 (brand):** flex col, **gap `56px`** (logo → content block). Logo `180×46`. Content block: flex col **gap `32px`** = disclaimer (14px/24px white) → **64px gold bar** → Veeva/review (14px/24px, `#b2b4b4` grey).
- **col 2 & 3 (Resources, Quick links):** each `pt-20px`; column flex **gap `32px`** (title-group → nav list). Title group: **gap `12px`** (heading → 64px bar). Heading Lexia 24px/32px white. Nav list: flex col **gap `16px`**; each link row `py-8px`, text 14px/20px, **no chevron**, white → **gold hover**.
- **col 4:** flex col **gap `40px`** → [Connect block] + [Stay updated block].
  - Connect: title-group (gap 12px, 64px bar) then social row **gap `20px`**, 40px circles.
  - Stay updated: **gap `24px`** title-group → text+CTA. Text+CTA: **gap `8px`**; text 14px/24px; CTA "Subscribe" **Lexia 16px/20px** + arrow, white → gold hover.
**Meta Nav row:** width 1280, flex row **gap `40px`**, align center: [country selector `290px`] + [text links `664px`, gap `16px`] + [copyright, right-aligned, 14px/17px]. Country selector: globe 24px + "Select your country or region" 16px + chevron, gap `12px`; white → gold hover. Legal links 16px/20px white → gold hover.

## Confirmed deltas vs. current build
1. **Remove chevrons** from column links (JS stops injecting `›`; CSS drops `space-between`).
2. **Link rows** → plain text, 14/20, `py-8px`, list gap 16px, white→gold hover.
3. **Social icons** → white glyph (fix black bug) via inline SVG; 40px circle, 20px gap, hover→gold.
4. **Newsletter** → 40px icon optional (design shows a mail icon beside "Stay updated" in the component, but the L-viewport `col 4` version has **no** leading icon — follow L-viewport: no mail icon, just title/text/CTA). CTA = Lexia 16px + arrow.
5. **Brand col gap** → 56px logo→content (current 32px); content inner gap 32px.
6. **Column top padding** `pt-20px` on link columns to align with brand content.
7. **Gold bars** everywhere fixed 64px (verify).
8. **Grey subtext** `#b2b4b4` for Veeva lines; disclaimer white 14/24.

## Region order per viewport
- **L:** brand · Resources · Quick links · (Connect + Stay updated stacked) — 4 groups; meta bar full-width bottom (country · links · copyright).
- **M:** brand full-width top; Resources + Quick links 2-col; Connect + Stay updated 2-col; meta stacked; copyright last.
- **S:** single-column stack in order.

## Checklist
- [ ] Inline social SVGs in `footer.js` (fetch + inject `<svg>`, strip hardcoded fill) so glyphs are white; wire hover→gold via CSS `currentColor`
- [ ] Remove `›` chevron injection from column links in `footer.js`
- [ ] `footer.css` link rows: plain text 14/20, `padding: 8px 0`, list `gap:16px`, remove `justify-content:space-between` + chevron rule; white→gold hover
- [ ] Brand: logo→content gap `56px`, content inner gap `32px`, disclaimer white 14/24, Veeva grey `#b2b4b4`; keep 64px gold bar between them
- [ ] Verify all headline gold bars are fixed `64px × 2px` `#f0ab00` (Resources, Quick links, Connect, Stay updated, brand)
- [ ] Link columns: `pt-20px`, title-group gap `12px`, column gap `32px`
- [ ] Social row: 40px circles, `gap:20px`, dark fill, subtle border, white glyph
- [ ] Newsletter/Stay updated: gap `24px`, text+CTA gap `8px`, CTA Lexia 16px + arrow, gold hover (no leading mail icon per L-viewport)
- [ ] Meta bar: gap `40px`, country selector 290px + links (gap 16px) + copyright right; container padding `80px 80px 8px`, content→meta gap `64px`
- [ ] M/S: verify stacking + gaps per `376-27140` / `376-27143`
- [ ] `npm run lint` (JS + CSS)
- [ ] Verify 1440 / 768 / 375 via Playwright against Figma frames
- [ ] Commit + push; upload/publish `/footer` if fragment markup changed; confirm on live

## Open questions / assumptions
- **Social icons:** inline-SVG injection (recommended, enables hover→gold). Alternative: hardcode `fill="#fff"` (simpler, no hover recolor).
- **Newsletter mail icon:** the standalone Newsletter component shows a 40px mail icon, but the L-viewport `col 4` "Stay updated" has none — I'll follow the **L-viewport** (no leading icon). Flag if you want the mail icon.
- Link targets stay placeholder `/investors` (style/layout-only).
- Requires **Execute mode** to write files.
