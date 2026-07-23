I'll read the current typography and radius tokens plus how headings are styled, then compare against the four mode files.Now let me find where the heading sizes are overridden per viewport and how h1–h6 map to the boilerplate variables.Let me see the breakpoint boundaries for the heading overrides at lines 315–356.I found real discrepancies. Let me confirm the direction question before finalizing.# Typography Design Tokens — Analysis & Update Plan

## Summary
I diffed the four typography mode files (XS/S/M/L) against the current `styles.css`. **Updates ARE needed.** The type scale has two real problems:

1. **Wrong breakpoints + missing tier.** The heading media queries use `600px` / `900px` (only 3 tiers total). The tokens define **four** modes at `375 / 768 / 1024 / 1440`. The **M tier (1024–1440) is entirely missing**, and the current "L" values are applied from 900px up — so 900–1439px shows desktop headings that should be one or two steps smaller.
2. **Direction mismatch.** Per your choice, the type scale will be reworked **desktop-first (max-width, base = L)** to match the grid system, replacing the current mobile-first `min-width` `600/900` scheme.

Font families, weights, paragraph sizes/line-heights, and border-radius are **already correct** — no change.

## The token contract (h1–h6 = xxl…xs)

**Font size (px):**
| Var | h-tag | XS | S | M | L |
|---|---|---|---|---|---|
| xxl | h1 | 40 | 48 | **52** | 58 |
| xl | h2 | 36 | 40 | **44** | 48 |
| l | h3 | 32 | 36 | 36 | 40 |
| m | h4 | 28 | 32 | 32 | 32 |
| s | h5 | 24 | 24 | 24 | 24 |
| xs | h6 | 20 | 20 | 20 | 20 |

**Line height (px):**
| Var | h-tag | XS | S | M | L |
|---|---|---|---|---|---|
| xxl | h1 | 48 | 56 | **60** | 64 |
| xl | h2 | 40 | 48 | **52** | 56 |
| l | h3 | 36 | 40 | **44** | 48 |
| m | h4 | 32 | 36 | **40** | 40 |
| s | h5 | 28 | 32 | 32 | 32 |
| xs | h6 | 24 | 24 | 24 | 24 |

## Discrepancies vs. current CSS

**Current base `:root` (should be L, currently mislabeled "S/mobile"):** values are `xxl 40/48, xl 36/40, l 32/36, m 28/32, s 24/28, xs 20/24` — these are the **XS** numbers, not L. Base must become L.

**Missing M tier (1024–1440):** none of `h1 52/60, h2 44/52, h3 36/44, h4 32/40` exist anywhere in the file. This is the biggest gap — the whole M column is absent.

**`@media (>=600px)` block** currently holds the **S** values (48/40/36/32/24/20 sizes) but is gated at the wrong width (600 not 768).

**`@media (>=900px)` block** currently holds the **L** values but is gated at 900 (should be 1440) — so M-range screens wrongly get L headings.

**Also note:** the current base has an `h4/m = 28px` with line-height 32 (XS values). At S/M/L, h4 = 32px. The desktop-first base fixes this since base becomes L (h4 = 32).

## Plan (desktop-first, mirroring the grid)
1. **Rewrite base `:root` heading vars → L values:** `xxl 58/64, xl 48/56, l 40/48, m 32/40, s 24/32, xs 20/24`.
2. **Replace** the `@media (>=600px)` and `@media (>=900px)` heading blocks with **three max-width overrides** placed alongside the existing grid overrides:
   - `@media (width < 1440px)` → **M**: sizes `52/44/36/32/24/20`, line-heights `60/52/44/40/32/24`
   - `@media (width < 1024px)` → **S**: sizes `48/40/36/32/24/20`, line-heights `56/48/40/36/32/24`
   - `@media (width < 768px)` → **XS**: sizes `40/36/32/28/24/20`, line-heights `48/40/36/32/28/24`
3. **Leave unchanged (verified correct):** font families (Lexia / Helvetica Neue), border radius (0/2/4/8/24/4000 → none/small/medium/large/xl/circle), paragraph sizes (`--body-font-size-m/s/xs` = 16/16/14) and paragraph line-heights (24/20/24). Note: paragraph-medium line-height is 20 at XS/M but 24 at S/L per tokens — currently a single 20px; flag as a minor known simplification (paragraphs are not viewport-swapped today), not part of this change unless you want it.
4. `npm run lint`, then Playwright-verify an `h1` computed `font-size`/`line-height` at 375 (40/48), 900 (48/56 — now correctly S, was wrongly 58/64), 1200 (52/60 — the new M tier), 1500 (58/64).

## Checklist
- [x] Read current typography + radius tokens and heading media queries in `styles.css`
- [x] Diff font families / weights / radius vs XS/S/M/L files — all match, no change
- [x] Diff heading size + line-height scale per tier — found wrong breakpoints (600/900), missing M tier, base mislabeled
- [x] Confirm breakpoint direction with user — desktop-first (match grid)
- [ ] Rewrite base `:root` heading vars to **L** values (58/48/40/32/24/20 · 64/56/48/40/32/24)
- [ ] Add `@media (width < 1440px)` **M** heading override (the currently-missing tier)
- [ ] Add `@media (width < 1024px)` **S** heading override; remove old `@media (>=600px)` block
- [ ] Add `@media (width < 768px)` **XS** heading override; remove old `@media (>=900px)` block
- [ ] Confirm paragraph sizes/line-heights + radius + font families untouched (already correct)
- [ ] `npm run lint` (CSS)
- [ ] Playwright-verify `h1` at 375 / 900 / 1200 / 1500 → 40/48 · 48/56 · 52/60 · 58/64
- [ ] Commit + push; confirm live at the 4 tiers

## Open question (minor, non-blocking)
- Paragraph-medium line-height differs per tier in the tokens (20 at XS/M, 24 at S/L) but is a single 20px today. Fold this into the change, or leave paragraphs as-is? Recommend **leave as-is** unless you want full paragraph tiering.

*Execution requires Execute mode; the above is analysis + plan only.*
