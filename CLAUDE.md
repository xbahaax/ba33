# ba33 Platform — Agent Rules

## Project Overview

ba33 is the NFN wool traceability platform for Algeria. This is a **monorepo** containing:
- **Backend API** (`apps/api/`) — NestJS + Drizzle + PostgreSQL
- **3 Flutter mobile apps** (`apps/mobile-collector/`, `apps/mobile-shepherd/`, `apps/mobile-transporter/`)
- **Web apps** (`apps/web-operations/`, `apps/web-buyer/`, `apps/web-institutional/`)
- **Shared Flutter packages** (`packages/ba33_ui/`, `packages/ba33_domain/`, `packages/ba33_api_client/`, `packages/ba33_offline_sync/`)
- **Backend packages** in `packages/` with `@ba33/` scope

Read `.claude/rules.md` for the full cahier des charges and `.claude/code_architecture.md` for the architecture plan.

---

## Critical Rules — READ BEFORE WRITING ANY CODE

### 1. Architecture

- **Feature-based organization.** Every app uses `lib/features/{feature}/` with subdirs: `view/`, `view_model/`, `model/`, `widgets/`.
- **MVVM pattern.** Views are widgets (in `view/`). ViewModels are Riverpod providers (in `view_model/`). Models are in `ba33_domain` or local `model/`.
- **Dependency direction is inward only.** `apps/` depends on `packages/`. `packages/` never depends on `apps/`. Apps never import from other apps.
- **No deep imports.** Import from the package barrel file (`package:ba33_domain/ba33_domain.dart`), never from internal paths.
- **Domain is framework-free.** `ba33_domain` has zero Flutter/Riverpod imports. Only plain Dart.

### 2. State Management — Riverpod ONLY

- **Riverpod is the only state management library.** No Provider, Bloc, GetX, MobX, or Redux. Ever.
- **Use `riverpod_generator` with `@riverpod` annotations.** Never manually create `Provider((ref) => ...)`.
- **One provider per responsibility.** No god-providers.
- **Providers live next to the feature.** `lib/features/lots/view_model/lot_list_view_model.dart`. Global providers in `lib/shared/providers/`.
- **Async state uses `AsyncValue`.** Never raw `Future<T>` in UI. Use `AsyncValue.when(data:, loading:, error:)`.
- **`ref.watch` in build, `ref.read` in callbacks.** No exceptions.
- **No business logic in widgets.** Widgets read from providers and render. Logic lives in providers or `ba33_domain`.
- **After creating/modifying a `@riverpod` annotated file**, run `dart run build_runner build --delete-conflicting-outputs` in that app directory to generate the `.g.dart` file.

### 3. Navigation — go_router ONLY

- **`go_router` is the only router.** Declared once in `lib/navigation/router.dart`.
- **Use typed routes where possible.**

### 4. Design System — STRICTLY FOLLOW ba33_ui

Read `.claude/desiegn_system.md` for the full design system specification.

- **NEVER use raw color values.** No `Color(0xFF...)`, no `Colors.red`, no hex. Use `Theme.of(context).ba33.primary` etc.
- **Access colors via the `ba33` extension:** `Theme.of(context).ba33.{tokenName}`
- **Every foreground has a paired background.** `primary` with `primaryForeground`, etc.
- **Both light and dark mode must work.** Test both before considering done.
- **Typography:** Sans (`textTheme`) for UI, `Ba33Typography.mono()` for IDs/numbers/weights, `Ba33Typography.serif()` for certificates.
- **Spacing:** Use `Ba33Spacing.spacing{N}` constants. Never arbitrary pixel values.
- **Radii:** `Ba33Radii.borderRadiusLg` is the default (12px). No hard corners. Ever.
- **Shadows:** Use `Ba33Shadows` levels. Respect hierarchy (modals > popovers > cards).

### 5. Data & Persistence

- **Drift for local database** (when implemented). Not Hive, Isar, or sqflite.
- **Offline sync through `ba33_offline_sync`.** Never roll custom queue logic.
- **All entity IDs generated through `ba33_domain`'s `IdGenerator`.** Never `Uuid().v4()` directly.
- **Events are append-only.** Corrections are new events, never edits.

### 6. Naming Conventions

| Element | Style | Example |
|---|---|---|
| Dart files | snake_case | `lot_creation_screen.dart` |
| Classes | PascalCase | `LotListScreen` |
| Variables/functions | camelCase | `calculateYield` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOT_WEIGHT` |
| Riverpod providers | camelCase + Provider suffix | `lotListProvider` |
| Packages | snake_case with `ba33_` prefix | `ba33_offline_sync` |

### 7. Git Conventions

- **Conventional commits:** `feat(collector): add bluetooth scale pairing`
- **Scopes:** `collector`, `shepherd`, `transporter`, `ba33-ui`, `ba33-domain`, `api`, `web-ops`
- **Branches:** `feat/collector-bluetooth-scale`, `fix/depot-weight-mismatch`

### 8. What NOT to Do (PR Rejection List)

- Import from another app
- Import from a package's internal path (bypass the barrel)
- Use raw color values (`Color(0xFF...)`, `Colors.red`)
- Use `setState` for non-trivial state
- Use any state management besides Riverpod
- Use `dynamic` without justification
- Write a `TODO` without a ticket reference (`// TODO(BA33-xxx): ...`)
- Commit commented-out code
- Introduce `radius-0` or hard corners
- Ship without testing dark mode
- Create a component without checking if ba33_ui already has it
- Hand-write API types (they come from OpenAPI codegen)
- Use `print()` for debugging (use proper logging)

### 9. Running the Flutter Apps

```bash
# Get dependencies for a specific app
cd apps/mobile-collector && flutter pub get

# Run build_runner after modifying @riverpod providers
cd apps/mobile-collector && dart run build_runner build --delete-conflicting-outputs

# Run the app
cd apps/mobile-collector && flutter run

# Analyze
cd apps/mobile-collector && flutter analyze

# Run tests
cd apps/mobile-collector && flutter test
```

### 10. Package Dependency Graph

```
mobile_collector ─┐
mobile_shepherd  ─┼─► ba33_ui (theme, components)
mobile_transporter┘   ba33_domain (models, enums, utils)
                      ba33_api_client (generated API client)
                      ba33_offline_sync (offline queue engine)
```

Apps depend on packages. Packages never depend on apps. `ba33_domain` has zero Flutter dependency.
