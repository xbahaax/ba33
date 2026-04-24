import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'app_database.g.dart';

// ── Table definitions ─────────────────────────────────────

class GpsPoints extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get jobId => text()();
  RealColumn get lat => real()();
  RealColumn get lng => real()();
  RealColumn get accuracy => real().withDefault(const Constant(0.0))();
  RealColumn get speedMps => real().withDefault(const Constant(0.0))();
  DateTimeColumn get recordedAt => dateTime()();
  BoolColumn get synced =>
      boolean().withDefault(const Constant(false))();
}

class EventQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get eventType => text()(); // weigh_in, weigh_out, temperature, etc.
  TextColumn get jobId => text()();
  TextColumn get payload => text()(); // JSON
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get synced =>
      boolean().withDefault(const Constant(false))();
}

class TripCache extends Table {
  TextColumn get rowKey =>
      text().withDefault(const Constant('singleton'))();
  TextColumn get stateJson => text()(); // ActiveTripState JSON
  BlobColumn get signatureBytes => blob().nullable()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {rowKey};
}

// ── Database ──────────────────────────────────────────────

@DriftDatabase(tables: [GpsPoints, EventQueue, TripCache])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() =>
      driftDatabase(name: 'ba33_transporter');

  // ── GPS ───────────────────────────────────────────────

  Future<void> insertGpsPoint({
    required String jobId,
    required double lat,
    required double lng,
    double accuracy = 0,
    double speedMps = 0,
  }) =>
      into(gpsPoints).insert(GpsPointsCompanion.insert(
        jobId: jobId,
        lat: lat,
        lng: lng,
        accuracy: Value(accuracy),
        speedMps: Value(speedMps),
        recordedAt: DateTime.now(),
      ));

  Future<List<GpsPoint>> getGpsPoints(String jobId) =>
      (select(gpsPoints)
            ..where((t) => t.jobId.equals(jobId))
            ..orderBy([(t) => OrderingTerm.asc(t.recordedAt)]))
          .get();

  Future<int> getGpsPointCount(String jobId) async {
    final count = gpsPoints.id.count();
    final q = selectOnly(gpsPoints)
      ..addColumns([count])
      ..where(gpsPoints.jobId.equals(jobId));
    final row = await q.getSingle();
    return row.read(count) ?? 0;
  }

  Future<void> markGpsSynced(String jobId) =>
      (update(gpsPoints)..where((t) => t.jobId.equals(jobId)))
          .write(const GpsPointsCompanion(synced: Value(true)));

  // ── Event queue ───────────────────────────────────────

  Future<void> queueEvent({
    required String eventType,
    required String jobId,
    required Map<String, dynamic> payload,
  }) =>
      into(eventQueue).insert(EventQueueCompanion.insert(
        eventType: eventType,
        jobId: jobId,
        payload: jsonEncode(payload),
        createdAt: DateTime.now(),
      ));

  Future<List<EventQueueData>> getPendingEvents() =>
      (select(eventQueue)..where((t) => t.synced.equals(false))).get();

  Future<int> getPendingEventCount() async {
    final count = eventQueue.id.count();
    final q = selectOnly(eventQueue)
      ..addColumns([count])
      ..where(eventQueue.synced.equals(false));
    final row = await q.getSingle();
    return row.read(count) ?? 0;
  }

  Future<void> markEventSynced(int id) =>
      (update(eventQueue)..where((t) => t.id.equals(id)))
          .write(const EventQueueCompanion(synced: Value(true)));

  Future<void> markAllEventsSynced(String jobId) =>
      (update(eventQueue)..where((t) => t.jobId.equals(jobId)))
          .write(const EventQueueCompanion(synced: Value(true)));

  // ── Trip cache ────────────────────────────────────────

  Future<TripCacheData?> getActiveTrip() =>
      (select(tripCache)..where((t) => t.rowKey.equals('singleton')))
          .getSingleOrNull();

  Future<void> saveActiveTrip({
    required String stateJson,
    List<int>? signatureBytes,
  }) =>
      into(tripCache).insertOnConflictUpdate(TripCacheCompanion.insert(
        stateJson: stateJson,
        signatureBytes: Value(
            signatureBytes != null
                ? Uint8List.fromList(signatureBytes)
                : null),
        updatedAt: DateTime.now(),
      ));

  Future<void> clearActiveTrip() =>
      (delete(tripCache)..where((t) => t.rowKey.equals('singleton')))
          .go();
}
