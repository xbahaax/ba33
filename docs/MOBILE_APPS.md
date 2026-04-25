# Mobile Apps

Two Flutter apps, both Riverpod + go_router, both consuming `@ba33/api_client`
to talk to the same `/api/v1/*` backend as the web apps.

---

## 1. mobile-shepherd

**Purpose.** The unified app for any wool source — shepherd, slaughterhouse,
butcher, aggregator, or "other". One identity, one button, one form.

**Path.** `apps/mobile-shepherd/`
**Languages.** Darija + Arabic UI strings.
**Min Android.** 7+ (intentional — covers rural device reality).

### 1.1 Feature inventory

```
lib/
├── main.dart                            ProviderScope + MaterialApp.router
├── navigation/router.dart               go_router (splash → onboarding → login
│                                         → profession picker → home tabs)
├── shared/providers/
│   ├── api_provider.dart                Dio client + service providers
│   ├── auth_provider.dart               JWT, isAuthenticatedProvider
│   ├── onboarding_provider.dart         SharedPreferences "seen" flag
│   └── profession_provider.dart         SourceProfession enum (persisted)
└── features/
    ├── splash/                          1.1s brand splash → routes onward
    ├── onboarding/
    │   ├── intro_screen.dart            3-slide intro carousel
    │   └── profession_picker_screen.dart  pick profession at first login
    ├── auth/                            login (phone + password)
    ├── home/                            shell with 3 bottom tabs
    ├── declaration/
    │   ├── declaration_screen.dart      home tab — single big "I have wool" button
    │   ├── declaration_form_screen.dart 12-field form (rewritten — see below)
    │   ├── declaration_success_screen.dart
    │   └── widgets/                     location_status (no more weight_estimator)
    ├── receipts/                        history of declarations
    └── profile/                         user info + change profession + logout
```

### 1.2 The declaration form (12 fields)

Replaced the old "weight category cards" with a real form keyed off the
backend `DeclareWoolDto`:

| # | Field | UI | DTO key |
|---|---|---|---|
| 1 | Weight (kg) | numeric input, decimal allowed | `estimatedWeightKg` |
| 2 | Bag count | numeric input | `bagCount` |
| 3 | Bag type | chips PP/jute | `bagType` |
| 4 | Shearing date | date picker | `shearingDate` |
| 5 | Sheep breed | text (Ouled Djellal, Hamra, Rumbi…) | `sheepBreed` |
| 6 | Last parasite treatment | date picker | `lastParasiteTreatmentDate` |
| 7 | Surnom (nickname) | text | `surnom` |
| 8 | Mazraa / shop name | text (label adapts to profession) | `mazraa` |
| 9 | Location | auto-GPS + manual refresh | `latitude`, `longitude` |
| 10 | Photo | camera capture, preview rendered | `photoId` (uploaded first) |
| 11 | Notes | multi-line text | `notes` |
| 12 | Profession | injected from `professionProvider` | `profession` |

**Profession-aware sections:**
- **Shepherd-only** sections show: shearing date, breed, parasite treatment.
- **Slaughterhouse / butcher** sections show: extraction date.
- **Aggregator / other** sections hidden — they get the base fields only.

### 1.3 Routing flow

```
splash (1.1s)
  ├─ no profession + auth ─► /onboarding/profession
  ├─ not seen onboarding ──► /onboarding   (3-slide intro)
  ├─ not auth ─────────────► /login
  └─ all good ─────────────► /  (declaration home)
```

Onboarding "seen" persisted via SharedPreferences key `onboarding_seen_v1`.

### 1.4 Key view models

- `DeclarationViewModel` — holds `DeclarationFormState` (weight, bagCount,
  bagType, shearingDate, sheepBreed, lastParasiteTreatmentDate, surnom,
  mazraa, notes, lat/lng, photoPath, isSubmitting, isSubmitted, error).
  - `submit()` uploads photo first (non-blocking on failure), then POSTs to
    `/collection/pre-lots/declare` with all 12 fields + profession from
    `professionProvider`.
