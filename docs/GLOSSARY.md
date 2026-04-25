# Glossary

> Domain terms used across the codebase, the docs, and the cahier de charges.
> Cross-references where applicable.

---

## Letters & codes (NFN framework)

| Term | Meaning | Notes |
|---|---|---|
| **C1** | Source type: shepherd / direct shearing | Primary wool from live animals |
| **C2** | Source type: slaughterhouse / wool-on-skins | Triggers urgency + cold-chain by default |
| **C3** | Source type: third-party aggregator | Cooperative, intermediary, trader |
| **D1** | Phase: dépôt (intermediate logistics) | Sometimes "Dépôt 1" |
| **D2** | Phase: laverie (washing + qualification) | Merged phase — was Lab + Lavage |
| **D3** | Track: textile transformer | Insulation panels, geotextiles, felts |
| **D4** | Track: bio transformer | Biofertilizers, plant supports |
| **E1** | Audit: entry at depot reception | Declared vs actual weight |
| **S1** | Audit: exit at depot dispatch | Manifest + composition |
| **S2** | Dispatch: laverie → D3 (textile) | Grade A/B + good fiber length |
| **S3** | Dispatch: laverie → D4 (bio) | Grade C, short fiber, mild contamination |
| **R1** | Yield: Point Vert (clean / dirty × 100) | Tracked per source for fraud detection |
| **A1** | Alert: depot transport urgency | Auto-fired when occupancy/urgent thresholds breached |
| **P1** | Product code: D3 textile output | Format `P1-XXXXX` (and NFN seal `NFN-P1-...`) |
| **P2** | Product code: D4 bio output | Format `P2-XXXXX` |
| **NFN** | Norme Filière Nationale | The certification body / seal |
| **Ex / Sx** | Internal audits at any phase | Periodic conformity checks |

---

## Workflow vocabulary

| Term | Meaning |
|---|---|
| **Pre-lot** | A wool declaration *before* the collector arrives. Becomes a lot on collection. |
| **Lot** | The atomic traceable unit. Has a QR code, weight, status, source, lineage. |
| **Collection job** | The instruction issued by a depot/admin to a collector. Drives the new two-actor model. |
| **Transport job** | Inter-facility leg (depot → laverie, etc.). Distinct from collection job. |
| **Weigh-in / weigh-out** | Reconciliation pair — source side vs destination side of any handoff. |
| **Reconciliation** | Auto-comparison of weigh-in vs weigh-out; flags > tolerance %. |
| **Lineage** | Split (one parent → many children) or merge (many parents → one child). |
| **Splice** *(synonym)* | Same as lineage operation. |
| **Composite traceability** | When a product comes from multiple parent lots (typical D3 production). |
| **Pricing proposal** | Auto-computed by laverie qualification — base × urgency × source adjust. |
| **Issuance gates** | Requirements before a certification can be issued (E1, S1, R1, S2, Ex/Sx, no anomalies). |
| **Public verify** | Anyone can scan a QR / paste a code at `/verify` — no auth. |

---

## Architectural vocabulary

| Term | Meaning |
|---|---|
| **The spine** | The lot. Every entity hangs off it. |
| **Append-only event log** | The `events` table — every state transition writes a row. Never updated, never deleted. |
| **Two-actor collection model** | The simplification of C1/C2/C3 + Shepherd Lite + Collector App into: (1) wool source, (2) collector executing instructions. |
| **The four wool tracks** | `flux_a1_panels` (insulation panels), `flux_a2_rolls` (rolls), `flux_a3_geotextile` (geotextiles), `flux_b_engrais` (fertilizer). |
| **Class A / Class B** *(Stage 3 depot)* | A = clean, suitable for textile insulation; B = very soiled, suitable for compost/fertilizer. |
| **Pelade / Échauffé** *(extraction methods)* | Pelade = chemical (acid bath, slaughterhouse). Échauffé = natural fermentation. |
| **PP / Jute** *(bag types)* | PP = polypropylene (modern, cheap). Jute = traditional, breathable. |
| **Suint** | Lanolin recovered from washing. Valorizable as a secondary output. |
| **Cahier de charges** | The functional + technical spec document. Lives at `.claude/rules.md`. |

---

## Roles (userType enum)

| Type | Job |
|---|---|
| `central_admin` | Pilots the whole platform. All permissions. |
| `regional_manager` | Region-scoped admin (data filtered by `regionId`). |
| `certification_authority` | Issues / revokes NFN seals. |
| `depot_manager` | Runs a depot. E1, S1, A1, collection job assignment. |
| `laverie_operator` | Runs a laverie. Reception, wash, qualification, S2/S3. |
| `transformer_operator` | Runs a D3 or D4 facility. Production runs, BOMs, products. |
| `sales_agent` | Manages orders, channels, fulfillment. |
| `transporter` | Drives between facilities (mobile-transporter app deleted in v1; persona kept for transport jobs). |
| `collector` | Field collector — executes collection jobs. |
| `shepherd` | Wool source. Note: includes slaughterhouses, butchers, aggregators in the new unified model — the userType name is misleading but kept for back-compat. |
| `buyer` | B2B customer on web-buyer. |
| `institutional` | Ministry user on web-institutional. |
| `system` | Internal — used as `actorType` in events. |

---

## Tech vocabulary

| Term | Meaning |
|---|---|
| **The stack** | NestJS + Drizzle + Postgres + Redis + BullMQ for backend. Next.js + React + Tailwind + shadcn/ui for web. Flutter + Riverpod + go_router for mobile. |
| **Codegen** | `dart run build_runner build` for Riverpod providers; `pnpm drizzle-kit generate` for migrations. |
| **MVVM** | Mobile pattern — `view/`, `view_model/`, `model/`, `widgets/` per feature. |
| **Barrel file** | A package's `lib/{name}.dart` (Dart) or `src/index.ts` (TS) — the only public entry point. |
| **Riverpod provider** | A class annotated `@riverpod` (or function) that exposes state. Generates a `.g.dart` companion. |
| **AsyncValue** | Riverpod's wrapper for async state — `AsyncValue<T>.when(data:, loading:, error:)`. |
| **OKLCH** | Modern color space (perceptually uniform) used by all design tokens. |

---

## Algerian places (seeded regions)

| Code | Region | Type |
|---|---|---|
| DZ-19 | Sétif | wilaya |
| DZ-16 | Alger | wilaya |
| DZ-31 | Oran | wilaya |
| DZ-19-V01 | Sétif village | village (sample) |

---

## Languages used in the apps

| App | Primary UI language | Reason |
|---|---|---|
| mobile-shepherd | Darija + Arabic | Rural users, voice-first |
| mobile-collector | French | Field workers, technical terminology |
| web-operations | French | Operations staff, mixed Arabic/French in labels |
| web-buyer | French (UI) + Arabic for product names | International + national buyers |
| web-institutional | French | Ministry standard |

In production, every user-facing app should support Arabic + French + Darija
+ Tamazight (per the cahier). v1 mixes them based on the assumed audience
of each app.
