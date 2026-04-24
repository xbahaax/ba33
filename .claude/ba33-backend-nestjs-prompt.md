# Prompt d'Implémentation — Backend NestJS `ba33-platform`

## Contexte du projet

Tu implémente le backend complet de la plateforme **ba33** — un système de traçabilité de filière laine en Algérie. Le backend est le service `apps/api` du monorepo `ba33-platform` (TypeScript, Turborepo, pnpm). Il expose une API REST consommée par trois portails web (operations, buyer, institutional) et trois apps Flutter mobiles (collector, shepherd, transporter).

**Contrainte fondamentale :** le lot (`lot`) est la colonne vertébrale. Chaque module du système gravite autour de lui. Chaque handoff physique de laine (collection → transport → dépôt → laverie → transformation → certification → vente) est un événement immuable dans le log d'événements.

---

## 1. Stack Technique

| Préoccupation | Choix |
|---|---|
| Framework | **NestJS 10+** |
| Architecture | **Module-based** — un module NestJS par domaine |
| ORM | **Drizzle ORM** |
| Base de données | **PostgreSQL 16+** |
| Dev DB | **Docker Compose** |
| Cache + Queue | **Redis 7** (Docker Compose) |
| Lib de queue | **BullMQ** |
| Auth | **JWT** (access + refresh tokens), **bcrypt** |
| Validation | **Zod** (schemas partagés via `@ba33/validation`) |
| Docs API | **@nestjs/swagger** → OpenAPI JSON → codegen `@ba33/api-client` |
| Tests | **Vitest** (unit) + **Supertest** (e2e) |
| Logging | **Pino** (structured JSON) |
| Language | **TypeScript strict** — `strict: true`, zéro `any` sans commentaire |

---

## 2. Position dans le Monorepo

```
ba33-platform/                  ← racine Turborepo
├── apps/
│   └── api/                    ← CE SERVICE
│       ├── src/
│       │   ├── modules/        ← 16 modules NestJS
│       │   ├── common/         ← infra partagée (db, auth, queues, pipes, filters)
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── packages/
│   ├── @ba33/types/            ← types partagés (DTOs, enums, entités)
│   ├── @ba33/validation/       ← schemas Zod partagés
│   ├── @ba33/domain/           ← logique métier pure, sans framework
│   └── @ba33/api-client/       ← généré depuis l'OpenAPI spec, NE PAS ÉDITER
├── infra/
│   ├── db/migrations/          ← migrations Drizzle commités
│   └── docker/docker-compose.yml
└── tools/
    └── codegen/                ← script de génération api-client
```

**Règle critique :** `apps/api` ne doit jamais importer depuis `apps/*` (un autre app). Les types partagés vont dans `packages/`. La logique métier pure va dans `@ba33/domain`. Les schemas Zod vont dans `@ba33/validation`.

---

## 3. Structure Interne de `apps/api/src/`

```
apps/api/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── regions/
│   ├── files/
│   ├── events/
│   ├── audit/
│   ├── rules/
│   ├── sources/
│   ├── collection/
│   ├── lots/
│   ├── transport/
│   ├── depot/
│   ├── laverie/
│   ├── transformation/
│   ├── certification/
│   ├── sales/
│   ├── institutional/
│   ├── sync/
│   └── notifications/
├── common/
│   ├── database/
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   ├── enums.ts
│   │   │   ├── regions.ts
│   │   │   ├── users.ts
│   │   │   ├── sources.ts
│   │   │   ├── collection.ts
│   │   │   ├── lots.ts
│   │   │   ├── transport.ts
│   │   │   ├── depot.ts
│   │   │   ├── laverie.ts
│   │   │   ├── transformation.ts
│   │   │   ├── certification.ts
│   │   │   ├── sales.ts
│   │   │   ├── institutional.ts
│   │   │   ├── events.ts
│   │   │   ├── audit.ts
│   │   │   ├── rules.ts
│   │   │   ├── files.ts
│   │   │   ├── notifications.ts
│   │   │   └── sync.ts
│   │   ├── client.ts
│   │   └── database.module.ts
│   ├── auth/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── queues/
│   │   ├── queues.module.ts
│   │   └── queue-names.ts
│   ├── filters/
│   │   ├── zod-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── timing.interceptor.ts
│   └── pipes/
│       └── zod-validation.pipe.ts
├── app.module.ts
└── main.ts
```

**Anatomie de chaque module (obligatoire pour les 16 modules) :**
```
{module}/
├── {module}.module.ts
├── {module}.controller.ts
├── {module}.service.ts
├── {module}.repository.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts
└── __tests__/
    ├── {module}.service.spec.ts
    └── {module}.controller.e2e-spec.ts
```

---

## 4. Les 16 Modules — Responsabilités et Dépendances

**Règle absolue :** la direction des dépendances va toujours vers l'intérieur. Un module lit/écrit uniquement ses propres tables. Pour accéder aux données d'un autre module, il passe par le **service** de ce module, jamais directement par Drizzle.

### 4.1 Modules d'infrastructure (cross-cutting)

