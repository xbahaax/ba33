# ba33 Design System — Rules for Web & Mobile

**Source of truth:** The CSS token file (Tailwind v4 + shadcn tokens, OKLCH color space).
**Applies to:** `ba33-platform` (web) and `ba33-mobile` (Flutter). Both must look and feel identical.

---

## 1. The 5 Non-Negotiables

1. **Never use raw color values.** No `#1a1a1a`, no `Color(0xFF...)`, no `rgb(...)`. Only semantic tokens.
2. **Every foreground has a paired background.** Use `primary` with `primary-foreground`, `card` with `card-foreground`, etc. Never mix unpaired combinations.
3. **Both light and dark must work.** Every screen is tested in both modes before merging.
4. **Tokens are the contract.** Web reads from CSS variables. Mobile reads from a generated Dart theme file. Both derive from the same `tokens.json`.
5. **OKLCH stays OKLCH.** No conversion to hex/RGB in source files. The browser and Flutter both handle OKLCH natively (Flutter ≥ 3.19 via `Color.from()`).

---

## 2. The Token Map — what each token is for

### Surface & text tokens

| Token | Use for |
|---|---|
| `background` / `foreground` | The root page/screen background and its default text |
| `card` / `card-foreground` | Elevated surfaces: cards, panels, modals, sheets |
| `popover` / `popover-foreground` | Floating surfaces: dropdowns, tooltips, popovers, menus |
| `muted` / `muted-foreground` | Subtle backgrounds (disabled states, inactive tabs) and secondary text |
| `accent` / `accent-foreground` | Hover states, selection highlights, soft emphasis |
| `border` | All borders, dividers, separators |
| `input` | Form input borders (same value as `border` but semantically distinct) |
| `ring` | Focus rings on interactive elements |

### Intent tokens

| Token | Use for |
|---|---|
| `primary` / `primary-foreground` | Primary actions: main CTA buttons, active nav items, brand moments |
| `secondary` / `secondary-foreground` | Secondary actions: less-important buttons, alternative CTAs |
| `destructive` / `destructive-foreground` | Delete, remove, cancel, error states, dangerous actions |

### Data visualization

| Token | Use for |
|---|---|
| `chart-1` through `chart-5` | Chart series colors, in order. Never skip. Never invent `chart-6`. |

### Sidebar (dashboard navigation)

| Token | Use for |
|---|---|
| `sidebar` / `sidebar-foreground` | Sidebar surface and its default text |
| `sidebar-primary` / `sidebar-primary-foreground` | Active sidebar item |
| `sidebar-accent` / `sidebar-accent-foreground` | Sidebar hover states |
| `sidebar-border` | Sidebar dividers |
| `sidebar-ring` | Focus ring inside sidebar |

**Rule:** The sidebar has its own token family because it often needs to contrast with the main content area (darker/lighter). Never substitute `background` for `sidebar`.

---

## 3. Color Rules

1. **Semantic first, always.** Ask "what is this for?" not "what color is this?"
   - Delete button → `destructive`, not "red"
   - Primary CTA → `primary`, not "green"
   - Subtle text → `muted-foreground`, not "gray"

2. **Foreground-background pairs are atomic.** If you put text on `primary`, the text is `primary-foreground`. Don't mix and match.

3. **Never nest intent colors.** A `destructive` button inside a `primary` banner is a visual conflict. Pick one intent per zone.

4. **`muted` is the quiet zone.** Use it for inactive states, placeholders, helper text, disabled inputs. Never use it for primary content.

5. **Chart colors are ordered.** `chart-1` through `chart-5` are used in sequence. The first series in a chart gets `chart-1`. Keep consistency across all dashboards.

6. **Dark mode is not an afterthought.** If a component looks broken in dark mode, it's broken. Fix it before shipping.

---

## 4. Typography Rules

Three font families, each with a clear role:

| Family | Use for |
|---|---|
| `font-sans` (Roboto Flex) | 99% of UI text: body, labels, buttons, inputs, navigation |
| `font-serif` (Asul) | Display-only moments: marketing pages, certificates, formal documents, the NFN traceability certificate |
| `font-mono` (JetBrains Mono) | Technical content: lot IDs, QR codes text, weights, numbers in tables, event logs, code |

**Rules:**

