# 📱 MOBILE APPS

## 1. `mobile-collector` — the field collector's toolkit

**What it is:** The app a field collector carries while going to shepherds, slaughterhouses, and aggregators to physically collect wool. Offline-first because signal dies in rural areas. This is the hardest of the three mobile apps because it does the most.

**Who uses it:** Field collectors (employees/contractors of NFN).

**Features (complete list):**
- Phone OTP login
- Daily route view (pickups ordered by priority/proximity)
- Shepherd census preloaded (no typing names)
- Create lot — single screen with: source type (C1/C2/C3), weight, photos (multi-angle, geotagged), state quick-tag (clean/dirty/contaminated/with-meat), urgency flag, voice note
- Bluetooth scale pairing (auto-weight) + manual fallback
- Bluetooth thermal printer (print QR sticker on the spot)
- Pre-printed QR booklet as printer fallback
- Signature on screen OR thumbprint OR photo of signed paper
- Works 100% offline — local DB, sync queue
- End-of-day summary (kg total, lots, anomalies) before sync
- Push notifications for new assignments/urgent pickups

**Implementation plan (build in this order):**
1. Expo scaffold + phone OTP auth + navigation
2. WatermelonDB local schema (lots, sources, events)
3. Dumb lot creation screen — just weight + photo, saves locally
4. Sync engine — push queued lots to API when online
5. QR code generation + Bluetooth thermal printing
6. Bluetooth scale integration
7. Source picker C1/C2/C3 with different required fields
8. Urgency flag + cold-chain data entry for C2
9. Route planning screen (pulls day's assignments)
10. Shepherd census preload + offline search
11. Signature/thumbprint capture + voice notes
12. End-of-day summary + final sync confirmation

Steps 1–4 give you a working MVP. Rest is layered on.

---

## 2. `mobile-shepherd` — the shepherd's "I have wool" button

**What it is:** A stripped-down app that lets a shepherd announce wool availability in under 10 seconds. Designed for people who are not tech-literate and will open the app once a month.

**Who uses it:** Shepherds with smartphones (the Type A shepherds from the cahier).

**Features (complete list):**
- Phone OTP login (one-time setup, stays logged in forever)
- One giant button on the home screen: "J'ai de la laine prête / عندي صوف جاهز"
- Voice-first data entry — app asks "how much wool?", "where are you?", records answers as audio
- Visual weight estimator — slider with pictures (small pile / large pile / etc.) for those who can't estimate in kg
- Auto GPS capture, or tap-your-village fallback
- Optional photo upload
- Push notification + SMS fallback when pickup is scheduled
- Digital receipt after collection (weight + estimated payment)
- Language switcher: French, Arabic, Darija, Tamazight
- Offline tolerance (queued declaration syncs when online)

**Implementation plan:**
1. Expo scaffold + phone OTP
2. Single-screen home with the big button → declaration form
3. Voice recording + audio upload to API (API does transcription separately)
4. GPS capture + village picker fallback
5. Visual weight estimator (simple slider with images)
6. Push notifications via Expo Push
7. Language switcher + translations for all prompts (including voice prompts)
8. Receipt history screen

A usable MVP is steps 1–3. The rest makes it friendly for non-tech users.

---

## 3. `mobile-transporter` — the driver's scan-and-drive app

**What it is:** What the truck driver uses during a transport leg. Scan on load, drive (GPS logs silently), scan on delivery. That's the whole loop.

**Who uses it:** Truck drivers and transport agents.

**Features (complete list):**
- Phone OTP login
- Job queue — assigned transport jobs, urgent ones pinned on top with countdown
- Scan lots on load — each lot's QR scanned, weight confirmed → weigh-in event
- Silent GPS tracking during the trip (no driver action)
- Temperature logging for urgent/cold-chain lane (Bluetooth thermometer or manual check-ins)
- Scan on delivery — QR scanned at destination, weight confirmed → weigh-out event
- Signature capture from the receiver at destination
- Digital PDF proof-of-delivery for both parties
- Urgent-lane block — can't accept a normal job while urgent is pending (unless supervisor overrides)
- A1 alert acceptance — central fires an alert, qualified drivers in the area can accept in one tap
- Full offline capability — scans and GPS cached, synced later

**Implementation plan:**
1. Expo scaffold + auth + job queue screen
2. Accept-job flow, load-scan flow (QR + weight confirmation)
3. Background GPS tracking (foreground service on Android)
4. Delivery-scan flow + signature + PoD PDF
5. Offline caching + sync for scans and GPS traces
6. Urgent lane UI + countdown timers
7. A1 alert push + accept-in-one-tap
8. Bluetooth thermometer integration for cold-chain

Steps 1–5 give you a complete normal-lane transporter app. 6–8 add the urgent/cold-chain layer.

---

# 🖥️ WEB APPS

## 4. `web-operations` — the internal command center

**What it is:** The big internal webapp where every NFN staff member does their job. It contains every operational module (dépôt, laverie, transformers, sales, certification, dashboard, admin) as role-gated route groups. Same app, different views per role.

**Who uses it:** Dépôt managers, laverie operators, lab technicians (merged in laverie), transformer operators, sales team, certification authority, central admin, regional managers.

**Features (complete list, organized by module):**

**Auth & access**
- Email login + 2FA
- Role-based route guards
- User/team management

**Dépôt D1 module**
- Incoming shipment calendar
- E1 entry audit (scan + weight reconciliation)
- Pré-tri interface (sort by source/grade/urgency/destination)
- Storage zone assignment + occupancy view
- FIFO aging view
- S1 exit audit (prepare dispatch batches for D2)
- A1 alert monitor (auto-triggered, visible to dispatcher)
- Anomaly reporting

**Laverie D2 module**
- Pre-wash safety check (C2 lots specifically)
- Weigh-in (dirty)
- Wash process logging (water, chemicals, cycle params)
- Weigh-out (clean)
- R1 yield calculation (Point Vert)
- Fiber qualification form (length, diameter, grade, moisture, color)
- Pricing engine (auto-suggested price per lot)
- Safety flagging (clear/flagged/rejected)
- S2/S3 dispatcher — routes to D3 or D4 based on grade + criteria
- Water/waste valorization tracking

**Transformer D3 module** (isolants & géotextiles)
- Batch reception from laverie
- BOM management
- Production batch logging
- Weigh-in/weigh-out + waste tracking
- P1 product code generation
- Ex/Sx internal audits
- Product inventory

**Transformer D4 module** (biofertilisants & supports)
- Same as D3 but for bio products, with agricultural compliance templates
- P2 product codes

**Sales module**
- Unified product inventory (P1+P2)
- Three channels: National / Export / Institutionnel
- Channel-specific pricing
- Order lifecycle
- Export document generator (origin cert, customs, phyto)
- Institutional contract management
- NFN-sealed traceability certificate generation
- Post-sale handling (returns, complaints → routed to lot)

**NFN Certification module**
- Automated seal issuance (when all gates pass)
- Manual override + revocation
- Certificate audit trail

**Central Dashboard**
- Live map of Algeria with color-coded pins
- Flow monitor (Sankey per period)
- Alerts panel (Point Noir/Rouge/Vert)
- KPI dashboards per phase
- Actor performance views
- Lot/product lookup (scan or paste ID)
- Reports generator

**Admin**
- User/role management
- Rules engine editor (A1 thresholds, S2/S3 criteria, pricing, SLA)
- Shepherd census management
- Regional configuration

**Implementation plan (phased, because this app is huge):**

**Phase 1 — Foundation**
1. Next.js App Router scaffold
2. Auth (email + 2FA) + role system + middleware guards
3. Empty shell layouts for each module (sidebar, topbar, role check)
4. Connect to `api-client` package

**Phase 2 — Dépôt D1 first** (first operational touchpoint after mobile collection arrives)
5. Reception (E1) + pré-tri + storage + S1 exit audit
6. A1 alert monitor UI

**Phase 3 — Laverie D2** (the core)
7. Full workflow: pre-wash, washing, qualification, R1, pricing, S2/S3 dispatch

**Phase 4 — Transformers**
8. D3 module (BOM, production, P1 codes) — shares 80% of code with D4
9. D4 module

**Phase 5 — Sales + Certification**
10. NFN Certification (automated issuance)
11. Sales module (start with National, add Export, then Institutionnel)

**Phase 6 — Dashboard** (built last because it aggregates data from all above)
12. Live map + flow monitor
13. Alerts panel + KPIs
14. Lot lookup + reports

**Phase 7 — Admin**
15. User/role management
16. Rules engine editor
17. Census management

Why this order: each phase unlocks data that the next phase needs. You can't build the dashboard before dépôt/laverie exist because there's nothing to show. You can't build sales before transformation. Build upstream to downstream.

---

## 5. `web-buyer` — the B2B customer portal

**What it is:** External-facing portal where clients (textile mills, ag companies, export buyers) browse certified products, order, track, and verify traceability. Read-heavy on catalog, write only for their own orders.

**Who uses it:** B2B buyers — national, export, and institutional clients.

**Features (complete list):**
- Self-signup + email login + 2FA (SSO for enterprise accounts)
- Product catalog (all P1 and P2 products with NFN seal, quantity, grade, region, price)
- Product detail page with full traceability view (source region, dates, yield, grade, audits)
- "Verify certificate" — scan QR or enter code
- Cart + checkout flow
- Payment integration (local bank transfer, BaridiMob for national; SWIFT/L.C. for export)
- Order management (quotes, confirmations, invoices)
- Shipment tracking with ETA
- Document downloads (invoices, certificates, export docs)
- Complaint/return submission form (links back to order + lot)
- Account management (company profile, shipping addresses, historical orders)
- Multi-language: French, English, Arabic

**Implementation plan:**
1. Next.js scaffold + public landing + auth (email + 2FA)
2. Product catalog page (reads from API, no login needed for browsing)
3. Product detail + traceability view (deep-linking to the public certification endpoint)
4. Login-gated account section
5. Cart + checkout (save drafts, no payment yet — collect the order)
6. Payment integration (start with bank transfer stub, add real integrations later)
7. Order history + shipment tracking
8. Document downloads + complaint submission

MVP = steps 1–3 (a buyer can browse and verify). Step 4–6 turns it transactional. 7–8 adds post-sale.

---

## 6. `web-institutional` — the ministry/regulator portal

**What it is:** Secure read-only portal for Algerian ministries and regulators. The "Interface de Sécurité" from the NFN diagram. Used for oversight, statistics, compliance verification, and regulatory filings.

**Who uses it:** Ministère de l'Agriculture, Ministère du Commerce, customs, statistical office, other institutional actors.

**Features (complete list):**
- Strong auth (SSO via institutional identity, mTLS for API, no password-only)
- Role-based scope — each ministry sees only what its mandate allows
- Aggregate statistics dashboards (national production, regional breakdown, seasonal trends, employment, economic indicators)
- Case-specific queries (lot lookup, product lookup, shepherd lookup — all audit-logged)
- Certificate verification (public + authenticated endpoints)
- Query audit log — every institutional query is immutably logged, visible to central NFN
- Regulatory filing auto-generation (periodic production reports, export declarations, statistical submissions)
- Data exports (CSV, standardized XML) filtered by mandate
- PII abstraction by default (regional aggregates, not individual shepherd names) — individual lookup requires justification

**Implementation plan:**
1. Next.js scaffold + SSO integration (SAML or OIDC depending on institutional provider)
2. Aggregate stats dashboards (mostly charts, reads from API aggregation endpoints)
3. Case-query module (lot/product lookup with scoping + auto-logging every query)
4. Certificate verification page (public route, no auth — just scan QR)
5. Query audit log viewer
6. Regulatory filing templates (one per institution) + auto-generation scheduler
7. Data export module with mandate-based filters

MVP = steps 1–2 (auth + dashboards). That's enough for the first pilot with one ministry. Add the rest incrementally.

---

