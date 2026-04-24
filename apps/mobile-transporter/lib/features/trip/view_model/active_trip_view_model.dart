import 'dart:typed_data';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../auth/view_model/auth_view_model.dart';
import '../../jobs/model/transport_job.dart';
import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/database_provider.dart';
import '../../../shared/providers/gps_provider.dart';
import '../../../shared/providers/sync_provider.dart';

part 'active_trip_view_model.g.dart';

@Riverpod(keepAlive: true)
class ActiveTrip extends _$ActiveTrip {
  @override
  ActiveTripState? build() => null;

  // ── Initialise from Drift on app start ───────────────

  Future<void> restoreFromDb() async {
    final db = ref.read(appDatabaseProvider);
    final cached = await db.getActiveTrip();
    if (cached == null) return;

    final jobId =
        ActiveTripState.fromJsonString(cached.stateJson).job.id;
    final gpsRows = await db.getGpsRecords(jobId);
    final gpsPoints = gpsRows
        .map((r) => GpsPoint(
              lat: r.lat,
              lng: r.lng,
              recordedAt: r.recordedAt,
              speedMps: r.speedMps,
              accuracy: r.accuracy,
            ))
        .toList();

    final pendingCount = await db.getPendingEventCount();

    state = ActiveTripState.fromJsonString(
      cached.stateJson,
      signatureBytes: cached.signatureBytes,
      gpsPoints: gpsPoints,
    ).copyWith(pendingSyncCount: pendingCount);
  }

  // ── Mutations (API-first, event queue as offline fallback) ──

  Future<void> startJob(TransportJob job) async {
    final newState = ActiveTripState(
      job: _cloneJob(job),
      phase: TripPhase.loading,
    );
    state = newState;
    _persist(newState);

    try {
      final transportSvc = ref.read(transportServiceProvider);
      final auth = ref.read(authStateProvider);
      await transportSvc.acceptJob(
        job.id,
        {'transporterId': auth.userId ?? ''},
      );
    } catch (_) {
      await _queueEvent('job.accepted', job.id, {'lane': job.lane.name});
    }
  }

  Future<void> loadLot(String qrCode, double weight) async {
    if (state == null) return;
    final lot = state!.job.lots.firstWhere((l) => l.qrCode == qrCode);
    final lots = state!.job.lots
        .map((l) => l.qrCode == qrCode
            ? l.copyWith(loadedWeight: weight, isLoaded: true)
            : l)
        .toList();
    final newState = state!.copyWith(job: _cloneJob(state!.job, lots: lots));
    state = newState;
    _persist(newState);

    try {
      final transportSvc = ref.read(transportServiceProvider);
      await transportSvc.loadLot(
        state!.job.id,
        lot.id,
        {'weight': weight.toString()},
      );
    } catch (_) {
      await _queueEvent('lot.weigh_in', state!.job.id, {
        'qrCode': qrCode,
        'lotId': lot.id,
        'weight': weight,
        'recordedAt': DateTime.now().toIso8601String(),
      });
    }
  }

  Future<void> startTrip() async {
    if (state == null) return;
    final newState = state!.copyWith(phase: TripPhase.inTransit);
    state = newState;
    _persist(newState);

    try {
      await ref.read(transportServiceProvider).startJob(state!.job.id);
    } catch (_) {
      await _queueEvent('trip.started', state!.job.id, {
        'totalLoadedWeight': state!.job.totalLoadedWeight,
      });
    }

    // Start GPS tracking
    ref.read(gpsTrackerProvider.notifier).startTracking(state!.job.id);
  }

  Future<void> startDelivering() async {
    if (state == null) return;
    final newState = state!.copyWith(phase: TripPhase.delivering);
    state = newState;
    _persist(newState);
    // Stop GPS when arrived
    ref.read(gpsTrackerProvider.notifier).stopTracking();
    await _queueEvent('trip.arrived', state!.job.id, {
      'gpsPointsRecorded': ref.read(gpsTrackerProvider).pointsRecorded,
    });
  }

