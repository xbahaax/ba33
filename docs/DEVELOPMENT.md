# Development

> Conventions, codegen workflows, and rules every contributor should know.
> Pulled from `.claude/code_architecture.md` + `CLAUDE.md` + `AGENTS.md`.

---

## 1. Repo conventions

### Project name

The product name is **ba33**. Lowercase, no space, no uppercase.

| context | form |
|---|---|
| code identifiers | `ba33` |
| TypeScript packages | `@ba33/*` |
| Dart packages | `ba33_*` (snake_case) |
| domains / URLs | `ba33.dz`, `api.ba33.dz` |

### Naming

| Element | Style | Example |
|---|---|---|
| TS files | kebab-case | `lot-creation-screen.tsx` |
| Dart files | snake_case | `lot_creation_screen.dart` |
| Classes / types | PascalCase | `LotListScreen` |
| Functions / vars | camelCase | `calculateYield` |
| Constants | UPPER_SNAKE_CASE | `MAX_LOT_WEIGHT` |
| Enums | PascalCase values | `LotStatus.Announced` |
| Riverpod providers | camelCase + `Provider` suffix | `lotListProvider` |

### Git

- **Conventional commits** with module scope: `feat(collector): add bluetooth scale pairing`, `fix(api): resolve merge artifacts`.
- **Branches:** `feat/<scope>-<short>`, `fix/<scope>-<short>`.
- **One PR per logical change.** Don't bundle.
- Pre-commit: `pnpm turbo lint typecheck test` (CI enforces).

---

## 2. Forbidden patterns (PR rejection list)

- ❌ Importing from another app (apps never import apps)
- ❌ Importing a package's internal path — always go through the barrel
- ❌ Hardcoded color / spacing / radius — always tokens
- ❌ Hand-written types that should come from OpenAPI / generators
- ❌ Hand-written design-system component when one exists in `ba33_ui` / `ui-web`
- ❌ `any` in TypeScript or `dynamic` in Dart without a justification comment
- ❌ `setState` in Flutter for non-trivial state — use Riverpod
- ❌ `Provider`, `Bloc`, `GetX` in Flutter
- ❌ Editing an applied migration file (always make a new one)
- ❌ Editing or deleting an event in the event log
- ❌ `// TODO` without a ticket reference (`// TODO(BA33-142): ...`)
- ❌ Committing commented-out code (Git remembers — delete it)
- ❌ Deploying without lint + typecheck + test

---

## 3. Backend (TypeScript) conventions

### Module structure (NestJS)

Every domain module under `apps/api/src/modules/{name}/`:

```
{name}/
├── {name}.module.ts
├── {name}.controller.ts          # parse → call service → return
├── {name}.service.ts             # business logic
├── {name}.repository.ts          # Drizzle queries only, zero logic
├── dto/                          # request/response shapes
└── __tests__/
    ├── {name}.service.spec.ts
    └── {name}.controller.e2e-spec.ts
```

### Repositories → Services → Controllers

- **Repositories** never hold business logic. Just `db.select/insert/update`.
- **Services** never touch Drizzle directly. Always call repositories.
- **Controllers** never hold logic. They parse, call service, return.
- **Pure domain logic** (yield computation, pricing math, ID validation)
  goes into a future `@ba33/domain` package. Today it lives in service files
  but should migrate.

### Cross-module access

A module reads/writes **only its own tables**. To get data from another
module, call **its service**, never its tables. This means: `LotsService`
never queries `production_runs`. It calls `TransformationService.findRunForLot()`.

### Transactions

Multi-table writes wrap in a transaction:

```ts
await this.db.transaction(async (tx) => {
  const lot = await tx.insert(lots)...;
  await this.eventsService.emit(...);   // implicit: emit uses outer ctx if needed
});
```

In v1, transactions are sometimes elided when the failure mode is
acceptable (e.g., the lot insert succeeds but event insert fails — we lose
the event but the lot is real). This is a v1 pragma; future work hardens it.

### Events

**Every state transition writes an event.** The pattern:

