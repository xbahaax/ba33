# NFN Wool Filière Platform — Cahier de Charges v2

**Document type:** Functional & technical specifications, module by module
**Scope:** All applications, modules, and interfaces composing the NFN digital platform
**Baseline:** Aligned with the NFN framework (C1/C2/C3 sources, D1 Pré-tri, D2 Laverie with merged qualification, D3/D4 transformation tracks, NFN certification seal, institutional access layer)

---

## 0. Scope & Architecture Overview

The NFN platform is composed of fourteen distinct applications / modules, organized into four categories:

**Mobile applications (native or PWA, offline-capable):**
1. Collector App
2. Shepherd Lite App
3. Transporter App

**Web modules (browser-based, role-gated, share a single backend):**
4. Slaughterhouse Module (C2)
5. Third-Party Aggregator Module (C3)
6. Dépôt D1 Module (Pré-tri + intermediate logistics)
7. Laverie D2 Module (Washing + merged qualification / pricing / safety)
8. Transformer D3 Module (Isolants & géotextiles)
9. Transformer D4 Module (Biofertilisants & supports)
10. Sales Management Module (National, Export, Institutionnel)
11. Central Dashboard (Admin & supervision)
12. NFN Certification Module (Seal generation, product coding)

**External-facing portals:**
13. Buyer Portal
14. Institutional Access Portal (Interface de Sécurité → Ministères)

**Alternative interfaces (non-app):**
15. SMS / USSD Gateway
16. WhatsApp Bot (optional)

All modules share a single backend, a single lot database, and a single event log. The distinction between "applications" and "modules" reflects deployment (mobile app vs web page) and user access (role-gated), not separate systems.

Two additional backend capabilities may be prepared in isolation before operational rollout:

- `SMS Gateway`: inbound SMS/webhook ingestion for shepherd and source communication, linked to known actors by phone number and optionally by geolocation.
- `Sheep AI Service`: image-based ram breed inference and trait extraction, initially powered by Gemini behind a provider interface.

These capabilities follow the same event-log and traceability rules as the rest of the platform, but they can remain detached from the main backend module graph until validated.

---

## 1. Collector App (mobile, offline-first)

**Purpose**
The Collector App is the single most important application in the entire system. It is the point where wool enters the digital world. Every downstream phase depends on the quality of data captured here. The app must work with zero connectivity, in harsh field conditions, and in under 60 seconds per lot because field collectors handle 10 to 30 collections per day.

**Users**
Field collectors (agents terrain) employed or contracted by the NFN platform to physically go to shepherds, slaughterhouses, and aggregators to collect wool.

**Core features**

- **Offline-first operation.** The app works fully without any network connection. All features — lot creation, photo capture, printing, signing, route viewing — must be available offline. Data is stored in a local encrypted database and synchronized to the central backend whenever connectivity returns.
- **Lot creation in under 60 seconds.** A single screen captures everything needed: source selection, weight, state, photos, urgency flag, and notes. No multi-step wizards.
- **Multi-source support.** The collector selects the source type at lot creation: C1 (shepherd direct shearing), C2 (slaughterhouse wool-on-skins), or C3 (third-party aggregator). Each source type triggers slightly different required fields (e.g., C2 auto-sets the urgency flag and opens the cold-chain temperature field).
- **Bluetooth scale integration.** The app pairs with portable scales (standard Bluetooth weight protocol) so the collector does not type weight manually. Manual entry remains available as fallback.
- **QR label printing via Bluetooth thermal printer.** At the moment of lot creation, a physical QR label is printed and stuck on the bag/bale. The QR encodes `COLLECTOR_ID | LOT_SEQUENCE | CHECKSUM`. Alternative: a pre-printed booklet of QR stickers pre-assigned to the collector's namespace (no printer needed).
- **Geotagged and timestamped photo capture.** Multiple angles required (configurable; default: pile overview + close-up + surroundings). Photos stored locally and uploaded on sync.
- **Quick state check.** A mandatory one-tap selector: clean / dirty / very dirty / contaminated / with-meat. This preliminary state feeds downstream sorting and quality estimation.
- **Urgency flag.** Auto-set for C2 sources. Manually available for other cases (e.g., wool in poor storage condition, approaching rain, etc.).
- **Voice note field.** For information that does not fit predefined fields, in Arabic, Darija, French, or Tamazight. Stored as audio, transcribed later at central level.
- **Route planning.** At the start of each day, the collector receives a planned route ordered by priority and proximity. The app provides turn-by-turn navigation to each stop. Route updates (new urgent pickup) are pushed when connectivity allows.
- **Local shepherd census.** The app ships with a pre-loaded list of known shepherds and sources in the collector's region, so names, phone numbers, and locations do not need to be retyped.
- **Digital or thumbprint signature.** The shepherd signs directly on the phone screen, or places a thumbprint, or the collector photographs a signed paper receipt. All three are valid.
- **Paper fallback booklet management.** If the phone is dead or the app fails, the collector uses a paper booklet with pre-registered QR stickers. On next sync, the data is entered retroactively by the collector; the paper receipts are scanned as proof.
- **End-of-day sync and summary.** At the end of the day, the collector reviews total kg collected, number of lots, and any flagged anomalies. The collector confirms before sync; sync proceeds in the background when network is available.

