# UI Registry

This registry tracks the core visual styles used across the project to maintain design consistency.

## Baseline — Established 2026-06-16

| Property         | Correct class |
| ---------------- | ------------- |
| Card background  | `bg-bg-surface` |
| Card border      | `border-0` (no default border) |
| Card radius      | `rounded-[24px]` (or `rounded-2xl` for secondary panels/dialogs) |
| Text — primary   | `text-text-primary` |
| Text — muted     | `text-text-muted` |
| Input background | `bg-bg-surface` |
| Input border     | `border border-border-default` |
| Shadow           | `shadow-[0_16px_40px_rgba(35,40,36,0.03)]` |
| Accent usage     | `bg-accent-primary` (deep sage green) / `text-accent-warm` (honey orange) |

---

### Dashboard (Prehľad, Hejno, Denník, Rodina Tabs)

File: [Dashboard.tsx](file:///c:/Users/Adrian/Projekty/Osobne%20Projekty%20-%20weby/Finik%20Farma/finik-farma/apps/web/src/components/Dashboard.tsx)
Last updated: 2026-06-16

| Property         | Class |
| ---------------- | ----- |
| Background       | `bg-bg-base` (body), `bg-bg-surface` (cards) |
| Border           | `border-0` |
| Border radius    | `rounded-[24px]` (main cards), `rounded-2xl` (dialogs, inner tables) |
| Text — primary   | `text-text-primary` (charcoal with green undertone) |
| Text — secondary | `text-text-muted` (taupe-green) |
| Spacing          | `p-6` (metric card), `p-5` (trend and counter), `gap-6` (main layout) |
| Hover state      | No hover scale transforms. Background fade transitions (`hover:bg-bg-base/10` or `hover:bg-bg-surface-raised`) |
| Shadow           | `shadow-[0_16px_40px_rgba(35,40,36,0.03)]` |
| Accent usage     | `bg-accent-primary` for primary buttons & active indicators, `text-accent-warm` for stats counters |

**Pattern notes:**
- Keep cards completely border-free. Instead, rely on background contrasts and soft `0_16px_40px` shadows.
- Avoid card hover scaling effects (design constraint).
- Slovak wording throughout the UI is clean and warm (e.g. *Naše hejno*, *Zaznamenať znášku*, *Spoločná rodina*).
