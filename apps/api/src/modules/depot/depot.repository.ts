import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../common/database/database.module';
import type { Database } from '../../common/database/client';
import {
  a1Alerts,
  depotDispatchLots,
  depotDispatches,
  depotReceptions,
  depotZones,
  depots,
  laveries,
  lotWeighs,
  lots,
  regions,
  users,
} from '../../common/database/schema';
import { appendWorkflowEvent } from '../../common/workflow/workflow-events';
import { CreateDepotDispatchDto } from './dto/create-depot-dispatch.dto';
import { CreateDepotReceptionDto } from './dto/create-depot-reception.dto';

@Injectable()
export class DepotRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

  async findAllDepots() {
    return this.db
      .select()
      .from(depots)
      .where(eq(depots.active, true))
      .orderBy(depots.name);
  }

  async getOverview() {
    const [
      depotRows,
      recentReceptions,
      recentAlerts,
      intakeQueue,
      dispatchQueue,
      zoneRows,
      laverieRows,
    ] = await Promise.all([
      this.db
        .select({
          id: depots.id,
          name: depots.name,
          address: depots.address,
          active: depots.active,
          capacityKg: depots.capacityKg,
          currentWeightKg: depots.currentWeightKg,
          updatedAt: depots.updatedAt,
          regionName: regions.name,
          managerName: users.fullName,
        })
        .from(depots)
        .leftJoin(regions, eq(depots.regionId, regions.id))
        .leftJoin(users, eq(depots.managerId, users.id))
        .orderBy(desc(depots.updatedAt)),
      this.db
        .select({
          id: depotReceptions.id,
          depotName: depots.name,
          lotId: lots.id,
          lotQrCode: lots.qrCode,
          actualWeightKg: depotReceptions.actualWeightKg,
          discrepancyKg: depotReceptions.discrepancyKg,
          toleranceExceeded: depotReceptions.toleranceExceeded,
          zoneCode: depotZones.code,
          receivedAt: depotReceptions.receivedAt,
          // Stage 3 fields
          lotClassification: depotReceptions.lotClassification,
          stackTemperatureC: depotReceptions.stackTemperatureC,
          humidityEntryPercent: depotReceptions.humidityEntryPercent,
          vegetalMatterPercent: depotReceptions.vegetalMatterPercent,
          plannedExitDate: depotReceptions.plannedExitDate,
        })
        .from(depotReceptions)
        .leftJoin(depots, eq(depotReceptions.depotId, depots.id))
        .leftJoin(lots, eq(depotReceptions.lotId, lots.id))
        .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
        .orderBy(desc(depotReceptions.receivedAt))
        .limit(8),
      this.db
        .select({
          id: a1Alerts.id,
          depotName: depots.name,
          severity: a1Alerts.severity,
          status: a1Alerts.status,
          firedAt: a1Alerts.firedAt,
          resolvedAt: a1Alerts.resolvedAt,
        })
        .from(a1Alerts)
        .leftJoin(depots, eq(a1Alerts.depotId, depots.id))
        .orderBy(desc(a1Alerts.firedAt))
        .limit(6),
      this.db
        .select({
          id: lots.id,
          qrCode: lots.qrCode,
          sourceType: lots.sourceType,
          urgency: lots.urgency,
          status: lots.status,
          declaredWeightKg: lots.declaredWeightKg,
          actualWeightKg: lots.actualWeightKg,
          collectedAt: lots.collectedAt,
          currentLocationType: lots.currentLocationType,
        })
        .from(lots)
        .where(inArray(lots.status, ['collected', 'in_transit']))
        .orderBy(desc(lots.collectedAt))
        .limit(8),
      this.db
        .select({
          id: lots.id,
          qrCode: lots.qrCode,
          sourceType: lots.sourceType,
          urgency: lots.urgency,
          status: lots.status,
          weightKg: lots.actualWeightKg,
          depotName: depots.name,
          zoneCode: depotZones.code,
          // Stage 3 fields from reception
          lotClassification: depotReceptions.lotClassification,
          vegetalMatterPercent: depotReceptions.vegetalMatterPercent,
          humidityEntryPercent: depotReceptions.humidityEntryPercent,
          plannedExitDate: depotReceptions.plannedExitDate,
        })
        .from(lots)
        .leftJoin(depots, eq(lots.currentLocationId, depots.id))
        .leftJoin(depotReceptions, eq(lots.id, depotReceptions.lotId))
        .leftJoin(depotZones, eq(depotReceptions.zoneId, depotZones.id))
        .where(inArray(lots.status, ['received_depot', 'in_pretri', 'stored']))
        .orderBy(desc(lots.updatedAt))
        .limit(8),
      this.db
        .select({
          id: depotZones.id,
          depotId: depotZones.depotId,
          depotName: depots.name,
          code: depotZones.code,
          purpose: depotZones.purpose,
          capacityKg: depotZones.capacityKg,
          currentWeightKg: depotZones.currentWeightKg,
        })
        .from(depotZones)
        .leftJoin(depots, eq(depotZones.depotId, depots.id))
        .orderBy(depots.name, depotZones.code),
      this.db
        .select({
          id: laveries.id,
          name: laveries.name,
          regionName: regions.name,
        })
        .from(laveries)
        .leftJoin(regions, eq(laveries.regionId, regions.id))
        .orderBy(laveries.name),
    ]);

    const totalCapacityKg = depotRows.reduce(
      (sum, row) => sum + Number(row.capacityKg ?? 0),
      0,
    );
    const currentWeightKg = depotRows.reduce(
      (sum, row) => sum + Number(row.currentWeightKg ?? 0),
      0,
    );

    return {
      summary: {
        totalDepots: depotRows.length,
        activeDepots: depotRows.filter((row) => row.active).length,
        totalCapacityKg,
        currentWeightKg,
        occupancyRate: totalCapacityKg > 0 ? currentWeightKg / totalCapacityKg : 0,
        openAlerts: recentAlerts.filter((alert) => alert.status !== 'resolved').length,
      },
      depots: depotRows.map((row) => ({
        ...row,
        occupancyRate:
          Number(row.capacityKg ?? 0) > 0
            ? Number(row.currentWeightKg ?? 0) / Number(row.capacityKg ?? 0)
            : 0,
      })),
      recentReceptions,
      recentAlerts,
      intakeQueue,
      dispatchQueue,
      zones: zoneRows,
      laveries: laverieRows,
    };
  }

  async receiveLot(
    input: CreateDepotReceptionDto,
    actorId: string,
    actorType: string,
  ) {
    const [lot] = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        declaredWeightKg: lots.declaredWeightKg,
        actualWeightKg: lots.actualWeightKg,
        status: lots.status,
      })
      .from(lots)
      .where(eq(lots.id, input.lotId))
      .limit(1);

    if (!lot) {
      throw new NotFoundException('Lot introuvable.');
    }

    if (!['collected', 'in_transit'].includes(lot.status)) {
      throw new BadRequestException('Le lot ne peut pas être reçu au dépôt depuis son statut actuel.');
    }

    const [depot] = await this.db
      .select({
        id: depots.id,
        currentWeightKg: depots.currentWeightKg,
      })
      .from(depots)
      .where(eq(depots.id, input.depotId))
      .limit(1);

    if (!depot) {
      throw new NotFoundException('Dépôt introuvable.');
    }

    const [zone] = input.zoneId
      ? await this.db
          .select({
            id: depotZones.id,
            depotId: depotZones.depotId,
            currentWeightKg: depotZones.currentWeightKg,
          })
          .from(depotZones)
          .where(eq(depotZones.id, input.zoneId))
          .limit(1)
      : [null];

    if (input.zoneId && (!zone || zone.depotId !== input.depotId)) {
      throw new BadRequestException('La zone sélectionnée n’appartient pas au dépôt.');
    }

    const declaredWeightKg = Number(
      lot.actualWeightKg ?? lot.declaredWeightKg ?? input.actualWeightKg,
    );
    const actualWeightKg = input.actualWeightKg;
    const discrepancyKg = actualWeightKg - declaredWeightKg;
    const toleranceExceeded =
      Math.abs(discrepancyKg) > Math.max(declaredWeightKg * 0.05, 5);
    const receivedAt = new Date();

    return this.db.transaction(async (tx) => {
      const [reception] = await tx
        .insert(depotReceptions)
        .values({
          depotId: input.depotId,
          lotId: input.lotId,
          declaredWeightKg: declaredWeightKg.toFixed(2),
          actualWeightKg: actualWeightKg.toFixed(2),
          discrepancyKg: discrepancyKg.toFixed(2),
          toleranceExceeded,
          zoneId: input.zoneId,
          receivedBy: actorId,
          receivedAt,
          notes: input.notes,
          // Stage 3 fields
          lotClassification: input.lotClassification,
          stackTemperatureC: input.stackTemperatureC?.toFixed(2),
          humidityEntryPercent: input.humidityEntryPercent?.toFixed(2),
          vegetalMatterPercent: input.vegetalMatterPercent?.toFixed(2),
          plannedExitDate: input.plannedExitDate,
        })
        .returning({
          id: depotReceptions.id,
          receivedAt: depotReceptions.receivedAt,
        });

      await tx
        .update(lots)
        .set({
          actualWeightKg: actualWeightKg.toFixed(2),
          currentLocationId: input.depotId,
          currentLocationType: 'depot',
          status: 'received_depot',
          updatedAt: receivedAt,
        })
        .where(eq(lots.id, input.lotId));

      await tx
        .update(depots)
        .set({
          currentWeightKg: (
            Number(depot.currentWeightKg ?? 0) + actualWeightKg
          ).toFixed(2),
          updatedAt: receivedAt,
        })
        .where(eq(depots.id, input.depotId));

      if (zone) {
        await tx
          .update(depotZones)
          .set({
            currentWeightKg: (
              Number(zone.currentWeightKg ?? 0) + actualWeightKg
            ).toFixed(2),
          })
          .where(eq(depotZones.id, zone.id));
      }

      await tx.insert(lotWeighs).values({
        lotId: input.lotId,
        phase: 'depot_entry',
        weightKg: actualWeightKg.toFixed(2),
        source: 'manual',
        recordedBy: actorId,
        recordedAt: receivedAt,
      });

      await appendWorkflowEvent(tx, {
        aggregateId: input.lotId,
        aggregateType: 'lot',
        actorId,
        actorType,
        eventType: 'depot_received',
        occurredAt: receivedAt,
        payload: {
          actualWeightKg,
          depotId: input.depotId,
          discrepancyKg,
          lotQrCode: lot.qrCode,
          zoneId: input.zoneId ?? null,
        },
      });

      return {
        id: reception.id,
        lotId: input.lotId,
        status: 'received_depot',
        receivedAt: reception.receivedAt,
      };
    });
  }

  async dispatchLot(
    input: CreateDepotDispatchDto,
    actorId: string,
    actorType: string,
  ) {
    const [lot] = await this.db
      .select({
        id: lots.id,
        qrCode: lots.qrCode,
        status: lots.status,
        actualWeightKg: lots.actualWeightKg,
        declaredWeightKg: lots.declaredWeightKg,
      })
      .from(lots)
      .where(eq(lots.id, input.lotId))
      .limit(1);

    if (!lot) {
      throw new NotFoundException('Lot introuvable.');
    }

    if (!['received_depot', 'in_pretri', 'stored'].includes(lot.status)) {
      throw new BadRequestException('Le lot n’est pas prêt pour une sortie dépôt.');
    }

    const [depot] = await this.db
      .select({
        id: depots.id,
        currentWeightKg: depots.currentWeightKg,
      })
      .from(depots)
      .where(eq(depots.id, input.depotId))
      .limit(1);

    if (!depot) {
      throw new NotFoundException('Dépôt introuvable.');
    }

    if (!input.destinationLaverieId && !input.destinationTransformerId) {
      throw new BadRequestException('Une destination (laverie ou transformateur) est requise.');
    }

    if (input.destinationLaverieId) {
      const [laverie] = await this.db
        .select({ id: laveries.id })
        .from(laveries)
        .where(eq(laveries.id, input.destinationLaverieId))
        .limit(1);
      if (!laverie) throw new NotFoundException('Laverie introuvable.');
    }

    const manifestWeightKg = Number(
      input.manifestWeightKg ??
        lot.actualWeightKg ??
        lot.declaredWeightKg ??
        0,
    );

    if (manifestWeightKg <= 0) {
      throw new BadRequestException('Le poids manifeste doit être positif.');
    }

    const [latestReception] = await this.db
      .select({
        zoneId: depotReceptions.zoneId,
      })
      .from(depotReceptions)
      .where(eq(depotReceptions.lotId, input.lotId))
      .orderBy(desc(depotReceptions.receivedAt))
      .limit(1);

    const [zone] = latestReception?.zoneId
      ? await this.db
          .select({
            id: depotZones.id,
            currentWeightKg: depotZones.currentWeightKg,
          })
          .from(depotZones)
          .where(eq(depotZones.id, latestReception.zoneId))
          .limit(1)
      : [null];

    const dispatchedAt = new Date();

    return this.db.transaction(async (tx) => {
      const [dispatch] = await tx
        .insert(depotDispatches)
        .values({
          depotId: input.depotId,
          destinationLaverieId: input.destinationLaverieId,
          destinationTransformerId: input.destinationTransformerId,
          manifestWeightKg: manifestWeightKg.toFixed(2),
          dispatchedBy: actorId,
          dispatchedAt,
          // Stage 4 fields
          fluxAWeightKg: input.fluxAWeightKg?.toFixed(2),
          fluxBWeightKg: input.fluxBWeightKg?.toFixed(2),
          impurityRatePercent: input.impurityRatePercent?.toFixed(2),
          humidityExitPercent: input.humidityExitPercent?.toFixed(2),
          destinationDirect: input.destinationDirect,
        })
        .returning({
          id: depotDispatches.id,
          dispatchedAt: depotDispatches.dispatchedAt,
        });

      await tx.insert(depotDispatchLots).values({
        dispatchId: dispatch.id,
        lotId: input.lotId,
        weightKg: manifestWeightKg.toFixed(2),
      });

      await tx
        .update(lots)
        .set({
          currentLocationId: input.destinationLaverieId ?? input.destinationTransformerId,
          currentLocationType: input.destinationLaverieId ? 'laverie' : 'transformer',
          status: input.destinationLaverieId ? 'dispatched_to_laverie' : 'dispatched_to_d4',
          updatedAt: dispatchedAt,
        })
        .where(eq(lots.id, input.lotId));

      await tx
        .update(depots)
        .set({
          currentWeightKg: Math.max(
            0,
            Number(depot.currentWeightKg ?? 0) - manifestWeightKg,
          ).toFixed(2),
          updatedAt: dispatchedAt,
        })
        .where(eq(depots.id, input.depotId));

      if (zone) {
        await tx
          .update(depotZones)
          .set({
            currentWeightKg: Math.max(
              0,
              Number(zone.currentWeightKg ?? 0) - manifestWeightKg,
            ).toFixed(2),
          })
          .where(eq(depotZones.id, zone.id));
      }

      await appendWorkflowEvent(tx, {
        aggregateId: input.lotId,
        aggregateType: 'lot',
        actorId,
        actorType,
        eventType: 'depot_dispatched',
        occurredAt: dispatchedAt,
        payload: {
          depotId: input.depotId,
          destinationLaverieId: input.destinationLaverieId,
          dispatchId: dispatch.id,
          lotQrCode: lot.qrCode,
          manifestWeightKg,
        },
      });

      return {
        id: dispatch.id,
        lotId: input.lotId,
        status: 'dispatched_to_laverie',
        dispatchedAt: dispatch.dispatchedAt,
      };
    });
  }
}
