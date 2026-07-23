# Footer Block — Figma-Grounded Analysis & Fix Plan

## Key finding (from the 4 Figma frames)
The footer's **desktop breakpoint is wrong**. The current CSS switches to the desktop single-row 4-column layout at **≥1024px**, but Figma shows the **M viewport (1024–1439) still uses the tablet layout** (brand full-width, link columns 2-up, connect 2-up, meta stacked). The desktop row layout only begins at **L (1440)**. This is the same class of bug as the typography M-tier — the 1024–1439 range is being given L styling.

This was verified live earlier: at 1200px the footer rendered `display:flex` row with `padding 52 / 80 / 8` — i.e. desktop layout — when it should be the tablet layout with symmetric 52px padding.

## Exact per-tier spec (from Figma dev mode)
| Tier | Container padding | Section gap | Brand | Link columns | Connect/Newsletter | Meta nav |
|---|---|---|---|---|---|---|
| **XS** <768 | 20 all | 40 | full, stacked | each full-width, stacked | each full, stacked | stacked, links wrap |
| **S** 768–1023 | 40 all | 40 | full (688) | **2-up row** | **2-up row** | stacked column |
| **M** 1024–1439 | 52 all | 40 | full (920) | **2-up row** | **2-up row** | stacked column |
| **L** ≥1440 | 80 / 80 / **8** | 64 | 290 | 290+290 row (=620) | 290 column | **row** (country 290 · links · copyright) |

Note: vertical padding equals the grid's `--az-content-margin` at every tier (20/40/52/80) — only L's **bottom** is special (8px). Column inner widths (290) and columns-group (620) at L already match current CSS.

## Resolution of the 3 previously-blocking questions
The four component-token files (`footer-col-fullwidth` = 400/840/1280, `-half` = 400/400/620) are **Figma export artifacts** — the aliased Grid variable collection was pinned to L mode at export, so every tier resolved to the L grid's 4/8/12-col widths (that's also why hero `width-text` reads 840 inside the 688-wide S grid). They do not describe real per-viewport widths.
1. **L conflict** → Keep today's 290/620 (Figma-correct). Do **not** apply literal 290/290.
2. **M overflow** → Non-issue: M uses the tablet 2-up layout inside the 920 grid, never a 1280 full-width. Do **not** apply literal 1280.
3. **Token→element mapping** → N/A. The width tokens are **not wired in**. The real fix is the breakpoint + padding, taken from the frames.

## Planned CSS changes (`blocks/footer/footer.css`)
1. **Base `.footer-inner`:** change `padding: 40px var(--az-content-margin)` → `padding: var(--az-content-margin)` (auto-yields 20/40/52/80 symmetric per tier).
2. **`@media (width >= 768px)`:** remove the now-redundant `padding-block: 40px` (token handles it). Keep the tablet row rules (columns row, connect row, brand max-width none).
3. **Rename `@media (width >= 1024px)` → `@media (width >= 1440px)`** (the desktop block: content→row, brand 290, columns 620, col 290, connect 290, meta→row, country 290). Inside it, change `padding-block: 80px 8px` → `padding-bottom: 8px` (top 80 now comes from the token); keep `gap: 64px`.

Net effect: M (1024–1439) drops from the desktop 4-col row to the correct tablet 2-up layout with 52px symmetric padding and 40px gap; S and XS gain correct symmetric padding; L is unchanged.

## Out of scope (flagged, not done here)
- **Component width tokens / hero:** the same artifact reasoning applies to the Hero token file (`width-text`=840 at S is impossible in a 688 grid). Recommend **not** wiring those literal per-tier numbers either; the hero already matches L. Handle separately if you want hero work.

## Checklist
- [x] Fetch L/M/S/XS footer frames from Figma (design context)
- [x] Determine real per-tier layout + padding + gap from the frames
- [x] Diagnose the discrepancy: desktop layout wrongly starts at 1024 (should be 1440); M/XS padding wrong
- [x] Resolve the 3 blocking token questions (tokens are export artifacts — not wired)
- [ ] Base `.footer-inner`: `padding: var(--az-content-margin)`
- [ ] `@media >=768`: remove redundant `padding-block: 40px`
- [ ] Move desktop block `>=1024` → `>=1440`; change `padding-block:80px 8px` → `padding-bottom:8px`; keep gap 64
- [ ] `npm run lint` (CSS)
- [ ] Playwright-verify at 375 / 900 / 1200 / 1500: XS stacked (20 pad) · S tablet 2-up (40) · **M tablet 2-up (52, gap 40) — the fix** · L desktop row (80/8, gap 64)
- [ ] Commit + push; verify live at the 4 tiers

*Execution requires Execute mode. No component-token variables are added; this is a layout-breakpoint + padding correction grounded in the Figma frames.*