  Future<void> deliverLot(String qrCode, double weight) async {
    if (state == null) return;
    final lot = state!.job.lots.firstWhere((l) => l.qrCode == qrCode);
    final lots = state!.job.lots
        .map((l) => l.qrCode == qrCode
            ? l.copyWith(deliveredWeight: weight, isDelivered: true)
            : l)
        .toList();
    final newState = state!.copyWith(job: _cloneJob(state!.job, lots: lots));
    state = newState;
    _persist(newState);

    try {
      final transportSvc = ref.read(transportServiceProvider);
      await transportSvc.deliverLot(
        state!.job.id,
        lot.id,
        {'weight': weight.toString()},
      );
    } catch (_) {
      await _queueEvent('lot.weigh_out', state!.job.id, {
        'qrCode': qrCode,
        'lotId': lot.id,
        'weight': weight,
        'recordedAt': DateTime.now().toIso8601String(),
      });
    }
  }

  Future<void> logTemperature(double temp) async {
    if (state == null) return;
    final readings = [
      ...state!.temperatureReadings,
      TemperatureReading(temperature: temp, recordedAt: DateTime.now()),
    ];
    final newState = state!.copyWith(temperatureReadings: readings);
    state = newState;
    _persist(newState);
    await _queueEvent('temperature.logged', state!.job.id, {
      'temperature': temp,
      'isAlert': temp > TemperatureReading.coldChainMax,
      'recordedAt': DateTime.now().toIso8601String(),
    });
  }

  void saveSignature(Uint8List bytes, String receiverName) {
    if (state == null) return;
    final newState = state!.copyWith(
      signatureBytes: bytes,
      receiverName: receiverName,
    );
    state = newState;
    _persist(newState);
  }

  Future<void> completeDelivery() async {
    if (state == null) return;
    final newState = state!.copyWith(phase: TripPhase.completed);
    state = newState;
    _persist(newState);

    try {
      await ref.read(transportServiceProvider).completeJob(state!.job.id);
    } catch (_) {
      await _queueEvent('trip.completed', state!.job.id, {
        'totalDeliveredWeight': state!.job.totalDeliveredWeight,
        'hasMismatch': state!.job.hasMismatch,
        'receiverName': state!.receiverName,
      });
    }
  }

  /// Update GPS points from the live stream (called by GPS provider listener)
  void updateGpsPoints(List<GpsPoint> points) {
    if (state == null) return;
    state = state!.copyWith(gpsPoints: points);
  }

  /// Refresh pending sync count from DB
  Future<void> refreshSyncCount() async {
    if (state == null) return;
    final count = await ref.read(appDatabaseProvider).getPendingEventCount();
    state = state!.copyWith(pendingSyncCount: count);
  }

  Future<void> reset() async {
    ref.read(gpsTrackerProvider.notifier).stopTracking();
    await ref.read(appDatabaseProvider).clearActiveTrip();
    state = null;
  }

  // ── Helpers ───────────────────────────────────────────

  void _persist(ActiveTripState s) {
    ref.read(appDatabaseProvider).saveActiveTrip(
          stateJson: s.toJsonString(),
          signatureBytes: s.signatureBytes,
        );
  }

  Future<void> _queueEvent(
    String type,
    String jobId,
    Map<String, dynamic> payload,
  ) async {
    await ref.read(syncQueueProvider.notifier).queueEvent(
          eventType: type,
          jobId: jobId,
          payload: payload,
        );
    await refreshSyncCount();
  }

  TransportJob _cloneJob(TransportJob job, {List<TransportLot>? lots}) =>
      TransportJob(
        id: job.id,
        originName: job.originName,
        originType: job.originType,
        destinationName: job.destinationName,
        destinationType: job.destinationType,
        lane: job.lane,
        status: JobStatus.accepted,
        requestedAt: job.requestedAt,
        slaDeadline: job.slaDeadline,
        lots: lots ??
            job.lots
                .map((l) => TransportLot(
                      id: l.id,
                      qrCode: l.qrCode,
                      sourceType: l.sourceType,
                      declaredWeight: l.declaredWeight,
                      loadedWeight: l.loadedWeight,
                      deliveredWeight: l.deliveredWeight,
                      isLoaded: l.isLoaded,
                      isDelivered: l.isDelivered,
                    ))
                .toList(),
      );
}
