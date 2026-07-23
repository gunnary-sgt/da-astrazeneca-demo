# Grid System Correction Plan — Per-Viewport Tokens

## Problem
The current grid implementation is wrong. My earlier version used one fixed column scale (L values) + only 3 margin tiers with incorrect breakpoints. The four `*.tokens.json` mode files reveal the grid is **fully mode-dependent** — content-grid width, margin, gutter, column-gutter, **and every column width** change per viewport. My breakpoint boundaries were also off.

## Correct spec (from the 4 token JSON files)

**Breakpoints (`viewport-grid`) + content area + gutters:**

| Mode | Breakpoint | content-grid | margin | gutter | column-gutter |
|---|---|---|---|---|---|
| **XS** | 375 | 335 | 20 | 24 | 90 |
| **S**  | 768 | 688 | 40 | 24 | 89 |
| **M**  | 1024 | 920 | 52 | 24 | 79 |
| **L**  | 1440 | 1280 | 80 | 40 | 110 |

**Key corrections vs. current code:**
1. **Gutter is 24px at XS/S/M**, only **40px at L** (current uses 40 everywhere).
2. **Margins:** XS 20 / S 40 / **M 52** / L 80 (current had no 52; used 40 for both M and S; wrong breakpoints).
3. **Breakpoints:** XS starts 375, S 768, M **1024**, L 1440 (current used 600/768/900/1440 — all wrong).
4. **content-grid caps differ per mode** (335 / 688 / 920 / 1280) — not a single 1280 cap.
5. **Column widths are per-mode** (e.g. 3-col = 245 XS / 243 S / 212 M / 290 L). At XS, cols 4–12 all clamp to 335 (full width); at S, cols 8–12 clamp to 688 — i.e. beyond a point columns span full width.

**Spacing scale:** identical across all modes (0–80, ×4) — already correct, no change.

## Interpretation for CSS (mobile-first breakpoints)
Figma "mode = max/nominal width of tier." Map to `min-width` media queries by the tier's entry width:
- base (XS, ≥375): margin 20, gutter 24, content-grid 335, XS column set
- **≥768** (S): margin 40, gutter 24, content-grid 688, S column set
- **≥1024** (M): margin 52, gutter 24, content-grid 920, M column set
- **≥1440** (L): margin 80, gutter 40, content-grid 1280, L column set

Section container: `max-width: content-grid + margin*2` per tier, `padding: 0 margin`, `box-sizing: border-box` (already set). This yields the exact content caps (375→335, 768→688, 1024→920, 1440→1280) with correct margins.

## Plan
1. **Replace grid tokens in `styles.css`:**
   - `--az-content-grid`, `--az-content-margin`, `--az-content-gutter`, `--az-column-gutter` become **per-breakpoint** (redefined in each media query), not single global values.
   - Add per-mode column-width sets, or (leaner) keep only the **L** `--az-col-1…12` as the canonical scale and add S/M/XS overrides only if a block needs them. **Recommendation:** redefine `--az-col-*` per breakpoint too, since they genuinely differ — but scope to what's used. (Open question below.)
2. **Fix breakpoints:** replace the current `600/768/900` media queries in the grid/section rules with **768 / 1024 / 1440**.
3. **Fix gutter:** base 24 → 40 only at ≥1440.
4. **Fix margins:** 20 / 40 / 52 / 80 at base / 768 / 1024 / 1440.
5. **Section container:** drive `max-width` and `padding` off the per-tier `--az-content-margin` + `--az-content-grid`.
6. **Audit collateral:** the earlier token edit set `--az-margin-xs/s/m/l` and `--az-content-margin-current` — reconcile/replace so there's one coherent system. Also check header/footer/hero don't rely on the old 900px breakpoint for grid (they have their own component breakpoints — leave those unless they reference `--az-content-*`).

## Checklist
- [ ] Read current `styles.css` grid/section block + grep for `--az-content-*`, `--az-col-*`, `--az-margin-*`, `900px`, `600px` usages across `blocks/**` to find dependents
- [ ] Redefine base (XS) grid tokens: content-grid 335, margin 20, gutter 24, column-gutter 90, XS column widths
- [ ] Add `@media (width >= 768px)` S overrides: content-grid 688, margin 40, gutter 24, column-gutter 89, S columns
- [ ] Add `@media (width >= 1024px)` M overrides: content-grid 920, margin 52, gutter 24, column-gutter 79, M columns
- [ ] Add `@media (width >= 1440px)` L overrides: content-grid 1280, margin 80, gutter 40, column-gutter 110, L columns
- [ ] Update `main > .section > div` to use per-tier `--az-content-grid` + `--az-content-margin` (keep `border-box`)
- [ ] Remove/replace the interim `--az-margin-xs/s/m/l` + `--az-content-margin-current` scheme so tokens are consistent
- [ ] Confirm spacing scale unchanged (no edits)
- [ ] `npm run lint` (CSS)
- [ ] Playwright verify content width + margin at 375 (335/20), 768 (688/40), 1024 (920/52), 1440 (1280/80)
- [ ] Commit + push; confirm live at the 4 tiers

## Open questions
- **Column-width tokens scope:** (a) full per-mode `--az-col-1…12` in every breakpoint (most faithful, larger CSS), or (b) keep single L scale + only override where a real multi-column block needs it (leaner). Which do you want?
- **Breakpoint direction:** confirm mobile-first `min-width` at 768/1024/1440 (recommended) vs. matching Figma's max-width mode labels.
- Requires **Execute mode** to write files.