1. **Sans is the default.** Every component inherits sans unless it has a reason not to.
2. **Mono for anything the user will compare character-by-character.** Lot IDs (`L-00042-X7`), weights (`12.450 kg`), timestamps, coordinates. This is readability, not style.
3. **Serif is sparingly used.** Reserve it for certificates, printed outputs, and brand headers.
4. **Never introduce a fourth font.** Three is the ceiling.
5. **Font weights** — use the 6 standard weights (`300, 400, 500, 600, 700, 900`). No in-between values.

---

## 5. Spacing Rules

Base unit: `0.25rem` = `4px`.

The scale is exponential-ish, derived from Tailwind:

| Name | Value |
|---|---|
| `spacing-1` | 4px |
| `spacing-2` | 8px |
| `spacing-3` | 12px |
| `spacing-4` | 16px |
| `spacing-6` | 24px |
| `spacing-8` | 32px |
| `spacing-12` | 48px |
| `spacing-16` | 64px |

**Rules:**

1. **Only use values from the scale.** Never `padding: 13px` or `padding: 17px`.
2. **Component-internal spacing uses small values** (`1`–`4`). Layout spacing uses larger values (`6`–`16`).
3. **Vertical rhythm is consistent.** If your headings use `spacing-8` bottom margin, every heading does.
4. **On mobile, multiply by context, not by inventing values.** Padding `16` on desktop ≠ padding `12` on mobile — pick the mobile value from the same scale.

---

## 6. Radius Rules

Base: `0.75rem = 12px`. Derived scale:

| Name | Value |
|---|---|
| `radius-sm` | 8px (base - 4) |
| `radius-md` | 10px (base - 2) |
| `radius-lg` | 12px (base) |
| `radius-xl` | 16px (base + 4) |
| `radius-full` | 9999px (pills, avatars) |

**Rules:**

1. **Buttons, inputs, and cards use `radius-lg`** (the base). This is ba33's signature.
2. **Small elements use `radius-sm`**: badges, chips, small tags.
3. **Large feature elements use `radius-xl`**: hero cards, featured panels.
4. **Avatars and pill buttons use `radius-full`.**
5. **No hard corners anywhere.** `radius-0` is forbidden. ba33 is a soft-cornered system.

---

## 7. Shadow Rules

8 levels, ordered by elevation:

| Token | Elevation purpose |
|---|---|
| `shadow-2xs` | Barely raised: inline form elements, subtle depth |
| `shadow-xs` | Cards at rest |
| `shadow-sm` | Default raise: cards on hover, basic buttons |
| `shadow` (default) | Standard lift: active cards, dropdown triggers |
| `shadow-md` | Raised: popovers, menus |
| `shadow-lg` | Floating: modals, dialogs |
| `shadow-xl` | High float: tooltips above modals |
| `shadow-2xl` | Maximum: critical alerts, onboarding spotlights |

**Rules:**

1. **Elevation follows a hierarchy.** A modal (`shadow-lg`) cannot sit below a card (`shadow-sm`).
2. **Dark mode shadows are subtler by design.** The system handles this; don't override.
3. **Never stack shadows manually.** One shadow per element.

---

## 8. Component Rules (shared vocabulary)

Every reusable component exists with the **same name and the same variants** on web and Flutter.

### Buttons

Variants: `primary`, `secondary`, `destructive`, `ghost`, `outline`.
Sizes: `sm`, `md` (default), `lg`, `icon`.

- `primary` → `primary` bg + `primary-foreground` text
- `secondary` → `secondary` bg + `secondary-foreground` text
- `destructive` → `destructive` bg + `destructive-foreground` text
- `ghost` → transparent bg + `foreground` text, `accent` on hover
- `outline` → `background` bg + `border` stroke + `foreground` text

All buttons: `radius-lg`, `font-sans`, `font-weight-500`.

### Inputs

- Background: `background`
- Border: `input` (same as `border` but via input token)
- Text: `foreground`
- Placeholder: `muted-foreground`
- Focus ring: `ring`
- Radius: `radius-lg`
- Disabled: bg = `muted`, text = `muted-foreground`

### Cards

- Background: `card`
- Text: `card-foreground`
- Border: `border` (optional, for outlined variant)
- Radius: `radius-lg`
- Shadow: `shadow-xs` at rest, `shadow-sm` on hover (if interactive)

### Badges / Chips

- Radius: `radius-sm`
- Font: `font-mono` when displaying IDs/codes; `font-sans` otherwise
- Variants: `default`, `secondary`, `destructive`, `outline`
- Small vertical padding (`spacing-1`), medium horizontal (`spacing-2`)

### Modals / Dialogs

