# ba33

NFN wool traceability platform for Algeria — track every kilogram from
shepherd to certified product.
[Demo](https://drive.google.com/drive/folders/1xVHQTM0rz2avRYF6d16PVcItHCbitaow)

this is hakathon porject represent the power of supply chain 

---

## Quickstart

```bash
make            # boots Postgres + Redis + API + web-operations
make seed       # populates demo data (laverie, transformer, BOM, 11 personas)
make shepherd   # mobile-shepherd on simulator
make collector  # mobile-collector on simulator
```

Then:
- API: `http://localhost:3001` (Swagger at `/api/docs`)
- web-operations: `http://localhost:3000`
- web-buyer: `http://localhost:3001` (run separately, see deployment doc)
- web-institutional: `http://localhost:3002`

Smoke test: `bash scripts/test-pipeline.sh` → `Results: 55 pass · 0 fail · 0 skip`.

---

## Documentation

Full documentation is in **[`docs/`](docs/README.md)**.

| Doc | What it covers |
|---|---|
| [docs/README.md](docs/README.md) | Doc index + quickstart |
| [docs/PRD.md](docs/PRD.md) | Product requirements + user personas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Monorepo layout, tech stack, dependency graph |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | DB schema, event log, key relationships |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | All 137 endpoints |
| [docs/PIPELINE.md](docs/PIPELINE.md) | End-to-end data flow |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md) | Each phase deep dive |
| [docs/MOBILE_APPS.md](docs/MOBILE_APPS.md) | mobile-shepherd + mobile-collector |
| [docs/WEB_APPS.md](docs/WEB_APPS.md) | web-operations + web-buyer + web-institutional |
| [docs/AUTH_AND_RBAC.md](docs/AUTH_AND_RBAC.md) | Personas, permissions, role-based routing |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Docker, env, migrations, seed |
| [docs/TESTING.md](docs/TESTING.md) | E2E test script + smoke recipes |
| [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) | Step-by-step demo script |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Conventions, codegen, contribution rules |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | NFN domain terminology |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Significant changes vs the original cahier |

For AI agents working on this repo: read [`CLAUDE.md`](CLAUDE.md) +
[`AGENTS.md`](AGENTS.md) before writing code.

---

## What's in this repo

```
ba33/
├── apps/
│   ├── api/                NestJS API · 16 modules · 137 endpoints
│   ├── mobile-shepherd/    Flutter · unified wool source app
│   ├── mobile-collector/   Flutter · instruction-driven collector app
│   ├── web-operations/     Next.js · internal command center
│   ├── web-buyer/          Next.js · B2B portal + public verify
│   └── web-institutional/  Next.js · ministry oversight
├── packages/               shared TS + Dart packages
├── infra/                  Docker compose + Drizzle migrations
├── scripts/test-pipeline.sh  e2e smoke test
├── Makefile                all dev commands
└── docs/                   complete documentation
```

---

## Demo personas (all password `password123`)

| Phone | Role |
|---|---|
| `0555000001` | central_admin |
| `0555000002` | collector |
| `0555000003` | depot_manager |
| `0555000010` | shepherd |

Buyer portal: `buyer@ba33.dz` / `Buyer@2026!`.

See **[docs/AUTH_AND_RBAC.md](docs/AUTH_AND_RBAC.md)** for the full roster.

---

## License

Internal hackathon project — not licensed for external distribution as of v1.