- `OnboardingSeen` — async notifier reading SharedPreferences.
- `Profession` — async notifier reading SharedPreferences. Setter persists.
- `Auth` — JWT + login/logout. `isAuthenticatedProvider` derives a bool.

### 1.5 Dependencies (pubspec.yaml)

```yaml
flutter_riverpod: ^2.6.1
riverpod_annotation: ^2.6.1
go_router: ^14.8.1
geolocator: ^13.0.2
image_picker: ^1.1.2
permission_handler: ^11.3.1
shared_preferences: ^2.3.0
ba33_ui:           path: ../../packages/ba33_ui
ba33_api_client:   path: ../../packages/ba33_api_client
ba33_domain:       path: ../../packages/ba33_domain
```

### 1.6 Run

```bash
make shepherd                # uses default Make var SIMULATOR_ID
# or:
cd apps/mobile-shepherd && flutter run --dart-define=API_URL=http://localhost:3001
```

---

## 2. mobile-collector

**Purpose.** Instruction-driven app for field collectors. No autonomous
planning — the collector just executes jobs the depot issues.

**Path.** `apps/mobile-collector/`
**Languages.** French UI strings.

### 2.1 Feature inventory

```
lib/
├── main.dart
├── navigation/router.dart               splash → onboarding → login → home
├── shared/providers/
│   ├── api_provider.dart
│   ├── auth_provider.dart
│   ├── onboarding_provider.dart         (same pattern as shepherd)
│   └── id_generator_provider.dart       (legacy, still around)
└── features/
    ├── splash/                          brand splash
    ├── onboarding/intro_screen.dart     3-slide intro (queue / GPS / arrival)
    ├── auth/                            login (phone + password)
    ├── home/                            2-tab shell: Collectes + Profil
    ├── jobs/
    │   ├── model/collection_job.dart    domain model + JSON parsing
    │   ├── view/job_list_screen.dart    queue (urgent + à faire sections)
    │   ├── view/job_detail_screen.dart  detail + Maps link + accept/start
    │   ├── view/active_job_screen.dart  GPS streaming + arrival detection
    │   ├── view/arrival_form_screen.dart  combined declared + observed form
    │   ├── view_model/jobs_view_model.dart      list + accept
    │   ├── view_model/active_job_view_model.dart  GPS + lifecycle
    │   └── widgets/job_card.dart        list card
    └── profile/                         stats + logout
```

### 2.2 The job queue UX

`JobListScreen`:
- Pulls `GET /collection/jobs/me` on init + every 15s.
- Splits into **URGENT** (red badge) and **À FAIRE** sections.
- Each `JobCard` shows: source name, profession badge, address, depot
  destination, declared weight, status chip.

`JobDetailScreen`:
- Loads via `ActiveJobViewModel.load(jobId)` on mount.
- Shows source identity (name, profession, address, phone) + depot.
- **Ouvrir Google Maps** button — opens `https://www.google.com/maps/dir/?api=1&destination=lat,lng&travelmode=driving`.
- Action button adapts to job status:
  - `pending`/`assigned` → **Accepter**
  - `accepted` → **Démarrer** (begins GPS tracking + navigates to active screen)
  - `in_progress`/`arrived` → **Continuer** (back to active screen)

### 2.3 Active job + GPS arrival

`ActiveJobScreen` (after Démarrer):
- Banner: "X m du départ" or green "Vous êtes au point de départ".
- Card: stats (GPS points enregistrés, vitesse, précision).
- Background: GPS stream (10m distance filter, best accuracy).
- Periodic push: `_pushTimer` every 30s flushes batched points to
  `POST /collection/jobs/:id/gps`. Failure re-queues.
- `arrivalRadiusMeters = 150` — when `Geolocator.distanceBetween` ≤ 150,
  the "Confirmer l'arrivée" button enables.
- Manual fallback: "Je suis arrivé manuellement" with confirm dialog
  (avoids accidental taps).

