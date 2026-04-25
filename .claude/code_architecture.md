# ba33 — Platform Rules

**Platform:** ba33
**Scope:** Engineering rules across both repositories (web/backend and mobile)
**Audience:** Every developer on the project, day one

---

## 1. The Two Repos

ba33 lives in **two repositories**. They are siblings, not parent-child. Never merge them.

| Repo | Contains | Stack |
|---|---|---|
| `ba33-platform` | Backend + web apps + all TS shared packages | TypeScript, Turborepo, pnpm |
| `ba33-mobile` | 3 Flutter apps + all Dart shared packages | Dart, Flutter, Melos |

The only thing that crosses the boundary between them: **the OpenAPI spec** (for API types) and **the design tokens JSON** (for visual consistency). Everything else is repo-local.

---

## 2. Repo Structure Rules

### `ba33-platform` (TypeScript)

- Five top-level folders only: `apps/`, `packages/`, `tools/`, `infra/`, `docs/`. No others.
- Apps live in `apps/`. Shared libraries live in `packages/`. Nothing else is runnable.
- All packages use the `@ba33/` scope (e.g., `@ba33/domain`, `@ba33/ui-web`).
- Every app and every package has its own `package.json`, `tsconfig.json`, and `README.md`.

### `ba33-mobile` (Flutter)

- Three top-level folders: `apps/`, `packages/`, `docs/`.
- Apps are Flutter projects in `apps/` (`collector`, `shepherd`, `transporter`).
- Shared Dart packages live in `packages/` with the `ba33_` prefix (e.g., `ba33_domain`, `ba33_ui`).
- Melos orchestrates the workspace. `melos.yaml` at the root is authoritative.
- Every app and every package has its own `pubspec.yaml` and `README.md`.

---

## 3. Golden Rules (both repos)

1. **Dependency direction is inward only.** `apps/` depends on `packages/`. `packages/` never depends on `apps/`. No cycles between packages.
2. **Apps never import from other apps.** If two apps need the same code, it moves to a package.
3. **No deep imports.** Always import from the package root (`@ba33/domain`), never from internal paths (`@ba33/domain/src/lot/internal-helper`).
4. **Every significant decision is an ADR.** Write it in `docs/architecture/` before implementing.
5. **Every app and package has a README.** Five sections: what, run, dependencies, key files, open issues.
6. **No commented-out code.** Delete it. Git remembers.
7. **No `TODO` without a ticket reference.** `// TODO(BA33-142): fix this` is allowed. `// TODO: fix` is not.

---

## 4. TypeScript Repo Rules (`ba33-platform`)

1. **Strict TypeScript everywhere.** `strict: true` in every `tsconfig`. No `any` without a comment explaining why.
2. **Types live in `@ba33/types`.** One source of truth for shared entity types, DTOs, and enums. No duplication.
3. **Validation lives in `@ba33/validation`.** Zod schemas run on both client and server. Never hand-validate.
4. **Domain logic is framework-free.** `@ba33/domain` imports zero React, Next.js, NestJS, or any framework. Only TypeScript and small utilities.
5. **The API client is generated.** `@ba33/api-client` is regenerated from the backend's OpenAPI spec via `pnpm codegen`. Never hand-write API types.
6. **Inside apps, organize by feature.** `src/features/{feature}/` contains screens, components, hooks, and local logic for that feature. No top-level `components/`, `hooks/`, or `services/` folders.
7. **Migrations live in `infra/db/migrations/`.** Not inside `apps/api/`. Migrations are immutable once deployed.
8. **Events are append-only.** Corrections are new events, never edits.
9. **IDs are namespaced.** Offline-generated IDs use device namespacing to avoid collisions.
10. **Run `pnpm turbo lint typecheck test` before every PR.** CI enforces it anyway.

---

## 5. Flutter Repo Rules (`ba33-mobile`)

### General

1. **Dart 3+ with sound null safety.** No nullable types without reason.
2. **`analysis_options.yaml` is shared.** One config at the root, extended by every package.
3. **Every package has `pub.dev`-ready structure** even though nothing is published. Consistent anatomy.
4. **Melos commands are the only way to run multi-package tasks.** `melos bootstrap`, `melos test`, `melos analyze`. Never script them manually.
5. **Inside apps, organize by feature.** `lib/features/{feature}/` contains screens, widgets, providers, and models for that feature.

### State management — Riverpod

