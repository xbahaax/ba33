import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../features/auth/view_model/auth_view_model.dart';
import '../../../shared/providers/api_provider.dart';
import '../model/transport_job.dart';

part 'job_list_view_model.g.dart';

@Riverpod(keepAlive: true)
class JobList extends _$JobList {
  @override
  Future<List<TransportJob>> build() async {
    final auth = ref.watch(authStateProvider);
    final transportSvc = ref.read(transportServiceProvider);

    final raw = await transportSvc.listJobs(transporterId: auth.userId);
    return raw.map((e) {
      final j = e as Map<String, dynamic>;
      return _mapApiJob(j);
    }).toList();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  /// Maps the API response to the local TransportJob model.
  TransportJob _mapApiJob(Map<String, dynamic> j) {
    final lotsRaw = j['lots'] as List<dynamic>? ?? [];
    final lots = lotsRaw.map((l) {
      final lot = l as Map<String, dynamic>;
      return TransportLot(
        id: lot['id'] as String? ?? '',
        qrCode: lot['qrCode'] as String? ?? lot['id'] as String? ?? '',
        sourceType: lot['sourceType'] as String? ?? '',
        declaredWeight: (lot['declaredWeight'] as num?)?.toDouble() ?? 0.0,
        loadedWeight: (lot['loadedWeight'] as num?)?.toDouble(),
        deliveredWeight: (lot['deliveredWeight'] as num?)?.toDouble(),
        isLoaded: lot['isLoaded'] as bool? ?? false,
        isDelivered: lot['isDelivered'] as bool? ?? false,
      );
    }).toList();

    // Map lane string from API to enum
    TransportLane lane;
    switch (j['lane'] as String? ?? 'normal') {
      case 'urgentColdChain':
        lane = TransportLane.urgentColdChain;
      case 'urgentStandard':
        lane = TransportLane.urgentStandard;
      default:
        lane = TransportLane.normal;
    }

    // Map status string from API to enum
    JobStatus status;
    switch (j['status'] as String? ?? 'pending') {
      case 'accepted':
        status = JobStatus.accepted;
      case 'inProgress':
      case 'in_progress':
        status = JobStatus.inProgress;
      case 'delivered':
        status = JobStatus.delivered;
      case 'cancelled':
        status = JobStatus.cancelled;
      default:
        status = JobStatus.pending;
    }

    return TransportJob(
      id: j['id'] as String,
      originName: j['originName'] as String? ??
          j['originId'] as String? ??
          'Unknown',
      originType: j['originType'] as String? ?? 'depot',
      destinationName: j['destinationName'] as String? ??
          j['destinationId'] as String? ??
          'Unknown',
      destinationType: j['destinationType'] as String? ?? 'depot',
      lane: lane,
      status: status,
      lots: lots,
      requestedAt: j['requestedAt'] != null
          ? DateTime.parse(j['requestedAt'] as String)
          : DateTime.now(),
      slaDeadline: j['slaDeadline'] != null
          ? DateTime.parse(j['slaDeadline'] as String)
          : null,
      transporterId: j['transporterId'] as String?,
    );
  }
}