**How we handle it**

Local data is stored in an encrypted SQLite database. A sync engine queues every event (lot created, photo added, signature captured) with a unique UUID and local timestamp. When connectivity returns, events are pushed to the backend in order. Conflict resolution is simple because lot IDs are pre-partitioned per collector namespace — two collectors cannot create the same ID. Events are append-only; nothing is deleted, only corrected via compensating events. The app enforces a daily cap to detect lost or abandoned booklets: if a collector has not synced for more than 48 hours, central operations receive an alert.

The app size is kept below 50 MB to allow installation on entry-level Android devices. The minimum supported Android version is set low (Android 7+) to cover the device reality of rural Algeria.

---

## 2. Shepherd Lite App (mobile, minimal)

**Purpose**
Give shepherds who own a smartphone a minimal interface to announce wool availability and receive pickup confirmations, without needing training, without requiring literacy in any specific language. The app is stripped to essentials because shepherds will use it rarely and never want to "learn" it.

**Users**
Shepherds and small producers who have a smartphone and at least occasional mobile data or Wi-Fi.

**Core features**

- **Big-button interface.** The main screen is a single large button: "J'ai de la laine prête" / "عندي صوف جاهز". Everything else is secondary.
- **Voice-first data entry.** Instead of forms, the app asks three voice questions: how much wool do you have? where are you? when is it ready? Responses are recorded as audio and later transcribed by the central backend.
- **Visual weight estimator.** For shepherds who cannot estimate weight, a slider with images shows "one bag" / "one sheep worth" / "small pile" / "large pile" etc. The system converts these to estimated ranges.
- **Current location capture (GPS).** The app uses GPS at the moment of declaration. If GPS is unavailable, a map selector is shown with the shepherd's known village pre-highlighted.
- **Photo of the pile (optional).** Encouraged but never required.
- **Pickup window notification.** Once the declaration is processed, the shepherd receives a push notification (and fallback SMS) with the scheduled pickup time.
- **Multi-language UI.** Arabic, Darija (phonetic script option), French, Tamazight. The app auto-detects or prompts once at install.
- **Pickup confirmation receipt.** After collection, the shepherd receives a digital receipt with the final weight and price estimate. Visible offline later.

**How we handle it**

A declaration by a shepherd creates a **pre-lot** in the central database (status: *announced*). The platform matches this pre-lot with the nearest available collector's route and schedules the pickup. The pre-lot stays open until the collector physically arrives and finalizes it into a real lot. If no collector is assigned within an SLA (configurable, e.g., 72 hours), the pre-lot is escalated. If the shepherd cancels (rare but possible), the pre-lot is closed with reason.

The Shepherd Lite App is deliberately kept separate from the Collector App to avoid confusion in role, permissions, and UI.

---

## 3. Transporter App (mobile)

**Purpose**
Manage every transport leg between any two points in the chain (shepherd → dépôt, dépôt → laverie, laverie → transformer, transformer → buyer). Provide weigh-in and weigh-out reconciliation for the chain of custody and run the urgent transport lane (A1) for C2 and other urgent lots.

**Users**
Truck drivers, delivery agents, transport dispatchers.

**Core features**

- **Job queue.** Drivers receive assigned jobs with origin, destination, lot list, expected weight, and SLA (normal or urgent).
- **Scan on load (weigh-in event).** Each lot is scanned as it is loaded on the truck. The driver confirms the loaded weight — this creates a formal weigh-in event and a chain-of-custody handover from origin to transporter.
- **GPS tracking.** Continuous GPS logging throughout the trip. The driver does not need to do anything; the app records silently.
- **Temperature logging (urgent / cold-chain lane).** For C2 urgent lots, a Bluetooth thermometer in the refrigerated truck reports temperature to the app. Excursions trigger automatic alerts.
- **Scan on delivery (weigh-out event).** At destination, each lot is scanned again. The receiver confirms received weight — this creates the weigh-out event. Any mismatch with weigh-in (above tolerance) auto-flags.
- **Digital proof of delivery.** The receiver signs on the driver's phone. A PDF receipt is generated for both parties.
- **Urgent lane prioritization.** Urgent jobs appear at the top of the queue with countdown timers. The app blocks the driver from accepting a normal job while an urgent one is pending without supervisor override.
- **A1 alert response.** When the central Dépôt D1 dispatcher fires an A1 alert (e.g., depot is full, urgent batch needs movement), qualified transporters in the area receive it first and can accept in one tap.
- **Offline tolerance.** Scans and GPS are cached locally and synced when connectivity returns. The trip can be fully completed offline.