6. **Riverpod is the only state management library.** No `setState` for anything beyond trivial local UI state. No Provider, Bloc, GetX, MobX, or Redux.
7. **Use code generation with `riverpod_generator`.** Providers are declared with `@riverpod` annotations, not manually via `Provider((ref) => ...)`.
8. **One provider per responsibility.** A provider does one thing. Composing providers is cheap; god-providers are not.
9. **Providers live next to the feature.** `lib/features/lots/providers/lot_list_provider.dart`. Global app-wide providers live in `lib/shared/providers/`.
10. **Async state uses `AsyncValue`.** Never `Future<T>` raw in UI. `AsyncValue.when(data:, loading:, error:)` or the pattern-matching equivalent.
11. **Prefer `ref.watch` in UI, `ref.read` in callbacks.** `ref.watch` during build, `ref.read` inside `onPressed` and similar.
12. **Keep providers testable.** Any provider that makes an HTTP call or touches the DB uses dependency overrides in tests via `ProviderContainer` with overrides.
13. **No business logic in widgets.** Widgets read from providers and render. Logic lives in providers or in `ba33_domain`.

### Data and persistence

14. **Drift is the local database.** Not Hive, Isar, or sqflite directly. Drift gives us typed SQL and migrations.
15. **Offline sync goes through `ba33_offline_sync`.** Never roll custom queue logic inside an app.
16. **All IDs are generated through `ba33_domain`'s ID generator.** Never `Uuid().v4()` for domain entities.

### Navigation

17. **`go_router` is the only router.** Declared once in `lib/navigation/`, not scattered across screens.
18. **Routes are typed.** Use `go_router` type-safe routes where possible.

### Testing

19. **Every provider has a unit test.** Using `ProviderContainer` with overrides.
20. **Every screen has a widget test for the happy path.** Detailed integration tests for critical flows (lot creation, sync, scan).

---

## 6. Design System Rules (both repos)

ba33 has **one visual identity** that must look and feel the same on web and mobile. The same primary color, the same spacing scale, the same typography, the same component vocabulary.

### Source of truth

1. **Design tokens live in one place.** `ba33-platform/packages/design-tokens/tokens.json`. This is the single source of truth for colors, spacing, typography scale, radii, shadows, motion.
2. **Every consumer pulls from `tokens.json`.** Web imports it directly. Mobile syncs it at build time (same mechanism as the OpenAPI spec).
3. **No magic values in apps.** Never `color: '#1E40AF'` or `Color(0xFF1E40AF)`. Always `tokens.color.primary.500`.

### Token categories (same names across platforms)

| Category | Examples |
|---|---|
| Color | `primary`, `secondary`, `surface`, `success`, `warning`, `danger`, `info`, `neutral` |
| Spacing | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |
| Typography | `display`, `heading`, `body`, `caption`, `mono` + sizes |
| Radii | `none`, `sm`, `md`, `lg`, `full` |
| Shadows | `sm`, `md`, `lg`, `xl` |
| Motion | durations + easings |

These names are identical on web and mobile. A designer saying "use `primary.500`" means the same blue on both.

### Components

4. **Every reusable component exists with the same name and API on both platforms.** If `Button` on web has `variant={'primary'|'secondary'|'ghost'}`, then `Button` in Flutter has `variant: ButtonVariant.primary | secondary | ghost`.
5. **Web components live in `@ba33/ui-web`.** Flutter components live in `ba33_ui`.
6. **Component list is maintained in `docs/design-system/components.md`.** Every component is added there first, implemented second.
7. **Accessibility is non-negotiable.** Every interactive component supports keyboard navigation (web), screen readers (both), and meets contrast ratios.

### Visual consistency checklist

Before any component ships:
- Same name on both platforms?
- Same variants on both platforms?
- Uses only tokens (no magic values)?
- Documented in `docs/design-system/`?
- Has usage examples for both web and Flutter?

### When platforms differ

8. **Platform conventions are respected.** iOS behaviors that users expect (swipe-back, etc.) are kept. Android Material patterns are kept. But the **visual language** (colors, spacing, type) is unified.
9. **If a component cannot exist on one platform, it lives only on the other.** Document why in the component file.

---

## 7. Cross-Repo Contract Rules

The two repos communicate through exactly two shared artifacts. These are the only cross-repo dependencies.

### Contract 1 — OpenAPI spec

1. **Backend (`ba33-platform/apps/api`) owns the OpenAPI spec.** It is generated from the NestJS controllers + DTOs.
2. **The spec is published as `openapi.json`.** Hosted at a known URL (e.g., `https://api.ba33.dz/openapi.json`) or committed to the platform repo.
3. **`ba33-platform` generates `@ba33/api-client` from the spec.** TS client for web apps.
4. **`ba33-mobile` generates `ba33_api_client` from the spec.** Dart client for Flutter apps.
5. **Both clients are regenerated on every spec change.** Automated in CI.
6. **Manual edits to generated clients are forbidden.** Ever.

### Contract 2 — Design tokens