| Module | Responsabilité | Dépend de |
|---|---|---|
| `database` | Client Drizzle, module Nest pour injection | — |
| `auth` | Login, issue/refresh JWT, gestion sessions | `users` |
| `users` | Comptes utilisateurs, rôles, types | `database` |
| `events` | Log append-only, émetteur d'événements interne | `database` |
| `audit` | Audits Ex/Sx, réconciliations automatiques | `events`, `lots` |
| `rules` | Moteur de règles configurable (A1, S2/S3, prix, gates cert) | `database` |
| `regions` | Référentiel des wilayas et communes algériennes | `database` |
| `files` | Photos, notes vocales, documents (stockage disque v1) | `database` |

### 4.2 Modules sources (amont)

| Module | Responsabilité | Dépend de |
|---|---|---|
| `sources` | Bergers C1, abattoirs C2, agrégateurs C3 | `users`, `regions` |
| `collection` | Pré-lots (déclarations), collecteurs, carnets, routes | `sources`, `lots`, `users` |

### 4.3 Module central

| Module | Responsabilité | Dépend de |
|---|---|---|
| `lots` | Table `lots`, cycle de vie, lignée (split/merge), photos, signatures, pesées | `events`, `sources` |

### 4.4 Phases de la chaîne

| Module | Responsabilité | Dépend de |
|---|---|---|
| `transport` | Jobs transport, étapes, weigh-in/out, alertes A1 | `lots`, `events`, `users`, `rules` |
| `depot` | Dépôts, zones, réceptions E1, dispatches S1 | `lots`, `events`, `transport` |
| `laverie` | Laveries, bains, lavage, qualification, S2/S3 | `lots`, `events`, `rules`, `depot` |
| `transformation` | Transformateurs D3/D4, BOM, runs de production, produits, déchets | `lots`, `events`, `laverie` |

### 4.5 Modules aval

| Module | Responsabilité | Dépend de |
|---|---|---|
| `certification` | Sceaux NFN, codes P1/P2, endpoints de vérification publique | `transformation`, `events`, `rules` |
| `sales` | Commandes, items, expéditions, acheteurs, 3 canaux | `certification`, `transformation`, `users` |
| `institutional` | Accès ministères, audit log des requêtes, stats agrégées | `events`, `lots` (read-only) |

### 4.6 Modules transverses

| Module | Responsabilité | Dépend de |
|---|---|---|
| `sync` | Endpoints sync mobile (push/pull) | `lots`, `events`, `collection`, `transport` |
| `notifications` | Records notification (delivery stubbée v1) | `events`, `users` |

---

## 5. Principes de Base de Données

1. **UUIDs partout.** Chaque PK est un UUID v4. Permet la génération hors-ligne depuis les mobiles sans collision.
2. **Timestamps sur chaque table.** `created_at`, `updated_at` UTC minimum. `deleted_at` seulement où le soft delete est justifié.
3. **Jamais de vraie suppression pour les entités domaine.** Lots, events, produits ne sont jamais `DELETE` — seulement un changement de statut.
4. **Log d'événements append-only.** La table `events` est la source immuable de vérité. Les tables relationnelles sont des projections dénormalisées pour la performance de lecture.
5. **Chaque handoff physique est un événement.** Pesée entrante, pesée sortante, scan, signature, impression — chaque opération est une ligne dans `events`.
6. **FK strictes.** Pas de références "molles" via text IDs. `ON DELETE RESTRICT` pour toutes les entités domaine.
7. **Enums PostgreSQL.** Pour les ensembles fermés (source_type, lot_status, channel). Drizzle supporte `pgEnum`.
8. **JSONB pour les payloads flexibles.** Payloads d'événements, métadonnées de fichiers, infos devices — JSONB avec validation Zod à la couche app.
9. **Index selon les requêtes.** Pas d'index spéculatifs. Chaque pattern de requête important reçoit un index.
10. **Schémas organisés par module.** `schema/lots.ts`, `schema/depot.ts`, etc.

---

## 6. Schéma de Base de Données Complet

### 6.1 `schema/enums.ts` — Tous les pgEnum

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

// users
export const userTypeEnum = pgEnum('user_type', [
  'collector', 'depot_manager', 'laverie_operator', 'transformer_operator',
  'sales_agent', 'central_admin', 'regional_manager', 'buyer', 'institutional', 'system'
]);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deleted']);

// regions
export const regionTypeEnum = pgEnum('region_type', ['wilaya', 'commune', 'village']);

// sources
export const sourceTypeEnum = pgEnum('source_type', ['c1_shepherd', 'c2_slaughterhouse', 'c3_aggregator']);
export const sourceStatusEnum = pgEnum('source_status', ['pending', 'active', 'suspended']);

// collection
export const preLotStatusEnum = pgEnum('pre_lot_status', ['announced', 'assigned', 'collected', 'cancelled', 'expired']);
export const routeStatusEnum = pgEnum('route_status', ['planned', 'in_progress', 'completed']);
export const routeStopStatusEnum = pgEnum('route_stop_status', ['pending', 'completed', 'skipped']);

