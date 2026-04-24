import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database/database.module';
import { QueueModule } from './common/queues/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RegionsModule } from './modules/regions/regions.module';
import { FilesModule } from './modules/files/files.module';
import { EventsModule } from './modules/events/events.module';
import { AuditModule } from './modules/audit/audit.module';
import { RulesModule } from './modules/rules/rules.module';
import { SourcesModule } from './modules/sources/sources.module';
import { CollectionModule } from './modules/collection/collection.module';
import { LotsModule } from './modules/lots/lots.module';
import { TransportModule } from './modules/transport/transport.module';
import { DepotModule } from './modules/depot/depot.module';
import { LaverieModule } from './modules/laverie/laverie.module';
import { TransformationModule } from './modules/transformation/transformation.module';
import { CertificationModule } from './modules/certification/certification.module';
import { SalesModule } from './modules/sales/sales.module';
import { InstitutionalModule } from './modules/institutional/institutional.module';
import { SyncModule } from './modules/sync/sync.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    AuthModule,
    UsersModule,
    RegionsModule,
    FilesModule,
    EventsModule,
    AuditModule,
    RulesModule,
    SourcesModule,
    CollectionModule,
    LotsModule,
    TransportModule,
    DepotModule,
    LaverieModule,
    TransformationModule,
    CertificationModule,
    SalesModule,
    InstitutionalModule,
    SyncModule,
    NotificationsModule,
    SeedModule,
  ],
})
export class AppModule {}
