import { Injectable, Inject, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  regions,
  users,
  sources,
  shepherds,
  collectors,
  preLots,
  lots,
  transporters,
  transportJobs,
  transportJobLots,
  depots,
  depotZones,
} from '../../common/database/schema';

const SALT_ROUNDS = 10;

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async seed() {
    this.logger.log('Seeding database...');

    // ── 1. Regions ──
    const [djelfa] = await this.db
      .insert(regions)
      .values({
        name: 'Djelfa',
        code: 'W-17',
        type: 'wilaya',
        latitude: '34.6700',
        longitude: '3.2500',
      })
      .onConflictDoNothing()
      .returning();

    const djelfaId = djelfa?.id;
    if (!djelfaId) {
      this.logger.log('Regions already seeded, fetching existing...');
      const [existing] = await this.db.select().from(regions).limit(1);
      return this.seedWithRegion(existing.id);
    }

    const [mseela] = await this.db
      .insert(regions)
      .values({
        name: "M'sila",
        code: 'W-28',
        type: 'wilaya',
        latitude: '35.7000',
        longitude: '4.5500',
      })
      .returning();

    const [ainOussera] = await this.db
      .insert(regions)
      .values({
        name: 'Ain Oussera',
        code: 'C-17-01',
        type: 'commune',
        parentId: djelfaId,
        latitude: '35.4500',
        longitude: '2.9000',
      })
      .returning();

    return this.seedWithRegion(djelfaId, mseela.id, ainOussera.id);
  }

  private async seedWithRegion(djelfaId: string, mseelaId?: string, ainOusseraId?: string) {
    const regionId = djelfaId;
    const password = await bcrypt.hash('password123', SALT_ROUNDS);

    // ── 2. Users ──
    // ── Shepherd users ──
    const [shepherd1] = await this.db
      .insert(users)
      .values({
        email: 'shepherd1@ba33.dz',
        passwordHash: password,
        fullName: 'عمر الراعي',
        phone: '0555000001',
        userType: 'shepherd',
        status: 'active',
        regionId,
      })
      .returning();

    const [shepherd2] = await this.db
      .insert(users)
      .values({
        email: 'shepherd2@ba33.dz',
        passwordHash: password,
        fullName: 'محمد بن أحمد',
        phone: '0555000002',
        userType: 'shepherd',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Collector ──
    const [collector1] = await this.db
      .insert(users)
      .values({
        email: 'collector1@ba33.dz',
        passwordHash: password,
        fullName: 'أحمد الجامع',
        phone: '0555000010',
        userType: 'collector',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Transporter ──
    const [transporter1] = await this.db
      .insert(users)
      .values({
        email: 'transporter1@ba33.dz',
        passwordHash: password,
        fullName: 'كريم الناقل',
        phone: '0555000020',
        userType: 'transporter',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Depot manager ──
    const [depotManager] = await this.db
      .insert(users)
      .values({
        email: 'depot1@ba33.dz',
        passwordHash: password,
        fullName: 'يوسف مدير المستودع',
        phone: '0555000030',
        userType: 'depot_manager',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Laverie operator ──
    const [laverieOp] = await this.db
      .insert(users)
      .values({
        email: 'laverie1@ba33.dz',
        passwordHash: password,
        fullName: 'فاطمة مشرفة الغسيل',
        phone: '0555000040',
        userType: 'laverie_operator',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Transformer operator ──
    const [transformerOp] = await this.db
      .insert(users)
      .values({
        email: 'transformer1@ba33.dz',
        passwordHash: password,
        fullName: 'سعيد مسؤول التحويل',
        phone: '0555000050',
        userType: 'transformer_operator',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Sales agent ──
    const [salesAgent] = await this.db
      .insert(users)
      .values({
        email: 'sales1@ba33.dz',
        passwordHash: password,
        fullName: 'نادية مسؤولة المبيعات',
        phone: '0555000060',
        userType: 'sales_agent',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Certification authority ──
    const [certAuth] = await this.db
      .insert(users)
      .values({
        email: 'cert1@ba33.dz',
        passwordHash: password,
        fullName: 'خالد مسؤول الشهادات',
        phone: '0555000070',
        userType: 'certification_authority',
        status: 'active',
        regionId,
      })
      .returning();

    // ── Admin ──
    const [admin] = await this.db
      .insert(users)
      .values({
        email: 'admin@ba33.dz',
        passwordHash: password,
        fullName: 'المدير العام',
        phone: '0555000099',
        userType: 'central_admin',
        status: 'active',
        regionId,
      })
      .returning();

    this.logger.log(`Created 9 users (all 9 pipeline roles)`);

    // ── 3. Sources (shepherds as wool sources) ──
    const [source1] = await this.db
      .insert(sources)
      .values({
        sourceType: 'c1_shepherd',
        name: 'مزرعة عمر',
        contactPhone: '0555000001',
        regionId,
        latitude: '34.6710',
        longitude: '3.2510',
        address: 'عين أوسرة، الجلفة',
        status: 'active',
        registeredBy: collector1.id,
      })
      .returning();

    const [source2] = await this.db
      .insert(sources)
      .values({
        sourceType: 'c1_shepherd',
        name: 'مزرعة محمد',
        contactPhone: '0555000002',
        regionId,
        latitude: '34.6750',
        longitude: '3.2600',
        address: 'حي السلام، الجلفة',
        status: 'active',
        registeredBy: collector1.id,
      })
      .returning();

    const [source3] = await this.db
      .insert(sources)
      .values({
        sourceType: 'c2_slaughterhouse',
        name: 'مسلخ الجلفة',
        contactPhone: '0555000003',
        regionId,
        latitude: '34.6800',
        longitude: '3.2700',
        address: 'المنطقة الصناعية، الجلفة',
        status: 'active',
        registeredBy: collector1.id,
      })
      .returning();

    // Shepherd details
    await this.db.insert(shepherds).values([
      { sourceId: source1.id, hasSmartphone: true, preferredLanguage: 'ar', flockSizeEstimate: 120, typicalYieldKgPerYear: '80.00' },
      { sourceId: source2.id, hasSmartphone: false, preferredLanguage: 'ar', flockSizeEstimate: 60, typicalYieldKgPerYear: '40.00' },
    ]);

    this.logger.log(`Created 3 sources`);

    // ── 4. Collector profile ──
    await this.db.insert(collectors).values({
      userId: collector1.id,
      assignedRegions: [regionId],
      active: true,
    });

    // ── 5. Transporter profile ──
    await this.db.insert(transporters).values({
      userId: transporter1.id,
      vehicleInfo: { plate: '12345-17', type: 'pickup', capacity_kg: 500 },
      active: true,
    });

    this.logger.log(`Created collector + transporter profiles`);

    // ── 6. Pre-lots (shepherd declarations) ──
    const [preLot1] = await this.db
      .insert(preLots)
      .values({
        sourceId: source1.id,
        estimatedWeightKg: '15.00',
        locationLat: '34.6710',
        locationLng: '3.2510',
        regionId,
        notes: 'صوف نظيف من الجز الربيعي',
        status: 'announced',
      })
      .returning();

    const [preLot2] = await this.db
      .insert(preLots)
      .values({
        sourceId: source2.id,
        estimatedWeightKg: '8.00',
        locationLat: '34.6750',
        locationLng: '3.2600',
        regionId,
        notes: 'كيس واحد، صوف مخلوط',
        status: 'announced',
      })
      .returning();

    const [preLot3] = await this.db
      .insert(preLots)
      .values({
        sourceId: source1.id,
        estimatedWeightKg: '50.00',
        locationLat: '34.6710',
        locationLng: '3.2510',
        regionId,
        notes: 'كمية كبيرة، جاهزة للجمع',
        status: 'assigned',
        assignedCollectorId: collector1.id,
        scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      })
      .returning();

    this.logger.log(`Created 3 pre-lots`);

    // ── 7. Lots (collected wool) ──
    const [lot1] = await this.db
      .insert(lots)
      .values({
        sourceId: source1.id,
        sourceType: 'c1_shepherd',
        collectorId: collector1.id,
        qrCode: 'BA33-LOT-001',
        declaredWeightKg: '12.50',
        actualWeightKg: '12.30',
        stateQuick: 'clean',
        urgency: 'normal',
        gpsLat: '34.6710',
        gpsLng: '3.2510',
        status: 'collected',
        isUrgent: false,
        collectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: 'صوف نظيف، جودة ممتازة',
      })
      .returning();

    const [lot2] = await this.db
      .insert(lots)
      .values({
        sourceId: source2.id,
        sourceType: 'c1_shepherd',
        collectorId: collector1.id,
        qrCode: 'BA33-LOT-002',
        declaredWeightKg: '7.00',
        actualWeightKg: '6.80',
        stateQuick: 'dirty',
        urgency: 'normal',
        gpsLat: '34.6750',
        gpsLng: '3.2600',
        status: 'collected',
        isUrgent: false,
        collectedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'يحتاج غسل',
      })
      .returning();

    const [lot3] = await this.db
      .insert(lots)
      .values({
        sourceId: source3.id,
        sourceType: 'c2_slaughterhouse',
        collectorId: collector1.id,
        qrCode: 'BA33-LOT-003',
        declaredWeightKg: '25.00',
        actualWeightKg: '24.50',
        stateQuick: 'with_meat',
        urgency: 'urgent',
        gpsLat: '34.6800',
        gpsLng: '3.2700',
        status: 'in_transit',
        isUrgent: true,
        collectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        notes: 'عاجل — صوف مسلخ مع بقايا',
      })
      .returning();

    const [lot4] = await this.db
      .insert(lots)
      .values({
        sourceId: source1.id,
        sourceType: 'c1_shepherd',
        collectorId: collector1.id,
        qrCode: 'BA33-LOT-004',
        declaredWeightKg: '18.00',
        actualWeightKg: '17.80',
        stateQuick: 'clean',
        urgency: 'normal',
        gpsLat: '34.6710',
        gpsLng: '3.2510',
        status: 'received_depot',
        isUrgent: false,
        collectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      })
      .returning();

    this.logger.log(`Created 4 lots`);

    // ── 8. Depot ──
    const [depot1] = await this.db
      .insert(depots)
      .values({
        name: 'مستودع الجلفة المركزي',
        regionId,
        address: 'المنطقة الصناعية، الجلفة',
        capacityKg: '10000.00',
        currentWeightKg: '17.80',
        managerId: depotManager.id,
        active: true,
      })
      .returning();

    await this.db.insert(depotZones).values([
      { depotId: depot1.id, code: 'Z-A', purpose: 'c1_normal' as const, capacityKg: '3000.00', currentWeightKg: '17.80' },
      { depotId: depot1.id, code: 'Z-B', purpose: 'c2_urgent' as const, capacityKg: '3000.00', currentWeightKg: '0.00' },
      { depotId: depot1.id, code: 'Z-C', purpose: 'dispatch_ready' as const, capacityKg: '4000.00', currentWeightKg: '0.00' },
    ]);

    this.logger.log(`Created depot with 3 zones`);

    // ── 9. Transport jobs ──
    const [job1] = await this.db
      .insert(transportJobs)
      .values({
        transporterId: transporter1.id,
        originType: 'collector',
        originId: collector1.id,
        destinationType: 'depot',
        destinationId: depot1.id,
        lane: 'normal',
        status: 'pending',
        requestedAt: new Date(),
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      })
      .returning();

    const [job2] = await this.db
      .insert(transportJobs)
      .values({
        originType: 'collector',
        originId: collector1.id,
        destinationType: 'depot',
        destinationId: depot1.id,
        lane: 'urgent_cold_chain',
        status: 'pending',
        requestedAt: new Date(),
        slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6h — urgent
      })
      .returning();

    // Link lots to jobs
    await this.db.insert(transportJobLots).values([
      { jobId: job1.id, lotId: lot1.id },
      { jobId: job1.id, lotId: lot2.id },
      { jobId: job2.id, lotId: lot3.id },
    ]);

    this.logger.log(`Created 2 transport jobs with lot assignments`);

    // ── Summary ──
    const summary = {
      regions: 3,
      users: {
        shepherd1: { phone: '0555000001', password: 'password123', name: shepherd1.fullName },
        shepherd2: { phone: '0555000002', password: 'password123', name: shepherd2.fullName },
        collector: { phone: '0555000010', password: 'password123', name: collector1.fullName },
        transporter: { phone: '0555000020', password: 'password123', name: transporter1.fullName },
        depotManager: { phone: '0555000030', password: 'password123', name: depotManager.fullName },
        admin: { phone: '0555000099', password: 'password123', name: admin.fullName },
      },
      sources: 3,
      preLots: 3,
      lots: 4,
      depot: 1,
      transportJobs: 2,
    };

    this.logger.log('Seed complete!');
    return summary;
  }
}