// lots
export const lotStatusEnum = pgEnum('lot_status', [
  'announced', 'collected', 'in_transit', 'received_depot', 'in_pretri', 'stored',
  'dispatched_to_laverie', 'received_laverie', 'washing', 'washed', 'qualified',
  'dispatched_to_d3', 'dispatched_to_d4', 'in_transformation', 'transformed',
  'certified', 'sold', 'delivered', 'rejected', 'lost', 'quarantined'
]);
export const lotStateQuickEnum = pgEnum('lot_state_quick', ['clean', 'dirty', 'very_dirty', 'contaminated', 'with_meat']);
export const urgencyLevelEnum = pgEnum('urgency_level', ['normal', 'urgent']);
export const photoAngleEnum = pgEnum('photo_angle', ['overview', 'closeup', 'surroundings', 'other']);
export const signatureTypeEnum = pgEnum('signature_type', ['digital', 'thumbprint', 'paper_photo']);
export const lineageOperationEnum = pgEnum('lineage_operation', ['split', 'merge']);
export const weighSourceEnum = pgEnum('weigh_source', ['scale_bluetooth', 'manual', 'estimated']);

// transport
export const transportLaneEnum = pgEnum('transport_lane', ['normal', 'urgent_cold_chain', 'urgent_standard']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'assigned', 'accepted', 'in_progress', 'delivered', 'cancelled']);

// depot
export const zonePurposeEnum = pgEnum('zone_purpose', ['c1_normal', 'c2_urgent', 'c3_aggregator', 'quarantine', 'dispatch_ready']);
export const alertSeverityEnum = pgEnum('alert_severity', ['info', 'warning', 'critical']);
export const alertStatusEnum = pgEnum('alert_status', ['open', 'acknowledged', 'resolved']);

// laverie
export const gradeEnum = pgEnum('grade', ['A', 'B', 'C', 'reject']);
export const safetyStatusEnum = pgEnum('safety_status', ['clear', 'flagged', 'rejected']);
export const dispatchTrackEnum = pgEnum('dispatch_track', ['d3_textile', 'd4_bio', 'quarantine', 'reject']);
export const prewashActionEnum = pgEnum('prewash_action', ['approved', 'quarantined', 'rejected']);

// transformation
export const transformerTrackEnum = pgEnum('transformer_track', ['d3_textile', 'd4_bio']);
export const productStatusEnum = pgEnum('product_status', ['in_production', 'produced', 'certified', 'sold', 'shipped', 'delivered', 'rejected']);
export const wasteCategoryEnum = pgEnum('waste_category', ['reusable', 'recoverable', 'disposal']);

// certification
export const certStatusEnum = pgEnum('cert_status', ['pending', 'issued', 'revoked']);

// sales
export const channelEnum = pgEnum('channel', ['national', 'export', 'institutional']);
export const orderStatusEnum = pgEnum('order_status', ['draft', 'quote', 'confirmed', 'paid', 'preparing', 'shipped', 'delivered', 'returned', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'partial', 'paid', 'refunded']);
export const shipmentStatusEnum = pgEnum('shipment_status', ['pending', 'in_transit', 'delivered', 'returned']);
export const documentTypeEnum = pgEnum('document_type', ['invoice', 'traceability_certificate', 'origin_certificate', 'export_declaration', 'other']);

// institutional
export const instQueryTypeEnum = pgEnum('inst_query_type', ['lot_lookup', 'product_lookup', 'shepherd_lookup', 'cert_verify', 'aggregate_stats', 'export']);

// audit
export const auditTypeEnum = pgEnum('audit_type', ['entry_e1', 'exit_s1', 'internal_ex', 'internal_sx', 'reconciliation']);

// files
export const fileKindEnum = pgEnum('file_kind', ['photo', 'voice_note', 'signature', 'document', 'certificate_pdf']);

// sync
export const syncDirectionEnum = pgEnum('sync_direction', ['push', 'pull']);
export const syncBatchStatusEnum = pgEnum('sync_batch_status', ['pending', 'completed', 'failed']);
```

### 6.2 `schema/regions.ts`

```typescript
import { pgTable, uuid, text, decimal, timestamp } from 'drizzle-orm/pg-core';
import { regionTypeEnum } from './enums';

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),          // DZ-19 (ISO 3166-2)
  parentId: uuid('parent_id').references(() => regions.id),
  type: regionTypeEnum('type').notNull(),
  latitude: decimal('latitude'),
  longitude: decimal('longitude'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 6.3 `schema/users.ts`

```typescript
import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { userTypeEnum, userStatusEnum } from './enums';
import { regions } from './regions';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  userType: userTypeEnum('user_type').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  regionId: uuid('region_id').references(() => regions.id),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  permissions: jsonb('permissions').notNull().$type<string[]>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'restrict' }).notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.userId, t.roleId] }) }));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  deviceInfo: jsonb('device_info').$type<{ userAgent: string; ip: string }>(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

*(Continuer le même pattern pour tous les fichiers de schéma — voir section 6.x ci-dessous pour les tables restantes.)*

### 6.4 Tables restantes à implémenter (même pattern Drizzle)

Pour chaque fichier de schéma, implémenter exactement les colonnes définies dans le plan :

**`schema/sources.ts`** → `sources`, `shepherds`, `slaughterhouses`, `aggregators`

**`schema/collection.ts`** → `collectors`, `collector_booklets`, `pre_lots`, `routes`, `route_stops`

**`schema/lots.ts`** → `lots`, `lot_photos`, `lot_signatures`, `lot_lineage`, `lot_weighs`
- Index obligatoires : `(source_id)`, `(status)`, `(qr_code)`, `(collector_id)`, `(created_at DESC)`

**`schema/transport.ts`** → `transporters`, `transport_jobs`, `transport_job_lots`, `transport_gps_points`
- Index : `(job_id, recorded_at)` sur `transport_gps_points`

**`schema/depot.ts`** → `depots`, `depot_zones`, `depot_receptions`, `depot_dispatches`, `depot_dispatch_lots`, `a1_alerts`

**`schema/laverie.ts`** → `laveries`, `laverie_receptions`, `pre_wash_checks`, `washing_runs`, `qualifications`, `pricing_proposals`, `laverie_dispatches`

**`schema/transformation.ts`** → `transformers`, `boms`, `production_runs`, `production_run_lots`, `products`, `waste_records`

**`schema/certification.ts`** → `certifications`

**`schema/sales.ts`** → `buyers`, `orders`, `order_items`, `shipments`, `sales_documents`

**`schema/institutional.ts`** → `institutional_users`, `institutional_queries`

**`schema/events.ts`** → `events`, `event_subscriptions`
- Index obligatoires : `(aggregate_type, aggregate_id, version)`, `(event_type, occurred_at)`, `(recorded_at)`

**`schema/audit.ts`** → `audits`, `reconciliations`

**`schema/rules.ts`** → `rules_config`

**`schema/files.ts`** → `files`

**`schema/notifications.ts`** → `notifications`

**`schema/sync.ts`** → `sync_devices`, `sync_batches`

---

## 7. Configuration Drizzle

### `drizzle.config.ts` (à la racine de `apps/api`)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/common/database/schema/index.ts',
  out: '../../infra/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### `common/database/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const createDrizzleClient = (connectionString: string) => {
  const pool = new Pool({ connectionString, max: 20 });
  return drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });
};

