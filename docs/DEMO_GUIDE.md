# Demo Guide

> Step-by-step script for the hackathon demo. Assumes the platform is
> running (`make` returned successfully and the seed ran).
>
> Total demo time: ~7 minutes. Adjust pace based on judge engagement.

---

## Pre-flight checklist (do this 5 minutes before)

```bash
# 1. Boot everything
make

# 2. Run the smoke test — proves it all works
bash scripts/test-pipeline.sh
# → Results: 55 pass · 0 fail · 0 skip
```

If you reset between demos:
```bash
make reset      # wipes volumes, re-seeds, restarts
```

Open these tabs:
1. `http://localhost:3000/login` — web-operations
2. `http://localhost:3001/verify` — public certificate verifier (web-buyer)
3. `http://localhost:3001/api/docs` — Swagger (in case a judge asks)

Have your phone (or simulator) ready with both mobile apps installed.

Personas you'll use:
- Shepherd (mobile): `0555000010` / `password123`
- Collector (mobile): `0555000002` / `password123`
- Depot manager (web): `0555000003` / `password123`

---

## The story (the elevator pitch — 30 seconds)

> Algeria produces 25,000 tonnes of wool a year. Most of it is wasted because
> there's no traceability — no buyer trusts the origin, no shepherd gets a
> fair price. ba33 is a single platform that traces every kilogram from the
> field to the certified product. One backend serves all six apps: the
> shepherd's app, the collector's app, three web portals, and a public
> verification page. Every state transition is an immutable event. We're
> going to walk through it end-to-end.

---

## Act 1 — A shepherd declares wool (90 seconds)

**On the shepherd's phone (`mobile-shepherd`):**

1. **Splash** appears (1s) → branded green screen with "ba33".
2. **Onboarding** carousel (3 slides in Darija): "كل صوف يبدا منك", "تكتيكة وحدة", "تتبع كامل". Tap **يلا نبداو**.
3. **Login**: phone `0555000010`, password `password123`.
4. **Profession picker** (first time only): pick **فلاح** (shepherd). Tap **متابعة**.
5. **Home**: a single big green button **"عندي صوف جاهز"**. Tap it.
6. **Form**:
   - Weight: `25.5` kg
   - Bag count: `3`, Bag type: **كياس جوت** (jute)
   - Shearing date: today (date picker)
   - Breed: type "Ouled Djellal"
   - Location: auto-filled from GPS (or tap **Refresh** if needed)
   - Mazraa: type "Mazraa Demo"
   - Notes: optional
7. Tap **أكد التصريح** → success screen.

**Talking point:**
> "Same form for any wool source — shepherd, slaughterhouse, butcher,
> aggregator. Profession picker once at first login adapts the form. The
> backend just received the declaration and **automatically issued a
> collection job to the closest depot**. No depot manager had to do anything
> yet."

---

## Act 2 — Depot manager assigns a collector (45 seconds)

**On `web-operations`:**

1. Login at `http://localhost:3000/login` as `0555000003` / `password123`.
2. Land on `/depot`.
3. Top of the page: **"Missions de collecte"** card. The new pending mission
   from Act 1 is here, with:
   - Source name + profession badge
   - Address + depot destination
   - Declared weight
4. Pick a collector from the dropdown (**Amina Collecte**).
5. Click **Assigner**. Toast confirms.

**Talking point:**
> "The mission is now assigned. The collector's mobile app will see it
> within 15 seconds — the panel auto-refreshes. The depot manager has 9
> other queues to manage from this screen: receptions, dispatches, A1
> alerts, intake queue."

---

## Act 3 — Collector executes the mission (2 minutes)

**On the collector's phone (`mobile-collector`):**

1. **Splash → Onboarding** (3 French slides about queue + GPS + arrival
   form) → **Commencer**.
2. **Login** as `0555000002` / `password123`.
3. **Collectes** tab — the new job is at the top under **À FAIRE**.
4. Tap the job → **Détails screen**:
   - Source name + address
   - Depot destination
   - Declared weight (25.5 kg)
   - **Ouvrir Google Maps** button (opens external nav)
