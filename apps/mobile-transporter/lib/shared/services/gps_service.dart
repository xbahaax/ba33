import 'dart:async';
import 'dart:io';

import 'package:geolocator/geolocator.dart';

import '../database/app_database.dart';
import '../../features/jobs/model/transport_job.dart';

typedef OnGpsUpdate = void Function(GpsPoint point);

class GpsService {
  GpsService(this._db);

  final AppDatabase _db;
  StreamSubscription<Position>? _sub;
  String? _currentJobId;

  bool get isTracking => _sub != null;

  Future<LocationPermission> requestPermission() async {
    bool enabled = await Geolocator.isLocationServiceEnabled();
    if (!enabled) return LocationPermission.denied;

    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
    }
    return perm;
  }

  Future<bool> startTracking(String jobId, {OnGpsUpdate? onUpdate}) async {
    if (_sub != null) stopTracking();

    final perm = await requestPermission();
    if (perm == LocationPermission.denied ||
        perm == LocationPermission.deniedForever) {
      return false;
    }

    _currentJobId = jobId;

    final LocationSettings settings = Platform.isAndroid
        ? AndroidSettings(
            accuracy: LocationAccuracy.high,
            distanceFilter: 30,
            intervalDuration: const Duration(seconds: 10),
            foregroundNotificationConfig: const ForegroundNotificationConfig(
              notificationText:
                  'ba33 enregistre votre position pendant le transport.',
              notificationTitle: 'Transport en cours',
              enableWakeLock: true,
              notificationChannelName: 'ba33 GPS',
            ),
          )
        : const LocationSettings(
            accuracy: LocationAccuracy.high,
            distanceFilter: 30,
          );

    _sub = Geolocator.getPositionStream(locationSettings: settings)
        .listen((position) async {
      await _db.insertGpsPoint(
        jobId: jobId,
        lat: position.latitude,
        lng: position.longitude,
        accuracy: position.accuracy,
        speedMps: position.speed.clamp(0, double.infinity),
      );

      onUpdate?.call(GpsPoint(
        lat: position.latitude,
        lng: position.longitude,
        recordedAt: DateTime.now(),
        speedMps: position.speed.clamp(0, double.infinity),
        accuracy: position.accuracy,
      ));
    });

    return true;
  }

  void stopTracking() {
    _sub?.cancel();
    _sub = null;
    _currentJobId = null;
  }

  Future<List<GpsPoint>> getRecordedPoints(String jobId) async {
    final rows = await _db.getGpsRecords(jobId);
    return rows
        .map((r) => GpsPoint(
              lat: r.lat,
              lng: r.lng,
              recordedAt: r.recordedAt,
              speedMps: r.speedMps,
              accuracy: r.accuracy,
            ))
        .toList();
  }

  Future<int> getPointCount(String jobId) =>
      _db.getGpsPointCount(jobId);
}