export type DrizzleDb = ReturnType<typeof createDrizzleClient>;
```

### `common/database/database.module.ts`

```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDrizzleClient } from './client';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [{
    provide: DRIZZLE,
    inject: [ConfigService],
    useFactory: (config: ConfigService) =>
      createDrizzleClient(config.getOrThrow('DATABASE_URL')),
  }],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
```

### Commandes de migration

```bash
# Générer une migration après changement de schéma
pnpm drizzle-kit generate

# Appliquer les migrations
pnpm drizzle-kit migrate

# Studio Drizzle en dev
pnpm drizzle-kit studio
```

Les migrations sont commités dans `infra/db/migrations/`. Ne jamais éditer un fichier de migration déjà appliqué.

---

## 8. Infrastructure Commune

### 8.1 `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { pino } from 'pino';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // OpenAPI
  const config = new DocumentBuilder()
    .setTitle('ba33 Platform API')
    .setDescription('NFN wool traceability platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Publish spec for codegen
  app.getHttpAdapter().get('/api/openapi.json', (_, res) => res.json(document));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

### 8.2 `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './common/database/database.module';
// ... imports de tous les 16 modules

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    LoggerModule.forRoot({ pinoHttp: { level: process.env.LOG_LEVEL ?? 'info' } }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow('REDIS_URL') },
      }),
    }),
    DatabaseModule,
    // Les 16 modules domaine :
    AuthModule, UsersModule, RegionsModule, FilesModule,
    EventsModule, AuditModule, RulesModule,
    SourcesModule, CollectionModule, LotsModule,
    TransportModule, DepotModule, LaverieModule, TransformationModule,
    CertificationModule, SalesModule, InstitutionalModule,
    SyncModule, NotificationsModule,
  ],
})
export class AppModule {}
```

### 8.3 `common/pipes/zod-validation.pipe.ts`

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }
    return result.data;
  }
}
```

### 8.4 `common/filters/zod-exception.filter.ts`

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<string, unknown>;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...exceptionResponse,
    });
  }
}
```

### 8.5 Guards et Décorateurs Auth

```typescript
// common/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
);

// common/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// common/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// common/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

---

## 9. Implémentation des Modules — Patterns Standards

### Pattern Repository

```typescript
// Exemple : lots.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { DRIZZLE } from '../../common/database/database.module';
import { DrizzleDb } from '../../common/database/client';
import { lots, lotWeighs } from '../../common/database/schema';
import type { InsertLot, SelectLot, LotStatus } from '@ba33/types';

@Injectable()
export class LotsRepository {
  constructor(@Inject(DRIZZLE) private db: DrizzleDb) {}

  async findById(id: string): Promise<SelectLot | undefined> {
    return this.db.query.lots.findFirst({ where: eq(lots.id, id) });
  }

  async findByQrCode(qrCode: string): Promise<SelectLot | undefined> {
    return this.db.query.lots.findFirst({ where: eq(lots.qrCode, qrCode) });
  }

  async findMany(filters: { status?: LotStatus; sourceType?: string; limit?: number; offset?: number }) {
    const conditions = [];
    if (filters.status) conditions.push(eq(lots.status, filters.status));
    if (filters.sourceType) conditions.push(eq(lots.sourceType, filters.sourceType as any));

    return this.db.query.lots.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      orderBy: [desc(lots.createdAt)],
    });
  }

  async create(data: InsertLot): Promise<SelectLot> {
    const [lot] = await this.db.insert(lots).values(data).returning();
    return lot;
  }

  async updateStatus(id: string, status: LotStatus): Promise<SelectLot> {
    const [lot] = await this.db
      .update(lots)
      .set({ status, updatedAt: new Date() })
      .where(eq(lots.id, id))
      .returning();
    return lot;
  }
}
```

### Pattern Service