**How we handle it**

Each transport leg is a distinct event chain with a clear start (scan on load) and end (scan on delivery). Weigh-in and weigh-out events are the core reconciliation points — the backend automatically computes the delta and routes anomalies above threshold to the central operator. The urgent lane is governed by the A1 rule engine: conditions include lot age, depot fill level, SLA deadline proximity, and cold-chain risk. The A1 alert is not a button — it is triggered by the rules engine and then pushed to qualified transporters.

Transporter certification (urgent lane, cold-chain, heavy load) is managed at the central level and controls which jobs a given driver can accept.

---

## 4. Slaughterhouse Module (C2) — web + mobile

**Purpose**
Allow slaughterhouses to declare wool-on-skins batches as animals are processed, trigger the cold-chain urgent lane automatically, and feed pre-wash safety data to the Laverie D2.

**Users**
Slaughterhouse operators, on-site supervisors.

**Core features**

- **Per-batch or per-animal declaration.** Depending on slaughterhouse capacity, operators either log each animal individually or declare a batch of N animals processed in a time window.
- **Automatic urgency flag.** Every C2 lot is auto-tagged `urgent` and triggers the cold-chain SLA.
- **Cold-chain temperature logging.** Internal fridge/storage temperature is logged continuously (manual entry every N hours, or via IoT sensors where available).
- **Safety data intake.** Animal health information, veterinary inspection certificate reference, date of slaughter — all attached to the lot as metadata.
- **Integration with slaughterhouse management systems.** Where the slaughterhouse already has a digital system, the module exposes an API so declarations can be pushed automatically instead of double-entered.
- **Dispatch request.** The slaughterhouse triggers a pickup request; the central dispatch assigns an urgent-certified transporter within the SLA (configurable, default 4 hours).
- **Weigh-in integration.** Connected scales (Bluetooth or wired) automatically populate weight.

**How we handle it**

C2 lots bypass the normal collection route optimizer and are placed directly in the urgent queue. The SLA timer starts at declaration. If the timer approaches threshold without pickup being accepted, the dispatch layer escalates (wider geographic search, on-call dispatcher notified). On arrival at Dépôt D1, C2 lots may skip the normal pré-tri and be routed directly toward Laverie D2 if the D2 facility has a pre-wash safety station — otherwise they go through a dedicated C2 zone at D1 with shorter aging tolerance.

Safety metadata follows the lot permanently — the Laverie D2 pre-wash check can query animal health status before accepting the lot.

---

## 5. Third-Party Aggregator Module (C3) — web + mobile

**Purpose**
Handle declarations from cooperatives, intermediaries, and small traders who already hold wool aggregated from multiple upstream shepherds. Provide a hybrid traceability model: minimal by default, deeper when the aggregator registers their upstream sources.

**Users**
Cooperatives, aggregators, independent traders working with multiple shepherds.

**Core features**

- **Aggregator registration.** Each C3 actor is onboarded, certified, and has a unique aggregator ID.
- **Batch declaration.** The aggregator declares available lots with weight, quality estimate, location, and number of upstream sources.
- **Upstream source registration (optional, premium).** For NFN Premium certification, the aggregator registers the original shepherds contributing to the batch. Each upstream source is linked proportionally to the lot.
- **Quality self-assessment.** The aggregator provides an initial grade estimate (A/B/C) based on internal sorting — this is compared later against the Laverie qualification.
- **Dispatch request.** Standard collection request triggering a collector or transporter pickup.
- **Performance history.** Each aggregator has a historical record of declared-vs-received weight accuracy, quality accuracy, and dispute rate, visible on their account.

**How we handle it**

C3 traceability is aggregator-level by default: the trace goes back only to the aggregator, not to the original shepherds. For NFN Premium products, C3 lots must have registered upstream sources to maintain full traceability; otherwise they go into standard (non-Premium) lots. This hybrid model lets the platform launch without demanding upstream registration from day one, while creating an economic incentive (Premium pricing) for aggregators to eventually register their sources.

C3 aggregators are subject to stricter entry audits (E1) at Dépôt D1 until they build up a trusted reliability history.

---

## 6. Dépôt D1 Module — Pré-tri & Intermediate Logistics (web + handheld scanner)

**Purpose**
Receive lots from all three source types, reconcile declared versus actual weight (E1 entry audit), pre-sort by destination and grade, store in designated zones, and prepare dispatched batches for Laverie D2 (S1 exit audit). Trigger A1 transport alerts automatically when thresholds are crossed.

**Users**
Warehouse managers, dépôt operators, handheld scanner users.

**Core features**

