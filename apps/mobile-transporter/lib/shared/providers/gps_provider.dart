import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../database/app_database.dart';
import '../services/gps_service.dart';
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

  @override
  GpsTrackerState build() {
    _service = GpsService(ref.read(appDatabaseProvider));
    ref.onDispose(_service.stopTracking);
    return const GpsTrackerState();
  }

  Future<void> startTracking(String jobId) async {
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
  }

  void stopTracking() {
    _service.stopTracking();
    state = state.copyWith(isTracking: false);
  }

  Future<List<GpsPoint>> getPoints(String jobId) =>
      _service.getRecordedPoints(jobId);
}