```typescript
// Exemple : lots.service.ts — la règle fondamentale : toute transition d'état émet un événement
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { LotsRepository } from './lots.repository';
import { EventsService } from '../events/events.service';
import { LotDomain } from '@ba33/domain'; // logique métier pure
import type { CreateLotDto, User } from '@ba33/types';

@Injectable()
export class LotsService {
  constructor(
    private readonly lotsRepository: LotsRepository,
    private readonly eventsService: EventsService,
  ) {}

  async createLot(dto: CreateLotDto, actor: User) {
    // 1. Vérifier si l'ID offline existe déjà (idempotence pour sync mobile)
    if (dto.id) {
      const existing = await this.lotsRepository.findById(dto.id);
      if (existing) return existing; // idempotent
    }

    // 2. Générer le QR code
    const qrCode = LotDomain.generateQrCode(dto.collectorId, dto.id);

    // 3. Persister dans une transaction
    // Toujours: état + événement dans la même transaction
    const lot = await this.lotsRepository.create({ ...dto, qrCode, status: 'collected' });

    // 4. Émettre l'événement
    await this.eventsService.emit({
      eventType: 'lot.collected',
      aggregateType: 'lot',
      aggregateId: lot.id,
      actorId: actor.id,
      actorType: 'user',
      payload: { qrCode, weight: dto.actualWeightKg, sourceType: lot.sourceType },
      occurredAt: dto.collectedAt ?? new Date(),
    });

    return lot;
  }
}
```

### Pattern Controller

```typescript
// Exemple : lots.controller.ts — les controllers ne contiennent AUCUNE logique métier
import { Controller, Get, Post, Param, Body, UseGuards, UsePipes, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LotsService } from './lots.service';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import { RolesGuard } from '../../common/auth/guards/roles.guard';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateLotSchema } from '@ba33/validation';

@ApiTags('lots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lot by ID' })
  @Roles('collector', 'depot_manager', 'central_admin', 'buyer')
  findOne(@Param('id') id: string) {
    return this.lotsService.findLotById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lot (supports offline-generated IDs)' })
  @Roles('collector', 'system')
  @UsePipes(new ZodValidationPipe(CreateLotSchema))
  create(@Body() dto: CreateLotDto, @CurrentUser() user: User) {
    return this.lotsService.createLot(dto, user);
  }
}
```

### Pattern EventsService (module central)

```typescript
// events.service.ts
@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDb,
    private readonly eventEmitter: EventEmitter2, // @nestjs/event-emitter
  ) {}

  async emit(params: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    actorId?: string;
    actorType: 'user' | 'system' | 'rule_engine';
    payload: Record<string, unknown>;
    occurredAt?: Date;
    syncSource?: string;
    deviceId?: string;
  }) {
    // Calculer la version (next sequence pour cet aggregate)
    const [{ maxVersion }] = await this.db
      .select({ maxVersion: sql<number>`COALESCE(MAX(version), 0)` })
      .from(events)
      .where(and(
        eq(events.aggregateType, params.aggregateType),
        eq(events.aggregateId, params.aggregateId),
      ));

    const version = maxVersion + 1;
    const checksum = this.computeChecksum(params);

    const [event] = await this.db.insert(events).values({
      ...params,
      version,
      checksum,
      occurredAt: params.occurredAt ?? new Date(),
      recordedAt: new Date(),
    }).returning();

    // Diffuser aux listeners internes (BullMQ workers, réconciliation, etc.)
    this.eventEmitter.emit(params.eventType, event);

    return event;
  }

  private computeChecksum(params: Record<string, unknown>): string {
    // SHA-256 sur le payload + aggregateId + version
    // crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex')
    return crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
  }
}
```

---

## 10. Module Auth — Spécifications Complètes

### Endpoints

```
POST /api/v1/auth/login          ← email + password → { accessToken, refreshToken, user }
POST /api/v1/auth/refresh        ← { refreshToken } → { accessToken, refreshToken }
POST /api/v1/auth/logout         ← révoque le refresh token (bearer requis)
GET  /api/v1/auth/me             ← retourne l'utilisateur courant (bearer requis)

# Dev-only (v1) — OTP stub
POST /api/v1/auth/otp/send       ← génère + retourne le code en response (pas de SMS)
POST /api/v1/auth/otp/verify     ← vérifie le code → { accessToken, refreshToken }
```

### JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; roles: string[] }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.status !== 'active') throw new UnauthorizedException();
    return user;
  }
}
```

### Token management

- **Access token** : expiry 15 minutes, payload `{ sub, email, userType, roles }`
- **Refresh token** : expiry 30 jours, stocké hashé (bcrypt) dans `sessions`
- Rotation : chaque refresh délivre un nouveau pair access+refresh, l'ancien refresh est révoqué
- Déconnexion : `revokedAt` posé sur la session

---

## 11. Module Lots — Traceabilité Complète

La traceabilité du lot est la fonctionnalité la plus critique. L'endpoint `/lots/:id/traceability` doit retourner l'arbre complet.

### Endpoint de traceabilité

```
GET /api/v1/lots/:id/traceability
```

**Response structure :**
```typescript
interface LotTraceability {
  lot: LotDetail;
  timeline: TraceabilityEvent[];      // tous les events ordered by occurred_at
  weighHistory: WeighRecord[];         // toutes les pesées
  lineage: {
    parents: LotSummary[];
    children: LotSummary[];
  };
  collection: CollectionDetail | null;
  transport: TransportLeg[];
  depotReception: DepotReception | null;
  laverieProcessing: LaverieProcessing | null;
  qualification: Qualification | null;
  transformation: TransformationDetail | null;
  certification: CertificationDetail | null;
  currentLocation: LocationSummary;
}
```

### Endpoint de vérification publique (non authentifié)

```
GET /api/v1/certification/verify/:code          ← par code P1-xxxxx ou P2-xxxxx
GET /api/v1/certification/verify/qr/:qrHash     ← depuis QR scanné
```

Response publique (PII abstrait) :
```typescript
interface PublicVerification {
  code: string;
  status: 'valid' | 'revoked' | 'not_found';
  productType: 'P1' | 'P2';
  grade: 'A' | 'B' | 'C';
  originRegion: string;             // wilaya uniquement, pas commune
  certifiedAt: string;
  nfnSealId: string;
  traceabilitySummary: {
    sourceCount: number;
    collectionDate: string;
    washingYieldPercent: number;
    auditsPassed: string[];
  };
}
```

---

## 12. Module Sales — Endpoints pour le Portail Buyer

### Endpoints produits (catalogue public — auth optionnel)

```
GET  /api/v1/products
     ?type=P1|P2
     &grade=A|B|C
     &regionId=uuid
     &certified=true
     &inStock=true
     &channel=national|export|institutional
     &sortBy=price_asc|price_desc|grade|availability|created_at
     &page=1
     &limit=20

GET  /api/v1/products/:id                        ← détail complet avec traceabilité
GET  /api/v1/products/:id/traceability-summary   ← version publique pour acheteur
```

### Endpoints commandes (auth buyer requis)

```
GET  /api/v1/orders                               ← commandes de l'acheteur connecté
     ?status=draft|quote|confirmed|...
     &page=1
     &limit=20

POST /api/v1/orders                               ← créer une commande
GET  /api/v1/orders/:id                           ← détail commande
PATCH /api/v1/orders/:id/status                   ← mettre à jour le statut

GET  /api/v1/orders/:id/shipment                  ← suivi d'expédition
GET  /api/v1/orders/:id/documents                 ← documents de la commande
GET  /api/v1/orders/:id/documents/:docId/download ← télécharger un document
```

### Endpoints panier (state géré côté client, commande créée en status `draft`)

```
POST /api/v1/orders                               ← status: 'draft', retourne orderId
PATCH /api/v1/orders/:id/items                    ← ajouter/modifier items
DELETE /api/v1/orders/:id/items/:itemId           ← retirer un item
POST /api/v1/orders/:id/confirm                   ← draft → quote → confirmed
```

### Endpoints réclamations

```
GET  /api/v1/complaints                           ← réclamations de l'acheteur
POST /api/v1/complaints                           ← soumettre une réclamation
GET  /api/v1/complaints/:id
```

### Endpoints compte acheteur

```
GET  /api/v1/buyer/profile                        ← profil entreprise
PATCH /api/v1/buyer/profile                       ← mettre à jour le profil
GET  /api/v1/buyer/addresses                      ← adresses de livraison
POST /api/v1/buyer/addresses
PATCH /api/v1/buyer/addresses/:id
DELETE /api/v1/buyer/addresses/:id
```

---

## 13. Module Rules — Moteur de Règles

Le moteur de règles est chargé une fois en mémoire et rechargé à chaque changement de config. Il s'applique dans `laverie` (S2/S3), `depot` (A1), `certification` (gates), et `sales` (pricing).

### Interface du moteur

```typescript
// rules.service.ts
@Injectable()
export class RulesService {
  private cache: Map<string, unknown> = new Map();

  async getRule<T>(key: string): Promise<T> {
    if (this.cache.has(key)) return this.cache.get(key) as T;

    const config = await this.db.query.rulesConfig.findFirst({
      where: and(
        eq(rulesConfig.ruleKey, key),
        lte(rulesConfig.effectiveFrom, new Date()),
        or(isNull(rulesConfig.effectiveTo), gte(rulesConfig.effectiveTo, new Date())),
      ),
      orderBy: [desc(rulesConfig.version)],
    });

    if (!config) throw new NotFoundException(`Rule '${key}' not found`);
    this.cache.set(key, config.value);
    return config.value as T;
  }

  async invalidateCache() {
    this.cache.clear();
  }

  // Décision S2/S3 — exposée au module laverie
  async determineDispatchTrack(qualification: Qualification): Promise<DispatchTrack> {
    const d3MinGrade = await this.getRule<string>('s2s3.d3_min_grade');
    const d3MinFiberLength = await this.getRule<number>('s2s3.d3_min_fiber_length_mm');

    const gradeOrder = { A: 3, B: 2, C: 1, reject: 0 };
    const qualGrade = gradeOrder[qualification.grade];
    const minGrade = gradeOrder[d3MinGrade as keyof typeof gradeOrder];

    if (qualification.grade === 'reject' || qualification.safetyStatus === 'rejected') {
      return 'reject';
    }
    if (qualification.safetyStatus === 'flagged') return 'quarantine';
    if (qualGrade >= minGrade && qualification.fiberLengthMm >= d3MinFiberLength) {
      return 'd3_textile';
    }
    return 'd4_bio';
  }