- **E1 Entry audit.** Every arriving lot is scanned. The system compares declared weight (from collector/slaughterhouse/aggregator) with actual weight on the dépôt scale. Mismatches above tolerance are flagged for review. Lot status moves to `received_depot`.
- **Pré-tri interface.** Lots are sorted into categories: by source type (C1/C2/C3), by preliminary state (clean/dirty/contaminated), by urgency (urgent/normal), by destination readiness. Sorting is done physically and logged digitally via scanner + dropdown.
- **Storage zone management.** Each zone (aisle, rack, bay) has a unique ID and capacity. Lots are scanned into a zone on placement. FIFO aging is tracked per lot.
- **S1 Exit audit.** When lots are batched for dispatch to D2, the system performs an exit audit: total weight, composition (which lots are in this batch), destination. A dispatch manifest is generated.
- **A1 Automatic Transport Alert.** The rules engine monitors: total weight in depot, free storage space, oldest lot age, urgent lot count. When any threshold crosses a pre-configured limit, an A1 alert is fired automatically to the transport dispatcher, who then pushes the alert to qualified transporters.
- **Handheld scanner integration.** Industrial handheld scanners (or tablets with camera) allow batch-scanning dozens of lots in minutes at reception or dispatch.
- **FIFO aging view.** A dedicated screen shows all lots sorted by age, highlighting any approaching degradation thresholds.
- **Anomaly reporting.** Damaged lots, missing lots, suspected contamination — all logged with reason codes, photos, and routed to central operator.
- **Reception scheduling.** Incoming trucks are scheduled in advance; reception staff see the daily calendar.

**How we handle it**

The E1 audit tolerance is configurable per source type (stricter for C3 aggregators during onboarding, looser for established actors). A1 alert thresholds are also configurable and tuned over time by the central operator. The pré-tri is the difference between this module and a simple warehouse: wool is not just stored — it is actively prepared for the next phase, and the quality of this preparation directly affects Laverie D2 throughput.

Every lot that enters must eventually leave (to D2) or be formally declared lost/rejected. No "shrinkage" category — every kilogram must be accounted for.

---

## 7. Laverie D2 Module — Washing + Qualification + Dispatching (web)

**Purpose**
This is the merged phase where washing, fiber qualification, safety verification, pricing, and dispatch routing to D3 or D4 transformers all happen. It is the technical heart of the value chain. The module replaces what was originally two separate phases (Lab + Lavage) in earlier designs — because in practice, fiber cannot be fully qualified until it is clean.

**Users**
Washing facility operators, on-site laboratory technicians, dispatch operators.

**Core features**

- **Pre-wash safety check (for C2 lots specifically).** Before a C2 lot enters the wash line, a safety verification reviews veterinary certificates, performs visual contamination inspection, and optionally runs a rapid pathogen test. Lots failing safety are quarantined and do not enter the line.
- **Weigh-in (dirty state).** Each lot is weighed as it enters the line. This is the reference baseline for yield calculation.
- **Wash process logging.** Water volume, chemical products and quantities, wash cycle duration, temperature, and mechanical parameters are recorded per batch. This data feeds cost accounting and environmental reporting.
- **Weigh-out (clean state).** Each lot is weighed after drying. The difference between weigh-in and weigh-out is the loss; the ratio is the yield.
- **R1 Yield measurement (Point Vert).** Automatic yield calculation: `(clean_weight / dirty_weight) × 100`. Historical yield per source is tracked — a shepherd whose wool consistently yields below the regional average is flagged for investigation (over-watered wool, adulteration, or simply a different breed).
- **Fiber qualification (the former lab phase, now here).** Once washed, a sample from each lot is analyzed: fiber length, fiber diameter (micron), cleanliness, moisture content, color, and dyeability. Grade is assigned: A (premium), B (standard), C (low), or Reject.
- **Pricing engine.** Based on grade, current market index, urgency discount (for C2 lots), and source type, a price per kilogram is computed automatically and proposed to the commercial team. Pricing rules are configurable by central admin.
- **Safety flagging.** Any lot showing contamination (pesticide residue, pathogens, chemical abnormalities) is flagged. Safety statuses: clear / flagged (needs review) / rejected.
- **S2/S3 Dispatcher — the critical routing logic.** Based on the assigned grade and fiber characteristics, the system automatically proposes the destination track:
  - Grade A/B with good fiber length → **D3 (isolants & géotextiles)**
  - Grade C, short fiber, or high contamination (but not rejected) → **D4 (biofertilisants & supports)**
  - Rejected → quarantine or disposal
  - The rules engine is configurable so dispatch criteria can be tuned based on transformer demand and product strategy.
- **Water and waste valorization.** Water consumption per batch is logged. Waste streams (chemical, organic) are categorized and where possible, valorized (lanolin recovery, agricultural compost, etc.) — each valorization stream is tracked as a secondary output.
- **Reject and quarantine management.** Rejected lots have a formal workflow: confirmation by two operators, disposal method logged, proof photos.
- **Weigh reconciliation with D1.** The module pulls the S1 exit audit from D1 and compares with the weigh-in at D2. Any discrepancy above tolerance is flagged.

**How we handle it**

