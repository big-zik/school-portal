# Palette v2: Chosen Generation School

Three palettes, one token set. Every text pair is WCAG 2.1 AA; the generator that produced
`src/app/globals.css` fails the build of the file if any token pair drops below 4.5:1 (text) or 3:1 (UI).

| Palette | How to enable | Character |
|---|---|---|
| **Classic** (default) | nothing | cream canvas `#FBF7EE`, white cards, navy `#0B3A6B` sidebar and headings, primary `#0D5EA7` actions, gold `#C8962E` as the single accent |
| **Calm** | `<html data-palette="calm">` | sand canvas `#F4EFE6`, sky-mist `#E8F6FA` supporting surfaces, same actions and accent |
| **Evening** (dark) | `<html class="dark">` or `data-theme="dark"` / `"evening"` | navy-charcoal `#0A192C`, lightened primary `#56A5E8`, sky `#98D8E8` emphasis, gold `#E5B24E` |

## Rules
- Gold is a fill or indicator only. Text on gold uses `--cgs-on-accent`. Never gold text on light.
- `danger` / `success` are for errors, destructive actions and paid / present / approved states only.
- Form control edges use `--cgs-control` (3:1+). `--cgs-border` is decorative (cards, dividers).
- Status badges use the `*-soft` surface with the matching ink (`--cgs-danger-soft` + `--cgs-danger`, etc.).
- In Evening, status fills use dark ink (`--cgs-on-danger`, `--cgs-on-success`), never white.
- Elevation: `--cgs-elevation-1` cards, `-2` popovers, `-3` dialogs. In Evening these are rings and deeper shadows.

## What changed in code
- `src/app/globals.css`: new token blocks, `dark:` now follows the `.dark` class / `data-theme` (it followed the OS setting
  before, so tokens and utilities could disagree), `--color-ring` was undefined (so `ring-ring` did nothing), navy-tinted shadows.
- Legacy Tailwind scales (`gray`, `blue`, `emerald`, `amber`, `red`, `purple` and aliases such as `indigo`, `green`, `orange`)
  are remapped to palette values, so the ~4,100 existing colour classes pick up Palette v2 without a rewrite.
  Off-brand hues are folded in: indigo/cyan/teal to blue, purple/violet to a navy-slate scale.
- Evening safety net (end of `globals.css`): light-mode text utilities that have no `dark:` counterpart are remapped on dark surfaces.
- Components: Button, Badge, Input, Textarea, Select, Checkbox, Switch use tokens; navy Sidebar with gold active indicator.
- `dark:text-gray-400` to `dark:text-gray-300` (50 files), `text-emerald-500` to `-600`, white ink on buttons that override their background.
- Charts, report-card PDF, emails and `public/manifest.json` (was indigo `#4f46e5`) aligned to brand colours.
- Login: fixed the literal `&rarr;` in the button and the crest wordmark that vanished in dark mode (same on the home footer).

## Known limits
- Contrast was measured in a browser on 8 pages x 3 palettes (1,500 text elements, 0 failures). Elements over gradients were skipped.
  Parent, student and most admin screens need a database and were not rendered, so review those visually.
- Raw `text-*` classes that are intentionally placed on light surfaces inside dark mode would be remapped; none were found in the audited pages.
- `npm ci` fails on a peer-dependency conflict (`nodemailer` 10 vs `next-auth`); `--legacy-peer-deps` works.