7. **Tokens live in `ba33-platform/packages/design-tokens/tokens.json`.**
8. **Web consumes tokens directly** via TypeScript imports + Tailwind preset generation.
9. **Mobile syncs tokens at build time.** A CI step in `ba33-mobile` pulls the latest `tokens.json` and regenerates `ba33_ui`'s theme file.
10. **Changing tokens is a design decision, not a code decision.** Tokens PRs require designer approval.

### Contract 3 — i18n strings (optional shared)

11. **If i18n strings are shared, they live in `ba33-platform/packages/i18n/locales/`.**
12. **Mobile pulls them at build time** the same way as tokens. If not shared, mobile maintains its own.

---

## 8. Naming Conventions

### Project and brand

1. The product name is **ba33**. Lowercase, no space, no uppercase.
2. In code identifiers where lowercase-only is needed: `ba33`.
3. In TypeScript package scope: `@ba33/...`.
4. In Dart package names: `ba33_...` (snake_case, per Dart convention).
5. In domain names / URLs: `ba33.dz`, `api.ba33.dz`, `app.ba33.dz`, etc.

### Code naming

| Element | Style | Example |
|---|---|---|
| TypeScript files | kebab-case | `lot-creation-screen.tsx` |
| Dart files | snake_case | `lot_creation_screen.dart` |
| Classes / types | PascalCase | `Lot`, `SourceType` |
| Functions / vars (TS) | camelCase | `calculateYield` |
| Functions / vars (Dart) | camelCase | `calculateYield` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOT_WEIGHT` |
| Enums | PascalCase values | `LotStatus.Announced` |
| React components | PascalCase file | `LotCard.tsx` |
| Flutter widgets | PascalCase class | `LotCard` in `lot_card.dart` |
| Riverpod providers | camelCase + `Provider` suffix | `lotListProvider` |
| Packages (TS) | kebab-case | `@ba33/offline-sync` |
| Packages (Dart) | snake_case | `ba33_offline_sync` |

### Git

6. Conventional commits: `feat(collector): add bluetooth scale pairing`.
7. Branches: `feat/collector-bluetooth-scale`, `fix/depot-weight-mismatch`.
8. Scopes match app or package names.

---

## 9. Forbidden Patterns

Things that will get a PR rejected, both repos:

- Importing from another app
- Importing from a package's internal path (bypass the barrel)
- Hardcoding a color, spacing, or radius value instead of using tokens
- Hand-writing types that should come from the OpenAPI spec
- Hand-writing a button, input, or modal that already exists in the design system
- Using `any` in TypeScript or `dynamic` in Dart without justification
- Using `setState` in Flutter for non-trivial state (use Riverpod)
- Using `Provider`, `Bloc`, `GetX`, or any non-Riverpod state library in Flutter
- Editing an existing migration file
- Editing or deleting an event in the event log
- Writing a `TODO` without a ticket reference
- Committing commented-out code
- Deploying without running lint + typecheck + test

---

## 10. TL;DR

1. Two repos: `ba33-platform` (TS) and `ba33-mobile` (Flutter). Never merged.
2. One bridge: OpenAPI spec. One design bridge: `tokens.json`.
3. Riverpod only, on Flutter. Drift for local DB. go_router for navigation.
4. Design system is unified in tokens and component names across web and mobile.
5. Organize by feature, not by layer, inside every app.
6. Apps never import apps. Packages never import apps. Domain is framework-free.
7. Everything is lowercase `ba33` in code and branding.

---

## 11. Standalone Service Modules

Some capabilities must be prepared before they are integrated into the live backend. These modules are allowed to exist in `apps/api/src/modules/` without being imported into `src/app.module.ts` yet.

### `sheep-ai`

- Purpose: infer probable ram breed and extracted physical traits from an uploaded image.
- Structure: `controller -> service -> provider interface -> provider implementation`.
- Initial provider: Google Gemini Vision API.
- Future provider: local CV/ML model with no controller contract changes.
- Contract: strict JSON response with normalized traits and confidence handling.
- Rule: Gemini SDK or HTTP calls never happen in the controller.

### `sms-gateway`

- Purpose: receive inbound SMS traffic from rural actors, persist messages, resolve senders by phone number, and capture geolocation when available.
- Structure: `controller -> service -> repository -> database/events`.
- Matching source of truth: `sources.contactPhone`.
- Persistence: dedicated `sms_messages` table plus append-only `sms.inbound.received` events.
- Rule: provider-specific webhook handling remains isolated from the rest of the domain modules.

### Boundary rule

- Standalone modules can depend on shared infrastructure such as `DatabaseModule` and `EventsModule`.
- Standalone modules are not imported into the main `AppModule` until the contract, webhook shape, env vars, and operational validation are complete.