The merge of washing and qualification is the single biggest change from earlier design. It reflects the operational reality: fiber properties cannot be reliably measured on dirty, matted wool. By co-locating the lab function with the wash line, the system avoids a redundant transport leg and cuts the lab-to-grade delay from days to hours.

The S2/S3 dispatcher is the most important rules engine in the platform. It determines product strategy: more lots going to D3 means more high-value textile/insulation output; more lots to D4 means more agricultural output. The central operator can tune dispatch criteria over time based on demand, inventory, and pricing.

The R1 yield metric is also a fraud-detection tool: consistent unexplained yield drops can indicate adulteration (water added, foreign matter mixed in) upstream.

---

## 8. Transformer D3 Module — Isolants & Géotextiles (web)

**Purpose**
Track the industrial transformation of clean wool batches into technical products: thermal/acoustic insulation panels, geotextile membranes, non-woven fabrics, felts. Maintain full traceability from input batches to coded output products.

**Users**
D3 transformer operators, production supervisors, internal auditors.

**Core features**

- **Batch reception from Laverie.** Clean batches dispatched by S2/S3 arrive; each is scanned in, weighed, and confirmed. Reception weight is reconciled against laverie exit weight.
- **Bill of Materials (BOM) management.** For each D3 product type (e.g., insulation panel 10 cm, geotextile membrane 200 g/m²), a BOM defines the raw wool quantity and additives required. BOMs are versioned.
- **Production batch logging.** Each production run links input batches (possibly several, forming a composite) to output products. Start time, end time, operator, BOM version, and any deviations are logged.
- **Weigh-in and weigh-out.** Input clean wool weight and output product weight are both logged. Manufacturing yield is calculated per run.
- **Waste tracking.** Every kilogram of input must be accounted for: either in output products, in reusable waste (reinjected into a future batch), or in disposal (with reason and method).
- **P1 Product code generation.** Each finished product (or production batch) receives a unique P1 code from the NFN Certification Module. The code ties back to the composite source trace.
- **Ex/Sx Internal audit.** Periodic internal audits verify conformity (entry vs output, BOM adherence, waste documentation). Audits are logged with auditor ID, findings, and corrective actions.
- **Product inventory.** Coded P1 products are listed in an internal inventory visible to the Sales Management Module for commercialization.

**How we handle it**

D3 transformation often combines multiple source batches into a single product run — so lineage is a many-to-one (or many-to-many) relationship. The system maintains composite traceability: from a P1 code, the operator can drill down into every source batch and every original shepherd who contributed.

Waste handling is non-negotiable. No unexplained weight loss is accepted. Waste reinjection is a first-class workflow: leftover clean wool from one run can be used in the next, and this transfer is a proper event in the system.

---

## 9. Transformer D4 Module — Biofertilisants & Supports (web)

**Purpose**
Track the transformation of lower-grade or short-fiber wool into agricultural products: slow-release biofertilizers, plant supports, mulching products, soil conditioners. Functionally parallel to D3 but with different BOMs, outputs, and regulatory requirements.

**Users**
D4 transformer operators, agricultural product supervisors, internal auditors.

**Core features**

Same operational pattern as D3 but adapted to bio products:

- Batch reception from Laverie (S2/S3 dispatch).
- BOMs specific to bio products (e.g., pelletized biofertilizer: wool + organic binder + nutrient mix).
- Production batch logging with start/end time and operator.
- Weigh-in / weigh-out / waste tracking.
- **P2 Product code generation** from the NFN Certification Module.
- Ex/Sx internal audits.
- Bio-specific compliance: agricultural product regulations, organic certification compatibility where claimed, labelling requirements.
- Inventory of coded P2 products fed to Sales.

**How we handle it**

The main difference between D3 and D4 is regulatory: bio agricultural products are governed by different standards (agricultural ministry, organic certification bodies). The module includes compliance templates and document attachments so each production batch has the required documentation for sale.

D4 also accepts "rejected-but-recoverable" lots from Laverie in some cases — wool that is not clean enough for textile-grade D3 products can still be valuable as biofertilizer feedstock. The S2/S3 dispatcher handles this routing.

---

## 10. Sales Management Module — National, Export, Institutionnel (web)

**Purpose**
Manage all commercialization of coded P1/P2 products across three distinct channels, each with different pricing, documentation, and fulfillment requirements. Generate the NFN-sealed traceability certificate that ships with every order.

**Users**
Commercial team, sales representatives, export agents, institutional contract managers.

**Core features**

- **Unified product inventory.** All coded P1 (D3) and P2 (D4) products are listed with quantity, grade, pricing, and availability.
- **Three-channel routing.**
  - **National:** domestic B2B buyers (textile mills, agricultural cooperatives, resellers). Standard pricing, local invoicing.
  - **Export:** international buyers. Requires export documentation (origin certificate, phytosanitary certificate for D4, customs paperwork, Incoterms). Pricing in foreign currency with FX handling.
  - **Institutionnel:** government agencies, public procurement contracts, institutional buyers. Usually long-term framework contracts with specific pricing, volume commitments, and reporting requirements.