```ts
await this.eventsService.emit({
  eventType: 'lot.collected',
  aggregateType: 'lot',
  aggregateId: lotId,
  actorId,
  actorType: 'collector',
  payload: { sourceId, qrCode, weight },
  occurredAt: new Date(),
  version: 1,
});
```

`actorType` is one of: `user`, `system`, `rule_engine`, `source`,
`collector`, `central_admin`, etc. Use what's most descriptive.

### DTOs + validation

Use `class-validator` + `class-transformer` decorators. Example:

```ts
export class DeclareWoolDto {
  @ApiProperty()
  @IsNumberString()
  estimatedWeightKg: string;

  @ApiPropertyOptional({ enum: ['shepherd', 'slaughterhouse', ...] })
  @IsOptional()
  @IsIn(['shepherd', 'slaughterhouse', 'butcher', 'aggregator', 'other'])
  profession?: '...';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  shearingDate?: string;
}
```

The global validation pipe in `main.ts` rejects invalid payloads with 400
+ field-level error messages. Use `@Transform`, `@Type` for coercions.

### Permissions on endpoints

```ts
@RequirePermissions('depot.receive')
@Post('receptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
async createReception(@Body() dto: CreateDepotReceptionDto) { ... }
```

For role-based gating (legacy):

```ts
@Roles('central_admin', 'regional_manager', 'depot_manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch('jobs/:id/assign')
async assignJob() { ... }
```

Mix with `@RequirePermissions` when both apply.

---

## 4. Frontend (TypeScript / React / Next.js) conventions

### App Router structure

- Every route is a folder under `src/app/`.
- Route groups in parens (`(admin)`, `(buyer)`) don't affect the URL.
- Layouts cascade via `layout.tsx`.
- Server components by default; opt into client with `"use client"`.

### State

- **Server state** via direct fetch in server components, or via the
  `useAsyncData` hook (re-fetches on dependencies).
- **Client state** via `useState` for local UI; **Zustand** for cross-page
  state (cart in web-buyer).
- **No Redux**, no Recoil. Keep it minimal.

### Components

- Atoms come from `@ba33/ui-web` (shadcn/ui).
- Page-level components live in `src/components/{name}-workflow-page.tsx`.
- Feature components nest under `src/components/{feature}/`.
- Always use Tailwind classes; never inline styles or CSS modules.

### Forms

Use uncontrolled `<form>` + `FormData` for simple submit, or controlled state
with `useState` for multi-step. No form library required in v1.

---

## 5. Mobile (Flutter / Dart) conventions

### MVVM with Riverpod

```
lib/features/{feature}/
├── view/                # ConsumerWidget / ConsumerStatefulWidget
├── view_model/          # @riverpod classes (.dart + .g.dart)
├── model/               # Pure-Dart POCOs
└── widgets/             # Local feature components
```

### Riverpod rules

- **`@riverpod` annotation, never manual `Provider((ref) => ...)`.**
- **`ref.watch` in `build`, `ref.read` in callbacks.**
- **`AsyncValue.when(data:, loading:, error:)`** for async — never raw `Future<T>` in UI.
- **One provider per responsibility.** No god-providers.
- **No business logic in widgets.** Move to view model or `ba33_domain`.

### Codegen

After adding/changing any `@riverpod` annotated file:

```bash
cd apps/mobile-{shepherd,collector}
flutter pub get
dart run build_runner build --delete-conflicting-outputs
```

This regenerates the `.g.dart` files. **Don't edit `.g.dart` files by hand**
(except for hot-reload-only placeholder hashes during a hackathon — they'll
be overwritten on the next codegen).

### Design system

- Always `Theme.of(context).ba33` for colors.
- Always `Ba33Spacing.spacing{N}` for padding/margin.
- Always `Ba33Radii.borderRadius{Sm,Md,Lg,Xl,Full}` for corners.
- Default radius: `borderRadiusLg` (12px). **No hard corners anywhere.**

---

## 6. Database conventions

