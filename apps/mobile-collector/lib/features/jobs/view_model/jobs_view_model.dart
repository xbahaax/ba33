import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../model/collection_job.dart';

part 'jobs_view_model.g.dart';

/// Lists collection jobs assigned to or open for the current collector. The
/// list is the collector's instruction queue — the depot/admin issues jobs,
/// the collector picks one and executes it.
@Riverpod(keepAlive: true)
class JobsViewModel extends _$JobsViewModel {
  @override
  Future<List<CollectionJob>> build() async {
    final user = ref.watch(authProvider);
    if (user == null) return const <CollectionJob>[];

    final svc = ref.read(collectionServiceProvider);
    final raw = await svc.listMyJobs();
    return raw
        .map((e) => CollectionJob.fromJson(e as Map<String, dynamic>))
        .where((j) => j.isOpenForCollector)
        .toList()
      ..sort((a, b) {
        // Urgent first, then earliest SLA, then oldest
        if (a.isUrgent != b.isUrgent) return a.isUrgent ? -1 : 1;
        final aSla = a.slaDeadline;
        final bSla = b.slaDeadline;
        if (aSla != null && bSla != null) return aSla.compareTo(bSla);
        if (aSla != null) return -1;
        if (bSla != null) return 1;
        return a.createdAt.compareTo(b.createdAt);
      });
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  Future<void> accept(String jobId) async {
    final svc = ref.read(collectionServiceProvider);
    await svc.acceptJob(jobId);
    await refresh();
  }
}