- Background: `popover`
- Text: `popover-foreground`
- Radius: `radius-xl`
- Shadow: `shadow-lg`
- Backdrop: semi-transparent `foreground` at low opacity

### Tables

- Header background: `muted`
- Header text: `muted-foreground`, uppercase, small, `font-sans`, weight `500`
- Row background: `background` (odd), `muted/40` (even) — optional zebra
- Cell text: `foreground`
- Numbers in cells: `font-mono`
- Border: `border`

### Sidebar

- Background: `sidebar`
- Text: `sidebar-foreground`
- Active item: `sidebar-primary` bg + `sidebar-primary-foreground` text
- Hover item: `sidebar-accent` bg + `sidebar-accent-foreground` text
- Divider: `sidebar-border`

---

## 9. Web-Specific Rules (`ba33-platform`)

1. **Use Tailwind utilities, not custom CSS.** `bg-primary` not `style={{background: ...}}`.
2. **Use shadcn/ui components as the base layer.** Customize via tokens, not by editing component files.
3. **Compose at the page level.** Pages are layouts of components; components are compositions of tokens.
4. **Dark mode toggles the `.dark` class on `<html>`.** Never on individual elements.
5. **Keep the theme file in `packages/ui-web/src/tokens/`.** The CSS file provided is the master — copy it there.
6. **Tailwind config extends the CSS tokens.** Never redefine values in `tailwind.config.js` that already exist as CSS vars.

---

## 10. Mobile-Specific Rules (`ba33-mobile`)

1. **Theme is generated from `tokens.json`.** Never hand-write Dart theme colors.
2. **Use Material 3 + ba33 theme overrides.** Build on top of `ThemeData` from Material 3, override with ba33 tokens.
3. **Access tokens through the `Ba33Theme` extension**, not hardcoded colors:
   ```dart
   // Wrong
   color: Color(0xFF00BFA5)
   // Right
   color: Theme.of(context).ba33.primary
   ```
4. **Dark mode is driven by `ThemeMode.system`** by default, with manual toggle available.
5. **Use `Theme.of(context).textTheme.xxx` for typography.** Custom text styles must match the scale defined in `ba33_ui`.
6. **Widget library exposes the same components as web.** `Ba33Button`, `Ba33Input`, `Ba33Card`, `Ba33Badge`, `Ba33Sidebar`, etc.
7. **No `MaterialBanner` or random Material widgets for ba33-branded moments.** Use the `ba33_ui` equivalents.
8. **Platform-specific interactions are respected.** Swipe-back on iOS, Material ripple on Android — these stay. But colors, spacing, and typography stay ba33.

---

## 11. Token Sync Rules

1. **`tokens.json` lives in `ba33-platform/packages/design-tokens/`.** It is the single source of truth.
2. **Web consumes it via CSS vars** (the provided theme file).
3. **Mobile syncs it at build time.** A script in `ba33-mobile` pulls `tokens.json` and regenerates `ba33_ui`'s theme Dart file.
4. **Token changes require designer approval.** Opening a PR against `tokens.json` triggers designer review.
5. **Token changes are versioned.** Any change bumps the design system minor version. Breaking changes (removing a token) require a major version and a migration doc.

---

## 12. What You Should Never Do

- Use raw color values (`#...`, `rgb(...)`, `Color(0xFF...)`)
- Invent new semantic names not in the token list
- Mix a foreground with a non-matching background
- Use a shadow on an element that shouldn't be elevated
- Put body text in `font-serif` or `font-mono`
- Introduce `radius-0` or hard corners anywhere
- Ship a component without testing dark mode
- Define colors or spacing in `tailwind.config.js` that contradict the CSS vars
- Hand-edit the generated Dart theme file
- Create a web button that doesn't have a Flutter equivalent (or vice versa)
- Use `chart-1` through `chart-5` for non-chart purposes
- Skip chart colors (e.g., go from `chart-1` directly to `chart-3`)

---

## 13. TL;DR

1. Tokens only. Never raw values.
2. Semantic names (`primary`, `destructive`), never color names.
3. Foreground-background pairs stay together.
4. Sans for UI, mono for IDs/numbers, serif for certificates.
5. `radius-lg` is ba33's default. No hard corners.
6. 8 shadow levels, hierarchy respected.
7. Dark mode always works.
8. Same component names and variants on web and Flutter.
9. `tokens.json` is the single source of truth; both platforms regenerate from it.
10. When in doubt: read the token list and pick the one closest to your intent.