- **Channel-specific pricing.** Each channel has its own price list; the pricing engine applies channel-specific rules (volume discounts, contract prices, export margins).
- **Order management.** Full order lifecycle: quote, confirmation, payment, preparation, shipment, delivery, post-sale.
- **Export documentation generator.** Auto-generates customs declarations, certificates of origin, and shipping manifests from the product trace.
- **Institutional contract management.** Tracks multi-year contracts, fulfillment progress, reporting deadlines, and compliance artifacts.
- **Shipment tracking to buyer.** Integrates with the Transporter App or with external carriers.
- **NFN-sealed traceability certificate.** Every order ships with a certificate generated by the NFN Certification Module. The certificate has a QR; the buyer (or any third party) can scan it and see the full traceability chain.
- **Post-sale management.** Complaints, returns, quality disputes. Disputes link back to the affected lots and can trigger upstream investigation (e.g., if a buyer reports contamination, the platform flags every lot from the same batch and traces upstream).

**How we handle it**

Each channel is effectively a different business workflow. The module exposes a unified dashboard for the commercial team but gates features by channel. Export is the most document-heavy; institutional is the most contract-heavy; national is the most transactional.

The traceability certificate is regenerated (or re-signed) every time a product changes status — ensuring the buyer always receives the most current, valid version. Certificates can be revoked in case of fraud or post-sale issues.

---

## 11. Central Dashboard — Admin & Supervision (web)

**Purpose**
Command center for the central operator. Real-time visibility across the entire chain, alert management, KPI monitoring, and rules/configuration administration. This is where the platform is piloted.

**Users**
Central admin, operations supervisors, regional managers, executives (read-only).

**Core features**

- **Live map.** Real-time geographic view: shepherds with announced wool (yellow), collectors on route (blue), trucks in transit (orange for normal, red for urgent), warehouses (green/yellow/red based on fill), laveries, transformers. Clicking any pin opens detail.
- **Flow monitor.** End-to-end quantity flow visualization per period (today, this week, this month, custom). Shows how many kilograms are at each phase and what the throughput rate is. Identifies bottlenecks immediately.
- **Alerts panel — color-coded per NFN semantics.**
  - **● Point Noir** (control alerts): weigh mismatches, missed audits, chain-of-custody gaps.
  - **● Point Rouge** (transport/urgency alerts): A1 triggers, SLA breach warnings, cold-chain excursions, urgent lots stuck.
  - **● Point Vert** (performance alerts): yield below threshold at laverie, below-expected throughput, unusually high waste in transformation.
- **KPI dashboards per phase.** For each phase, the KPIs tracked include: total volume in, total volume out, loss kg and %, average dwell time, anomaly rate, throughput, cost per kg.
- **Actor performance views.** Per-shepherd history (volumes, quality, reliability). Per-collector performance (volume, accuracy of declared weight, anomaly rate, sync reliability). Per-slaughterhouse, per-aggregator, per-transporter, per-warehouse views.
- **Lot lookup.** Scan any QR or paste any Lot ID / Product Code to open the full history: every event, every weigh, every photo, every audit, every hand that touched it, current location, current status.
- **Reports generator.** Pre-built and custom reports: daily operational summary, weekly yield report, monthly financial summary, regulatory reports for institutions, audit-trail exports.
- **User and role management.** Create users, assign roles, revoke access, see who did what and when (full audit log of admin actions).
- **Rules engine configuration.** A1 thresholds, S2/S3 dispatch criteria, pricing rules, SLA targets, audit tolerances — all configurable through a dedicated interface. Rule changes are versioned and auditable.
- **Census management.** Shepherd registry, collector assignments, regional coverage maps, census updates.

**How we handle it**

The dashboard is role-gated. A regional manager sees their region only. An executive sees aggregated data without PII. The central admin sees everything. Every view has filters (time range, region, source type, phase) and drill-downs.

The dashboard is the only place where cross-phase comparisons are natural. The key audit questions it must answer in one click are: how much was announced this week? how much was collected? how much was received at dépôt? how much was washed? how much was transformed? how much was sold? Where is the gap? The dashboard surfaces these gaps as visual discrepancies in the flow monitor.

---

## 12. NFN Certification Module (web + backend service)

**Purpose**
Generate the official NFN digital certification seal that marks a product as having passed all audit gates and is ready for market. Assign P1/P2 product codes. Manage certificate lifecycle including revocation.

**Users**
Certification authority (internal team), central admin, automated triggers.

**Core features**

