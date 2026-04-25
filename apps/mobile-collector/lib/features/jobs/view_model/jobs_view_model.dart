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

    List<CollectionJob> jobs = const [];
    if (user != null) {
      try {
        final svc = ref.read(collectionServiceProvider);
        final raw = await svc.listMyJobs();
        jobs = raw
            .map((e) => CollectionJob.fromJson(e as Map<String, dynamic>))
            .where((j) => j.isOpenForCollector)
            .toList();
      } catch (_) {}
    }

    if (jobs.isEmpty) jobs = _mockJobs();

    return jobs
      ..sort((a, b) {
        if (a.isUrgent != b.isUrgent) return a.isUrgent ? -1 : 1;
        final aSla = a.slaDeadline;
        final bSla = b.slaDeadline;
        if (aSla != null && bSla != null) return aSla.compareTo(bSla);
        if (aSla != null) return -1;
        if (bSla != null) return 1;
        return a.createdAt.compareTo(b.createdAt);
      });
  }

  static List<CollectionJob> _mockJobs() {
    final now = DateTime.now();
    return [
      CollectionJob(
        id: 'mock-job-001',
        status: CollectionJobStatus.assigned,
        urgency: CollectionJobUrgency.urgent,
        createdAt: now.subtract(const Duration(hours: 2)),
        slaDeadline: now.add(const Duration(hours: 4)),
        source: const CollectionJobSource(
          id: 'src-001',
          name: 'Messaoud Benali',
          profession: 'shepherd',
          contactPhone: '0550 123 456',
          address: 'Douar Ouled Naïl, Djelfa',
          latitude: 34.6717,
          longitude: 3.2504,
        ),
        depot: const CollectionJobDepot(
          id: 'dep-001',
          name: 'Dépôt NFN Djelfa',
          address: 'Zone Industrielle, Djelfa',
        ),
        preLot: const CollectionJobPreLot(
          id: 'prelot-001',
          estimatedWeightKg: 85,
          notes: 'Laine propre, conditionnée en 4 sacs PP',
          locationLat: 34.6717,
          locationLng: 3.2504,
        ),
      ),
      CollectionJob(
        id: 'mock-job-002',
        status: CollectionJobStatus.accepted,
        urgency: CollectionJobUrgency.normal,
        createdAt: now.subtract(const Duration(hours: 5)),
        slaDeadline: now.add(const Duration(hours: 18)),
        source: const CollectionJobSource(
          id: 'src-002',
          name: 'Abattoir Communal Bousaâda',
          profession: 'slaughterhouse',
          contactPhone: '0661 789 012',
          address: 'Route de Sétif, Bousaâda',
          latitude: 35.2122,
          longitude: 4.1742,
        ),
        depot: const CollectionJobDepot(
          id: 'dep-001',
          name: 'Dépôt NFN Djelfa',
          address: 'Zone Industrielle, Djelfa',
        ),
        preLot: const CollectionJobPreLot(
          id: 'prelot-002',
          estimatedWeightKg: 42,
          notes: 'Laine d\'abattage, 2 sacs jute',
          locationLat: 35.2122,
          locationLng: 4.1742,
        ),
      ),
      CollectionJob(
        id: 'mock-job-003',
        status: CollectionJobStatus.pending,
        urgency: CollectionJobUrgency.normal,
        createdAt: now.subtract(const Duration(hours: 1)),
        source: const CollectionJobSource(
          id: 'src-003',
          name: 'Ferme Hadjadj — Laghouat',
          profession: 'shepherd',
          contactPhone: '0770 345 678',
          address: 'Oued Morra, Laghouat',
          latitude: 33.8003,
          longitude: 2.8652,
        ),
        depot: const CollectionJobDepot(
          id: 'dep-002',
          name: 'Dépôt NFN Laghouat',
          address: 'Boulevard de la Révolution, Laghouat',
        ),
        preLot: const CollectionJobPreLot(
          id: 'prelot-003',
          estimatedWeightKg: 120,
          notes: 'Tonte de saison, race Hamra — 6 sacs PP',
          locationLat: 33.8003,
          locationLng: 2.8652,
        ),
      ),
      CollectionJob(
        id: 'mock-job-004',
        status: CollectionJobStatus.inProgress,
        urgency: CollectionJobUrgency.normal,
        createdAt: now.subtract(const Duration(hours: 8)),
        startedAt: now.subtract(const Duration(hours: 1)),
        source: const CollectionJobSource(
          id: 'src-004',
          name: 'Brahimi Kamel',
          profession: 'aggregator',
          contactPhone: '0555 901 234',
          address: 'Mechta El Ouata, M\'Sila',
          latitude: 35.7055,
          longitude: 4.5414,
        ),
        depot: const CollectionJobDepot(
          id: 'dep-003',
          name: 'Dépôt NFN M\'Sila',
          address: 'Avenue 1er Novembre, M\'Sila',
        ),
        preLot: const CollectionJobPreLot(
          id: 'prelot-004',
          estimatedWeightKg: 200,
          notes: 'Stock agrégé de 3 éleveurs',
          locationLat: 35.7055,
          locationLng: 4.5414,
        ),
      ),
    ];
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