  // Vérification des gates de certification
  async checkCertificationGates(productId: string): Promise<{ eligible: boolean; gatesPassed: string[]; gatesFailed: string[] }> {
    const requiredGates = await this.getRule<string[]>('cert.required_gates');
    // Vérifier chaque gate contre les données du lot/produit
    // ...
  }
}
```

### Règles par défaut (seed)

```typescript
// Ces valeurs sont seedées à l'initialisation
const DEFAULT_RULES = [
  { key: 'a1.depot_weight_threshold_percent', value: 85 },
  { key: 'a1.depot_urgent_count_threshold', value: 5 },
  { key: 's2s3.d3_min_grade', value: 'B' },
  { key: 's2s3.d3_min_fiber_length_mm', value: 50 },
  { key: 'pricing.urgency_discount_percent', value: 15 },
  { key: 'pricing.c2_safety_premium_percent', value: -10 },
  { key: 'reconciliation.tolerance_percent', value: 2 },
  { key: 'cert.required_gates', value: ['e1_passed', 's1_passed', 'r1_within_range', 's2_dispatched', 'ex_sx_cleared', 'no_open_anomalies'] },
  { key: 'sla.c2_pickup_hours', value: 4 },
  { key: 'sla.c1_pickup_hours', value: 72 },
];
```

---

## 14. Jobs BullMQ

### Queues définies dans `common/queues/queue-names.ts`

```typescript
export const QUEUES = {
  RECONCILIATION: 'reconciliation',
  CERTIFICATION_CHECK: 'certification-check',
  A1_ALERT_CHECK: 'a1-alert-check',
  NOTIFICATION: 'notification',
  SYNC_PROCESS: 'sync-process',
} as const;
```

### Jobs importants

**Queue `reconciliation` :**
- Déclenché après chaque weigh-out (pesée sortante d'une phase)
- Calcule le delta avec le weigh-in de la phase précédente
- Crée un enregistrement `reconciliations`
- Si hors tolérance : crée un audit `flagged = true` + notification central_admin

**Queue `certification-check` :**
- Déclenché après chaque transition de lot vers `transformed`
- Vérifie tous les gates via `RulesService.checkCertificationGates()`
- Si tous passés : appelle `CertificationService.issueAutomatically()`

**Queue `a1-alert-check` :**
- Déclenché après chaque réception de lot au dépôt (E1)
- Calcule le pourcentage d'occupation du dépôt
- Si seuil dépassé : crée un `a1_alerts` record + notifie le dispatcher

---

## 15. Module Sync — Endpoints Mobile

### Pattern d'idempotence pour les mobiles offline

Les mobiles génèrent des IDs dans leur namespace avant de les envoyer. Le sync push est **idempotent** : envoyer le même événement deux fois ne crée pas de doublon.

### Endpoints sync

```
POST /api/v1/sync/push
{
  "deviceId": "uuid",
  "events": [
    {
      "clientId": "CL01-uuid-local",    ← ID généré offline par le mobile
      "eventType": "lot.collected",
      "aggregateId": "lot-uuid-offline",
      "payload": { ... },
      "occurredAt": "2024-01-15T08:30:00Z"
    }
  ]
}

Response: {
  "processed": 42,
  "skipped": 3,               ← déjà reçus (idempotence)
  "errors": [],
  "serverTime": "2024-01-15T09:00:00Z"
}

GET /api/v1/sync/pull?since=2024-01-15T08:00:00Z&deviceId=uuid
← retourne tous les events depuis le timestamp pour synchroniser le device
```

---

## 16. Variables d'Environnement

### `.env.example`

```env
# App
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://ba33:ba33_dev_password@localhost:5432/ba33_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002

# Files
STORAGE_PATH=./storage
MAX_FILE_SIZE_MB=20

# Seed (bootstrap)
ADMIN_EMAIL=admin@ba33.dz
ADMIN_PASSWORD=change-me-in-production
```

---

## 17. Docker Compose — `infra/docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ba33-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ba33
      POSTGRES_PASSWORD: ba33_dev_password
      POSTGRES_DB: ba33_platform
    ports:
      - "5432:5432"
    volumes:
      - ba33-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ba33 -d ba33_platform"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ba33-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - ba33-redis-data:/data
    command: redis-server --appendonly yes

volumes:
  ba33-postgres-data:
  ba33-redis-data:
```

Démarrage : `docker compose -f infra/docker/docker-compose.yml up -d`

---

## 18. Données de Seed

Implémenter un script `apps/api/src/seed.ts` exécuté via `pnpm seed` :

1. **58 wilayas algériennes** avec code ISO 3166-2 et communes principales
2. **Rôles** : `admin`, `collector`, `depot_manager`, `laverie_operator`, `transformer_operator`, `sales_agent`, `central_admin`, `buyer`, `institutional`
3. **Utilisateur admin par défaut** : email/password depuis les variables d'environnement, rôle `admin`
4. **10 règles par défaut** (voir section 13 ci-dessus)
5. **Entités de test** :
   - 1 dépôt (Alger, Tiaret ou Djelfa — wilaya à fort élevage)
   - 1 laverie
   - 1 transformer D3
   - 1 transformer D4
   - 3 sources : 1 berger C1, 1 abattoir C2, 1 agrégateur C3
   - 1 collecteur rattaché à l'user admin
   - 1 acheteur de test (`buyer@ba33.dz`)

---

## 19. Contraintes et Règles de Code

### Architecture
1. **Repositories → Services → Controllers.** Jamais de saut de niveau.
2. **Services ne touchent jamais Drizzle directement.** Ils appellent leurs repositories.
3. **Repositories ne contiennent aucune logique métier.** Uniquement requêtes.
4. **Controllers ne contiennent aucune logique.** Parse → service → return.
5. **La logique métier pure va dans `@ba33/domain`.** Sans NestJS, sans Drizzle.
6. **Chaque transition de statut émet un événement** dans la même transaction Drizzle.
7. **Les transactions Drizzle** pour toute écriture multi-tables : `await db.transaction(async (tx) => { ... })`

### TypeScript
8. **`strict: true`** dans tous les tsconfig. Zéro `any` sans commentaire justificatif.
9. **Les types partagés vivent dans `@ba33/types`.** Jamais de types dupliqués entre modules.
10. **Les schemas Zod vivent dans `@ba33/validation`.** Importés dans les DTOs NestJS.
11. **Nommage kebab-case** pour les fichiers : `lot-creation.dto.ts`, `lots.service.ts`.
12. **Nommage PascalCase** pour les classes : `LotsService`, `LotCreationDto`.
13. **Nommage camelCase** pour les méthodes et variables.

### Base de données
14. **Jamais de migration editée après application.** Nouvelle migration uniquement.
15. **Tous les enums dans `schema/enums.ts`.** Jamais de string literals éparpillés.
16. **Timestamps en UTC** : `timestamp with time zone` partout.
17. **Soft delete uniquement pour `users` et `sources`** (suspension de compte). Les lots et events ne sont jamais supprimés.
18. **Tout FK est enforced** avec `ON DELETE RESTRICT` pour les entités domaine.

### Tests
19. **Chaque méthode de service a au moins un test unitaire** (Vitest + mocks du repository).
20. **Chaque endpoint de controller a au moins un test e2e** (Supertest + base de données de test).
21. **Les tests n'utilisent jamais la DB de dev.** DB de test séparée, réinitialisée avant chaque suite.

### OpenAPI
22. **Tous les controllers sont décorés `@ApiTags`, `@ApiOperation`, `@ApiResponse`.**
23. **L'OpenAPI spec est publiée à `/api/openapi.json`** et committée dans le repo pour le codegen mobile.
24. **Jamais d'édition manuelle de `@ba33/api-client`** — il est généré depuis la spec.

### Conventions Git (ba33)
25. **Conventional commits** : `feat(lots): add traceability endpoint`, `fix(auth): refresh token rotation`
26. **Scopes** correspondent au nom du module : `feat(laverie): ...`, `fix(sales): ...`
27. **Pas de `TODO` sans ticket** : `// TODO(BA33-142): implement OTP sending`
28. **Pas de code commenté** : delete it, git remembers.
29. **`pnpm turbo lint typecheck test` avant chaque PR.** La CI enforça de toute façon.

---

## 20. Ordre de Build Recommandé

Construire dans cet ordre pour maximiser ce qui est fonctionnel le plus tôt possible :

1. Docker Compose up, Postgres + Redis running
2. `common/database/` — client Drizzle + `schema/enums.ts` + première migration
3. `schema/` — toutes les tables (un seul batch de migration)
4. `regions` module + seed des wilayas
5. `users` module (CRUD sans auth)
6. `auth` module (login, JWT, refresh)
7. `files` module (upload local disk)
8. `events` module (log append-only + EventEmitter)
9. `sources` module (C1/C2/C3)
10. `lots` module (la colonne vertébrale)
11. `collection` module (pré-lots, routes, collecteurs)
12. `transport` module
13. `depot` module + job A1 alert check (BullMQ)
14. `laverie` module + job réconciliation
15. `transformation` module
16. `certification` module + job certification check
17. `sales` module (tous les endpoints buyer)
18. `institutional` module
19. `audit` module + reconciliations
20. `rules` module (chargement runtime + cache)
21. `sync` module (mobile push/pull)
22. `notifications` module (stubbé)
23. Seed complet + tests e2e sur le flow bout-en-bout

**Après l'étape 10** : tu as une spine de lot fonctionnelle.
**Après l'étape 16** : tu as la traçabilité complète de bout en bout.
**Après l'étape 17** : le portail buyer peut être branché sur une API réelle.
**Après l'étape 23** : la plateforme complète est opérationnelle en dev.

---

## 21. Ce qui est Hors-Scope pour v1 (stubber)

| Feature | Comportement v1 |
|---|---|
| Envoi SMS OTP | Endpoint génère + retourne le code dans la response (dev only) |
| Push notifications (FCM/APNs) | Record créé en DB, pas de vrai envoi |
| Intégrations paiement | Ordres créés avec `payment_status: 'pending'`, pas d'appel gateway |
| Génération docs export/douane | Endpoint retourne un PDF stub |
| mTLS institutional | Remplacé par JWT + vérification de rôle |
| SSO ministères | Email + password comme les autres |
| IoT cold-chain | Colonne `cold_chain_temp_c` existe, saisie manuelle uniquement |
| Tracking transporteur externe | Mise à jour manuelle du statut uniquement |
| WhatsApp bot | Non implémenté |
| SMS gateway | Non implémenté |