- **Automated seal generation.** Once a product passes all required audit gates (E1, S1, R1 within range, S2/S3 dispatched correctly, Ex/Sx internal audits cleared, no open anomalies), the system automatically generates the NFN seal for that product.
- **Digital signature.** Each seal is cryptographically signed by the NFN authority. The signature is verifiable by any third party without contacting the platform.
- **P1 / P2 code assignment.** Each certified product receives a unique code: P1 for D3 products, P2 for D4 products. The code is unique, sequential within a namespace, and carries no internal meaning beyond the lookup key.
- **QR generation.** Every certificate gets a QR code that resolves to the public verification URL with full traceability view.
- **Traceability certificate PDF.** The certificate is a formatted PDF with NFN branding, product information, origin summary (upstream lots), quality parameters, dates, signatures, and QR.
- **Certificate revocation.** If a post-sale issue is confirmed (fraud, contamination, quality dispute validated), the certificate is revoked. Revocation is logged and visible in the public verification URL.
- **Audit trail.** Every issuance, revocation, and verification query is logged.
- **Public verification endpoint.** Any party with the QR can verify a certificate online. The endpoint returns: product info, NFN seal status, trace summary.

**How we handle it**

Certification is not a manual gate — it is rule-based. A product is either certifiable (all gates passed) or not (one or more gates failed). This removes human bottleneck and ensures consistency. The rules engine governing certification is managed through the Central Dashboard.

The cryptographic signature means that even if the central platform is unavailable, a buyer can still verify the authenticity of a certificate (though live status like revocation requires connectivity). This matters for export buyers who want long-term verifiability.

---

## 13. Buyer Portal (web, external-facing)

**Purpose**
Self-service interface for buyers (national, export, institutional) to browse available products, place orders, track shipments, and verify traceability.

**Users**
B2B buyers — textile manufacturers, agricultural companies, government procurement agents, export clients.

**Core features**

- **Product catalog.** Available P1 and P2 products with quantity, grade, origin region, price, availability date. Each product shows its NFN seal status.
- **Full traceability view.** For any product, the buyer can see the complete chain: source region(s), dates, yield at laverie, transformation run, audits passed. Personally identifying information about individual shepherds is abstracted unless the product is sold as "single-origin premium".
- **Order placement.** Quote request, order confirmation, invoice, payment.
- **Payment integration.** Local payment rails for national buyers (bank transfer, BaridiMob), international rails for export (SWIFT, letters of credit).
- **Shipment tracking.** Real-time status from dispatch to delivery, with ETA.
- **Document access.** All export documents, certificates, and invoices downloadable from the portal.
- **Complaint / return submission.** Structured form; submissions link to specific orders and trigger internal investigation workflow.
- **Account management.** Buyer profile, contract terms (for institutional/framework contracts), historical orders.
- **Multi-language.** French, English, Arabic at minimum.

**How we handle it**