`ArrivalFormScreen`:
- Read-only top card: source-declared data (weight, notes).
- Editable fields: actual weight (required), state quick (chips), cold-chain
  temp (slaughter/butcher only), notes.
- Submit → `POST /complete` → `{job, lot}` → navigates to `/`.
- Resets `jobsViewModelProvider` so the queue refreshes.

### 2.4 Routing flow

```
splash
  ├─ not seen onboarding ─► /onboarding (3 slides)
  ├─ not auth ────────────► /login
  └─ ─────────────────────► /  (jobs queue)
                            └─► /jobs/:id
                                └─► /jobs/:id/active
                                    └─► /jobs/:id/arrival
```

### 2.5 Dependencies

```yaml
flutter_riverpod: ^2.6.1
riverpod_annotation: ^2.6.1
go_router: ^14.8.1
geolocator: ^13.0.2
url_launcher: ^6.3.1
shared_preferences: ^2.3.0
ba33_ui / ba33_api_client / ba33_domain  (path)
```

### 2.6 Run

```bash
make collector
# or:
cd apps/mobile-collector && flutter run --dart-define=API_URL=http://localhost:3001
```

---

## 3. After pulling, run codegen

Both apps use Riverpod's code generation. Several `.g.dart` files
in this repo were hand-written with placeholder hashes (so the apps run
without codegen, but Riverpod will warn about stale hashes). To fix:

```bash
cd apps/mobile-shepherd && flutter pub get && \
  dart run build_runner build --delete-conflicting-outputs

cd apps/mobile-collector && flutter pub get && \
  dart run build_runner build --delete-conflicting-outputs
```

---

## 4. Shared design system (ba33_ui)

Both apps consume `packages/ba33_ui` for theme + components:

| Class | Purpose |
|---|---|
| `Ba33Theme.light()` / `.dark()` | MaterialApp themes |
| `Theme.of(context).ba33` | extension giving access to `primary`, `card`, `mutedForeground`, etc. |
| `Ba33Spacing.spacing{1..16}` | 4px-step spacing constants |
| `Ba33Radii.borderRadiusLg` | default 12px corners (signature) |
| `Ba33Typography.serif()` / `.mono()` | font helpers |
| `Ba33Button` | primary/secondary/outline/ghost/destructive variants |
| `Ba33Input` | labeled text input |
| `Ba33Card` | standard card wrapper |
| `Ba33Badge` | with primary/secondary/destructive/outline variants |
| `Ba33ChoiceChips<T>` | generic chip selector |
| `Ba33EmptyState` | empty list placeholder with icon + action |

**Rule.** No raw colors anywhere. Always go through `Theme.of(context).ba33`.

---

## 5. ba33_api_client (Dart)

`packages/ba33_api_client/` exposes services that wrap Dio:

| Service | Maps to |
|---|---|
| `AuthService` | `/auth/*` |
| `CollectionService` | `/collection/*` (pre-lots, jobs, collectors) |
| `LotsService` | `/lots/*` |
| `TransportService` | `/transport/*` |
| `SourcesService` | `/sources/*` |
| `EventsService` | `/events/*` |
| `FilesService` | `/files/upload`, etc. |

Each service takes a `Ba33ApiClient` (which is a Dio wrapper with `setAccessToken`
and `clearAccessToken`).

---

## 6. ba33_domain

Pure-Dart, zero Flutter dependency. Holds:

- Enums: `SourceType`, `LotStatus`, `UserRole`, `DeclarationStatus`, `Grade`,
  `WoolState`, `WeightCategory`.
- Models: `Declaration`, `Lot`, `User`.
- Utilities: `IdGenerator`.

**Rule.** Never import Flutter or Riverpod from this package. Pure logic only.

---

## 7. ba33_offline_sync (stub)

Currently a placeholder. The plan: an offline event queue backed by Drift,
with conflict resolution rules (events append-only, lots first-writer-wins
for creation, last-writer-wins for mutable fields).

For v1, the apps work online. The backend's `sync` module endpoints are ready
but no client uses them yet.
