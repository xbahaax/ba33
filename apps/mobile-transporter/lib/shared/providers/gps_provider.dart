import 'dart:async';
import 'dart:math' as math;

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../database/app_database.dart';
import '../services/gps_service.dart';
import 'api_provider.dart';
import 'database_provider.dart';
import '../../features/jobs/model/transport_job.dart';

part 'gps_provider.g.dart';

class GpsTrackerState {
  const GpsTrackerState({
    this.isTracking = false,
    this.lastPoint,
    this.pointsRecorded = 0,
    this.hasPermission = true,
  });

  final bool isTracking;
  final GpsPoint? lastPoint;
  final int pointsRecorded;
  final bool hasPermission;

  /// True when GPS speed indicates the vehicle is stopped (< 5.4 km/h).
  /// Used to validate arrival before confirming delivery.
  bool get isLikelyArrived {
    if (!isTracking || lastPoint == null) return false;
    final speed = lastPoint!.speedMps;
    if (speed == null || speed < 0) return true; // no speed data → allow
    return speed < 1.5; // 1.5 m/s ≈ 5.4 km/h
  }

  /// Haversine distance in metres from the last GPS point to [lat]/[lng].
  /// Returns null if no GPS fix yet.
  double? distanceToMeters(double lat, double lng) {
    if (lastPoint == null) return null;
    const r = 6371000.0;
    final phi1 = lastPoint!.lat * math.pi / 180;
    final phi2 = lat * math.pi / 180;
    final dPhi = (lat - lastPoint!.lat) * math.pi / 180;
    final dLambda = (lng - lastPoint!.lng) * math.pi / 180;
    final a = math.sin(dPhi / 2) * math.sin(dPhi / 2) +
        math.cos(phi1) *
            math.cos(phi2) *
            math.sin(dLambda / 2) *
            math.sin(dLambda / 2);
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
  }

  GpsTrackerState copyWith({
    bool? isTracking,
    GpsPoint? lastPoint,
    int? pointsRecorded,
    bool? hasPermission,
  }) =>
      GpsTrackerState(
        isTracking: isTracking ?? this.isTracking,
        lastPoint: lastPoint ?? this.lastPoint,
        pointsRecorded: pointsRecorded ?? this.pointsRecorded,
        hasPermission: hasPermission ?? this.hasPermission,
      );
}

@Riverpod(keepAlive: true)
class GpsTracker extends _$GpsTracker {
  late final GpsService _service;
  Timer? _syncTimer;
  String? _currentJobId;

  @override
  GpsTrackerState build() {
    _service = GpsService(ref.read(appDatabaseProvider));
    ref.onDispose(() {
      _syncTimer?.cancel();
      _service.stopTracking();
    });
    return const GpsTrackerState();
  }

  Future<void> startTracking(String jobId) async {
    _currentJobId = jobId;
    final started = await _service.startTracking(jobId, onUpdate: (point) {
      final newCount = state.pointsRecorded + 1;
      state = state.copyWith(
        isTracking: true,
        lastPoint: point,
        pointsRecorded: newCount,
      );
    });

    if (!started) {
      state = state.copyWith(hasPermission: false, isTracking: false);
    } else {
      final count = await _service.getPointCount(jobId);
      state = state.copyWith(
        isTracking: true,
        hasPermission: true,
        pointsRecorded: count,
      );
    }

    // Start periodic GPS sync to server (every 30 seconds)
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _syncGpsToServer(jobId);
    });
  }

  void stopTracking() {
    _syncTimer?.cancel();
    _syncTimer = null;
    _service.stopTracking();
    state = state.copyWith(isTracking: false);

    // Final sync attempt
    if (_currentJobId != null) {
      _syncGpsToServer(_currentJobId!);
    }
  }

  Future<void> _syncGpsToServer(String jobId) async {
    try {
      final db = ref.read(appDatabaseProvider);
      final transportSvc = ref.read(transportServiceProvider);
      final unsynced = await db.getUnsyncedGpsRecords(jobId);
      if (unsynced.isEmpty) return;

      final syncedIds = <int>[];
      for (final record in unsynced) {
        try {
          await transportSvc.addGpsPoint(jobId, {
            'lat': record.lat.toString(),
            'lng': record.lng.toString(),
            'recordedAt': record.recordedAt.toIso8601String(),
          });
          syncedIds.add(record.id);
        } catch (_) {
          break; // Stop on first failure, retry next cycle
        }
      }
      if (syncedIds.isNotEmpty) {
        await db.markGpsRecordsSynced(syncedIds);
      }
    } catch (_) {
      // Sync failure is non-blocking
    }
  }

  Future<List<GpsPoint>> getPoints(String jobId) =>
      _service.getRecordedPoints(jobId);
}
