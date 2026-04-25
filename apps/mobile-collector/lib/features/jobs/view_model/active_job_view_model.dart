import 'dart:async';

import 'package:geolocator/geolocator.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../model/collection_job.dart';
import 'jobs_view_model.dart';

part 'active_job_view_model.g.dart';

/// State for a collector executing one collection job — keeps GPS samples,
/// pushes them to the backend, and detects arrival when the collector is
/// within [arrivalRadiusMeters] of the source.
class ActiveJobState {
  const ActiveJobState({
    required this.job,
    required this.points,
    this.lastFix,
    this.distanceToOriginMeters,
    this.isPushing = false,
    this.error,
  });

  final CollectionJob job;
  final List<Position> points;
  final Position? lastFix;
  final double? distanceToOriginMeters;
  final bool isPushing;
  final String? error;

  bool get hasArrived =>
      distanceToOriginMeters != null &&
      distanceToOriginMeters! <= ActiveJobViewModel.arrivalRadiusMeters;

  ActiveJobState copyWith({
    CollectionJob? job,
    List<Position>? points,
    Position? lastFix,
    double? distanceToOriginMeters,
    bool? isPushing,
    String? error,
  }) {
    return ActiveJobState(
      job: job ?? this.job,
      points: points ?? this.points,
      lastFix: lastFix ?? this.lastFix,
      distanceToOriginMeters:
          distanceToOriginMeters ?? this.distanceToOriginMeters,
      isPushing: isPushing ?? this.isPushing,
      error: error,
    );
  }
}

@Riverpod(keepAlive: true)
class ActiveJobViewModel extends _$ActiveJobViewModel {
  static const double arrivalRadiusMeters = 150;
  static const Duration _pushInterval = Duration(seconds: 30);

  StreamSubscription<Position>? _subscription;
  Timer? _pushTimer;
  final List<Position> _unpushed = [];

  @override
  Future<ActiveJobState?> build() async {
    ref.onDispose(() {
      _subscription?.cancel();
      _pushTimer?.cancel();
    });
    return null;
  }

  /// Load a job by ID. Called by the screen on init.
  Future<void> load(String jobId) async {
    state = const AsyncLoading();
    try {
      final svc = ref.read(collectionServiceProvider);
      final raw = await svc.getJob(jobId);
      final job = CollectionJob.fromJson(raw);
      state = AsyncValue.data(ActiveJobState(job: job, points: const []));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  /// Collector accepts the job + transitions to `accepted`.
  Future<void> accept() async {
    final current = state.value;
    if (current == null) return;
    final svc = ref.read(collectionServiceProvider);
    await svc.acceptJob(current.job.id);
    await refresh();
  }

  /// Collector starts the trip → server transitions to `in_progress`.
  /// We start tailing the GPS stream and pushing points periodically.
  Future<void> start() async {
    final current = state.value;
    if (current == null) return;

    final svc = ref.read(collectionServiceProvider);
    await svc.startJob(current.job.id);
    await refresh();

    await _startGps();
  }

  Future<void> _startGps() async {
    final hasService = await Geolocator.isLocationServiceEnabled();
    if (!hasService) {
      state = AsyncValue.data(state.value!.copyWith(
        error: 'Activez la localisation pour suivre le trajet',
      ));
      return;
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      state = AsyncValue.data(state.value!.copyWith(
        error: 'Permission de localisation refusée',
      ));
      return;
    }

    await _subscription?.cancel();
    _subscription = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        distanceFilter: 10,
      ),
    ).listen(_onGps, onError: (_) {});

    _pushTimer?.cancel();
    _pushTimer = Timer.periodic(_pushInterval, (_) => _pushPending());
  }

  void _onGps(Position p) {
    final s = state.value;
    if (s == null) return;
    _unpushed.add(p);
    final originLat = s.job.pickupLat;
    final originLng = s.job.pickupLng;
    double? distance;
    if (originLat != null && originLng != null) {
      distance = Geolocator.distanceBetween(
        p.latitude,
        p.longitude,
        originLat,
        originLng,
      );
    }
    state = AsyncValue.data(s.copyWith(
      points: [...s.points, p],
      lastFix: p,
      distanceToOriginMeters: distance,
    ));
  }

  Future<void> _pushPending() async {
    if (_unpushed.isEmpty) return;
    final s = state.value;
    if (s == null) return;
    final batch = List<Position>.from(_unpushed);
    _unpushed.clear();

    state = AsyncValue.data(s.copyWith(isPushing: true));
    try {
      final svc = ref.read(collectionServiceProvider);
      await svc.submitJobGps(
        s.job.id,
        batch
            .map((p) => {
                  'lat': p.latitude.toString(),
                  'lng': p.longitude.toString(),
                  'speedMps': p.speed >= 0 ? p.speed.toString() : null,
                  'accuracy': p.accuracy.toString(),
                  'recordedAt': p.timestamp.toUtc().toIso8601String(),
                })
            .toList(),
      );
    } catch (_) {
      // Re-queue on failure
      _unpushed.insertAll(0, batch);
    } finally {
      final cur = state.value;
      if (cur != null) {
        state = AsyncValue.data(cur.copyWith(isPushing: false));
      }
    }
  }

  /// Marks arrival on the server. Called either automatically when GPS shows
  /// the collector entered the arrival radius, or manually from the UI.
  Future<void> markArrived() async {
    final s = state.value;
    if (s == null) return;
    final svc = ref.read(collectionServiceProvider);
    await _pushPending();
    await svc.markJobArrived(
      s.job.id,
      lat: s.lastFix?.latitude.toString(),
      lng: s.lastFix?.longitude.toString(),
    );
    await refresh();
  }

  /// Submits the arrival form: server creates the lot + closes the job.
  Future<Map<String, dynamic>> complete({
    required String actualWeightKg,
    String? stateQuick,
    String? coldChainTempC,
    String? notes,
  }) async {
    final s = state.value;
    if (s == null) {
      throw StateError('No active job');
    }
    final svc = ref.read(collectionServiceProvider);
    await _pushPending();
    final result = await svc.completeJob(s.job.id, {
      'actualWeightKg': actualWeightKg,
      if (stateQuick != null) 'stateQuick': stateQuick,
      if (coldChainTempC != null) 'coldChainTempC': coldChainTempC,
      if (notes != null && notes.isNotEmpty) 'notes': notes,
      if (s.lastFix != null) 'gpsLat': s.lastFix!.latitude.toString(),
      if (s.lastFix != null) 'gpsLng': s.lastFix!.longitude.toString(),
    });

    // Stop streaming — the job is done.
    await _subscription?.cancel();
    _pushTimer?.cancel();

    // Refresh the queue so the completed job drops off the list.
    ref.invalidate(jobsViewModelProvider);
    return result;
  }

  Future<void> refresh() async {
    final cur = state.value;
    final id = cur?.job.id;
    if (id == null) return;
    final svc = ref.read(collectionServiceProvider);
    final raw = await svc.getJob(id);
    final job = CollectionJob.fromJson(raw);
    state = AsyncValue.data(cur!.copyWith(job: job));
  }
}