5. Tap **Accepter la mission** → button changes to **Démarrer le trajet**.
6. Tap **Démarrer** → **Active job screen** opens.
   - Banner: "X m du départ" (or green "Vous êtes au point de départ" if you're at the lat/lng)
   - GPS card: points enregistrés, vitesse, précision
7. (For the demo, since you're not actually driving) Tap **Je suis arrivé manuellement** → confirm dialog.
8. **Arrival form screen** opens:
   - Top card shows what the source declared (25.5 kg, notes)
   - Real weight: type `24.8` (slightly different — to show reconciliation)
   - State: chip **Propre**
   - Notes: "Lot OK"
9. Tap **Soumettre la collecte** → toast "Mission terminée" → back to home.

**Talking point:**
> "Submitting the form created the lot, closed the pre-lot, completed the
> job. Auto-detected GPS arrival within 150m. The arrival form shows the
> declared data side-by-side with what the collector measures — that's the
> reconciliation point. The reconciliation will fire in the background."

---

## Act 4 — End-to-end visibility (1 minute)

**Switch to `web-operations` again:**

1. Go to `/depot` — refresh. The mission card shows the job is now
   **completed** (greyed). The new lot is in the **Intake queue**.
2. Click `/admin` from the sidebar.
3. **Command center** dashboard — count metrics, flow visualization,
   recent events list shows the just-fired events:
   - `lot.collected` — by Amina Collecte
   - `collection.job.completed`
   - `collection.job.arrived`
   - `collection.job.started`
   - `collection.job.accepted`
   - `collection.job.assigned`
   - `collection.job.issued` — by system
   - `collection.prelot.announced` — by source

**Talking point:**
> "Every state transition wrote an immutable event. There's a full audit
> trail of who did what, when. The admin sees this live across every actor
> and every facility."

4. Click `/admin/traceability`. Paste the lot's QR code.
5. Page renders the full chain — source → collection → arrival → (if you've
   already done downstream phases) → depot → laverie → transformation → cert.

**(Optional)** If a judge asks "What about the rest of the chain?":

```bash
# In a terminal
bash scripts/test-pipeline.sh
```

→ 55/55 green. Show them. The full chain is tested live with curl.

---

## Act 5 — Public certificate verification (45 seconds)

**Switch to `http://localhost:3001/verify`** (the public web-buyer page —
no login required):

1. Show the page: clean, minimal, designed for trust.
2. Enter `NFN-P1-00042-X7` → tap **Vérifier**.
3. **Green card**: "Certificat Valide"
   - Code, type (P1), grade (A), region (Tiaret)
   - Date de certification
   - Traceability summary inside: collection date, washing yield %, audits passed (E1, S2, S3, NFN), source count
   - **Télécharger le certificat** button.
4. Try `NFN-P2-00148-M2` → **Red card**: "Certificat Révoqué".
5. Try `BOGUS-CODE` → "Aucun certificat trouvé".

**Talking point:**
> "Anyone in the world can verify a ba33-stamped product without an account.
> Scan the QR on the package, paste the code here, see the chain. This is
> the export pitch — Algerian wool becomes a credible commodity because
> origin is provable."

---

## Act 6 — Wrap-up (30 seconds)

**Show this slide / state these numbers:**

- **One backend** — 137 endpoints serving 6 client apps.
- **Two mobile apps** — shepherd + collector, both Flutter + Riverpod.
- **Three web apps** — operations + buyer + institutional, all Next.js.
- **20 NestJS modules** — auth, collection, lots, transport, depot, laverie,
  transformation, certification, sales, institutional, …
- **3 migrations** — 53 tables, 70+ enums, append-only event log.
- **55/55 e2e pipeline tests green.**
- **11 personas seeded.** 39 permissions. RBAC enforced.

**Closing line:**
> "We built a single platform that aligns every actor in the wool value chain
> through one event log. That's how you turn 25,000 tonnes of waste into a
> $50M export industry."

---

## If a judge asks "Show me the code"

Open these files in order:

1. `apps/api/src/modules/collection/collection.service.ts` — declareWool +
   autoIssueCollectionJob (the heart of the two-actor model).
2. `apps/mobile-shepherd/lib/features/declaration/view/declaration_form_screen.dart` —
   the 12-field form.
3. `apps/mobile-collector/lib/features/jobs/view_model/active_job_view_model.dart` —
   GPS streaming + arrival detection.
4. `apps/web-operations/src/components/collection-jobs-panel.tsx` — depot
   manager assignment UI.
5. `scripts/test-pipeline.sh` — proof of correctness.

Or open Swagger at `http://localhost:3001/api/docs`.

---

## Recovery if something breaks live

| Symptom | Recovery |
|---|---|
| API returning 500 | `docker logs ba33-api --tail 50` — usually a connection issue. `docker restart ba33-api`. |
| Mobile app shows old data | Pull-to-refresh on the queue. Or close + reopen. |
| 401 on web-operations | Persona picker on login page → re-login. |
| Empty depot/laverie panels | `make seed` to repopulate. |
| Collection job not appearing | The auto-issue runs on `createPreLot`. If the source has no `region_id`, it's skipped. Check the logs. |
| Public verify returns 404 | The seal codes are seeded only by `seed-buyer.ts`. Confirm: `docker exec ba33-postgres psql -U ba33 -d ba33_platform -c "SELECT nfn_seal_code FROM buyer_catalog_products LIMIT 5;"` |

---

## Talking points by audience

**For business judges:**
- "Algeria has no traceability today — wool is wasted because no buyer trusts the origin."
- "We built six apps in a hackathon, all backed by one API. Production-ready architecture."
- "Public verification means the export buyer can verify a certificate from anywhere in the world."

**For technical judges:**
- "Append-only event log = full auditability. Every state transition has a checksum."
- "Drizzle + Postgres = typed SQL, transactions, FK integrity."
- "Riverpod codegen + go_router = type-safe Flutter. shadcn/ui + Tailwind v4 = web."
- "RBAC: 39 permissions, baseline-by-userType + additive custom roles."
- "Configurable rules engine (`rules_config`) for SLAs, A1 thresholds, S2/S3 dispatch, pricing."

**For domain judges (NFN expertise):**
- "We implemented the full cahier de charges: C1/C2/C3 sources, E1/S1 audits, R1 yield, S2/S3 dispatch tracks, P1/P2 product codes, NFN seal."
- "Stage-specific fields (Stage 3 depot classification, Stage 5 laverie conditioning, Stage 7 purity certificate, Stage 8 isolant production) all in the data model."
- "We collapsed C1/C2/C3 into a unified profession enum because the cahier's split confused real users — but the data model preserves the source_type for reporting."