The Buyer Portal is external-facing so security and uptime requirements are higher than internal modules. Authentication uses email + password with 2FA for institutional accounts, SSO available for large corporate buyers. The portal never exposes internal operational details (other actors' data, internal rules engine, cost structures) — it is strictly read-only on its own account's data plus the public traceability views.

---

## 14. Institutional Access Portal — Interface de Sécurité (web + API)

**Purpose**
Provide Algerian ministries, regulatory bodies, and statistical institutions with secure, auditable, read-only access to aggregate and case-specific data from the NFN platform. Support oversight, regulation, policy planning, and public reporting.

**Users**
Ministère de l'Agriculture, Ministère du Commerce, customs authorities, statistical office, other public institutions.

**Core features**

- **Strong authentication.** mTLS certificates for API access, SSO with institutional identity providers for web access. No password-based authentication for institutional users.
- **Role-based read-only views.** Each institution sees only what its mandate allows. Agriculture sees upstream data (shepherds, production volumes). Commerce sees sales and export data. Customs sees export and shipping data.
- **Aggregate statistics.** National dashboards: total volume per region per period, seasonal trends, geographic distribution, employment (number of registered shepherds/collectors), economic indicators (total commercial value).
- **Case-specific queries.** Institutions can look up individual lots, products, or certificates for oversight purposes. All such queries are logged.
- **Certification verification API.** Public and authenticated endpoints to verify NFN seals.
- **Full audit log of institutional queries.** Every query — who, when, what was looked at — is immutable-logged. This protects against abuse of access and provides transparency to the NFN authority.
- **Data export for public reporting.** Structured exports (CSV, standardized XML) for institutional use, filtered by mandate.
- **Regulatory filing automation.** Where institutions require periodic filings from the NFN platform (production reports, export declarations, statistical submissions), the portal auto-generates them on schedule.

**How we handle it**

The Interface de Sécurité is the most sensitive access layer. The principle is **least privilege plus full auditability**: every institution has the minimum access needed for its mandate, and every access is logged. The platform treats institutional access as a trust relationship that must be observable, not taken on faith.

Data is never exported in bulk without an institutional agreement recorded and countersigned by the central NFN authority. Individual shepherd personal information (names, phone numbers, exact GPS) is abstracted by default into regional/commune aggregates — institutions can request personal-level data only for specific compliance cases, and those requests themselves are audit-logged and justified.

---

## 15. SMS / USSD Gateway (backend service)

**Purpose**
Give shepherds and other users without smartphones a way to interact with the platform using basic mobile phones. Serves as a fallback channel across the ecosystem.

**Users**
Shepherds without smartphones, collectors whose phones are temporarily unavailable, any user who needs to receive a notification.

**Core features**

- **Inbound SMS processing.** Short codes in Darija, Arabic, French. Example: `LAINE 25 VILLAGE_X` creates a pre-lot declaration for 25 kg of wool in village X.
- **Outbound SMS notifications.** Pickup confirmations, scheduling updates, urgent alerts, payment confirmations.
- **USSD menu (optional, requires operator agreement).** Interactive menu accessible by dialing a short code; offers basic functions (declare wool, check pickup status, view last payment).
- **Multi-operator.** Integrates with Djezzy, Mobilis, Ooredoo (Algerian telcos).
- **Voice call fallback.** For users who cannot read or write SMS: an IVR line in Darija/Arabic allows declaring wool by voice response.

**How we handle it**

The SMS/USSD layer is backend-only; it is not a user-facing app. It routes inbound messages to the appropriate platform module (shepherd declarations go to the Shepherd Lite logic; operator replies go to the right action queue). Outbound messages are triggered by any module in the platform — the gateway is a shared service.

SMS costs money per message, so the platform batches where possible and uses push notifications (free) for smartphone users.

---

## 16. WhatsApp Bot (optional alternative interface)

**Purpose**
For users who have WhatsApp but do not want to install another app (the most common reality in Algeria). Provide a conversational interface to perform key actions.

**Users**
Primarily shepherds; can be extended to buyers for order status.

**Core features**

- **Wool declaration.** Shepherd messages the bot: "j'ai de la laine prête" or voice note; the bot confirms and creates the pre-lot.
- **Photo upload.** Shepherd shares a photo; bot attaches it to the pre-lot.
- **Status queries.** "Quand est la collecte ?" "Combien j'ai été payé ?" — bot replies with live status.
- **Pickup confirmation.** Bot sends notification when collector is assigned.
- **Multi-language conversational.** Darija, Arabic, French, detected from user input.

**How we handle it**

The WhatsApp bot uses the WhatsApp Business API. It is effectively a wrapper around the same backend logic as the Shepherd Lite App, exposed through a conversational UI. Because WhatsApp is already installed on most Algerian smartphones, adoption friction is near zero.

---

## 17. Cross-Cutting Concerns

### 17.1 Traceability Spine

Every lot has a unique ID from creation. Lots can split (one into several) or merge (several into one composite) — these operations are explicit events, so the lineage tree is walkable in both directions. From any product, the platform can always reach the original shepherd(s). From any shepherd, the platform can always reach where their wool ended up. The event log is append-only; corrections are made by compensating events, never by overwriting history.

### 17.2 Weigh Reconciliation

Every handoff between actors is a weigh-out event at the source and a weigh-in event at the destination. The backend automatically computes the delta and flags discrepancies above configurable tolerances. This is the most important fraud-detection and loss-detection mechanism in the platform.

### 17.3 Offline-first Architecture

The Collector App, Transporter App, and warehouse handheld scanners all operate offline-first. Each has a local encrypted database and a sync queue. IDs are pre-partitioned per device namespace so offline operations cannot collide. Sync is incremental, idempotent, and conflict-resolved by simple rules (events are append-only; lot metadata is first-writer-wins for creation, last-writer-wins for mutable fields like state).

### 17.4 Multi-language Support

Arabic, Darija, French, Tamazight across all user-facing interfaces. Darija is particularly important because the shepherd population often prefers it over standard Arabic. Voice-first entry and transcription help bypass literacy constraints.

### 17.5 Authentication

Phone-based OTP for field users (collectors, shepherds, transporters). Email + password + 2FA for office users. mTLS + SSO for institutional users. All sessions are logged.

### 17.6 Fallbacks

Every critical workflow has at least one fallback: no-signal → offline + later sync; no-smartphone → SMS/USSD/WhatsApp; no-phone → paper booklet + later entry; no-literacy → voice + thumbprint. The platform is designed so that the absence of technology never blocks the entry of wool into the system.

---

## 18. What's Out of Scope (for this version)

To be explicit about what this cahier does not cover yet, and should be addressed in a future version:

- Full financial/accounting integration (general ledger, tax reporting)
- Mobile payment disbursement to shepherds (design exists but implementation requires telecom/banking agreements)
- IoT sensor rollout for cold-chain (specified in the modules but deployment plan is separate)
- Advanced analytics / machine learning (yield prediction, demand forecasting, fraud scoring — possible future layer on top of the event log)
- Farmer loyalty / premium program economics
- Multi-country expansion considerations

---

**End of Cahier de Charges v2.**