- **UUIDs everywhere.** Every PK is `uuid('id').primaryKey().defaultRandom()`.
- **Timestamps in UTC.** Always `timestamp({ withTimezone: true })`.
- **`createdAt` + `updatedAt`** on every domain table. Use `defaultNow().notNull()`.
- **Soft delete only for `users` + `sources`** (suspension). Never for lots,
  events, products.
- **Strict FKs** with `ON DELETE RESTRICT` for domain entities. Cascade only
  for child collections (e.g., `collection_job_gps_points`).
- **Postgres enums** for closed sets. Never string literals scattered.
- **Indexes follow queries.** Don't add speculative indexes.

### Adding a column

1. Edit the schema file (`apps/api/src/common/database/schema/{table}.ts`).
2. `pnpm --filter @ba33/api db:generate` → creates migration file.
3. Review the SQL — make sure it doesn't drop or rewrite anything.
4. Commit the schema + migration in the same PR.
5. Apply: `make migrate`.

### Adding an enum value

Enums are append-only. To add a value, write a manual migration with
`ALTER TYPE my_enum ADD VALUE 'new_value'`.

### Editing an applied migration

**Never.** Make a new migration that fixes forward. The migration journal
in `infra/db/migrations/meta/_journal.json` tracks what's been applied.

---

## 7. API client packages (TS + Dart)

### Today (v1)

- `packages/ba33_api_client/` (Dart) — hand-written wrappers around Dio.
  Each service maps to one backend module.
- `packages/api-client/` (TS) — stub. Web apps call the API directly via their
  own `lib/api.ts` files.

### Future (post-MVP)

- `apps/api/src/main.ts` already publishes the OpenAPI spec at
  `GET /api/openapi.json` (TODO: confirm wired).
- A `tools/codegen/` script regenerates both clients from the spec.
- Manual edits to generated clients become forbidden.

---

## 8. Adding a new feature — checklist

To add e.g. a new lot status `awaiting_audit`:

- [ ] Add the enum value (manual migration).
- [ ] Update `apps/api/src/common/database/schema/enums.ts` (lotStatusEnum).
- [ ] Update any service that transitions lots — emit event with new status.
- [ ] Update `ba33_domain` (Dart) — add `LotStatus.awaitingAudit`.
- [ ] Update `apps/web-operations/src/lib/format.ts` (status labels).
- [ ] Update `status-badge.tsx` (variant for new status).
- [ ] Add to relevant overview queries (e.g., command center counts).
- [ ] Run `bash scripts/test-pipeline.sh` — confirm 55/55.
- [ ] Document in this folder if behavior visible to user.

---

## 9. Useful patterns

### Pull a token in scripts

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0555000001","password":"password123"}' \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
```

### Query the event log for a lot

```sql
SELECT event_type, actor_type, payload, recorded_at
FROM events
WHERE aggregate_id = '<lot-uuid>'
ORDER BY recorded_at;
```

### Find which migrations have been applied

```sql
SELECT id, hash, created_at
FROM drizzle.__drizzle_migrations
ORDER BY id;
```

### Reset just one feature without `make reset`

```bash
docker exec ba33-postgres psql -U ba33 -d ba33_platform -c \
  "DELETE FROM collection_jobs WHERE id = '<uuid>';"
```

(Avoid for entities with FK children — cascade carefully.)

---

## 10. Where the rules live

If you're confused about why we do something a certain way, check:

| File | Authoritative for |
|---|---|
| `CLAUDE.md` | Critical rules for AI agents working on this repo |
| `AGENTS.md` | Same content, agent-readable |
| `.claude/rules.md` | The full NFN cahier de charges |
| `.claude/code_architecture.md` | Cross-repo architecture rules |
| `.claude/desiegn_system.md` | Design system + token rules |
| `.claude/app_plan.md` | Per-app feature plans |
| `.claude/backend-plan.md` | Backend module plans |
| `.claude/ba33-backend-nestjs-prompt.md` | Detailed NestJS implementation guide |
| `docs/*.md` | This documentation set |

When the docs and the rules conflict, **the rules win**. Update the docs.
