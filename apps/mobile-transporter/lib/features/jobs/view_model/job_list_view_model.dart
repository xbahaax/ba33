import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../model/transport_job.dart';

part 'job_list_view_model.g.dart';

@riverpod
class JobList extends _$JobList {
  @override
  Future<List<TransportJob>> build() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return _mockJobs();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  List<TransportJob> _mockJobs() {
    final now = DateTime.now();
    return [
      TransportJob(
        id: 'TJ-C2-ALG-00001',
        originName: 'Dépôt Alger Nord',
        originType: 'depot',
        destinationName: 'Laverie Blida',
        destinationType: 'laverie',
        lane: TransportLane.urgentColdChain,
        status: JobStatus.pending,
        requestedAt: now.subtract(const Duration(hours: 2)),
        slaDeadline: now.add(const Duration(hours: 1, minutes: 47)),
        lots: [
          TransportLot(
            id: 'L-C2-ALG-00042',
            qrCode: 'C2-00042-X7K',
            sourceType: 'C2',
            declaredWeight: 42.5,
          ),
          TransportLot(
            id: 'L-C2-ALG-00043',
            qrCode: 'C2-00043-Y2M',
            sourceType: 'C2',
            declaredWeight: 38.0,
          ),
          TransportLot(
            id: 'L-C2-ALG-00044',
            qrCode: 'C2-00044-Z9P',
            sourceType: 'C2',
            declaredWeight: 44.0,
          ),
        ],
      ),
      TransportJob(
        id: 'TJ-C1-SET-00023',
        originName: 'Dépôt Sétif',
        originType: 'depot',
        destinationName: 'Laverie Constantine',
        destinationType: 'laverie',
        lane: TransportLane.normal,
        status: JobStatus.pending,
        requestedAt: now.subtract(const Duration(hours: 5)),
        lots: [
          TransportLot(
            id: 'L-C1-SET-00102',
            qrCode: 'C1-00102-A4B',
            sourceType: 'C1',
            declaredWeight: 55.0,
          ),
          TransportLot(
            id: 'L-C1-SET-00103',
            qrCode: 'C1-00103-C8D',
            sourceType: 'C1',
            declaredWeight: 62.5,
          ),
          TransportLot(
            id: 'L-C1-SET-00104',
            qrCode: 'C1-00104-E2F',
            sourceType: 'C1',
            declaredWeight: 48.0,
          ),
          TransportLot(
            id: 'L-C1-SET-00105',
            qrCode: 'C1-00105-G6H',
            sourceType: 'C1',
            declaredWeight: 71.5,
          ),
          TransportLot(
            id: 'L-C1-SET-00106',
            qrCode: 'C1-00106-I1J',
            sourceType: 'C1',
            declaredWeight: 50.0,
          ),
        ],
      ),
      TransportJob(
        id: 'TJ-C1-ORA-00031',
        originName: 'Coopérative Mascara',
        originType: 'source',
        destinationName: 'Dépôt Oran',
        destinationType: 'depot',
        lane: TransportLane.normal,
        status: JobStatus.pending,
        requestedAt: now.subtract(const Duration(hours: 1)),
        lots: [
          TransportLot(
            id: 'L-C3-ORA-00201',
            qrCode: 'C3-00201-K3L',
            sourceType: 'C3',
            declaredWeight: 120.0,
          ),
          TransportLot(
            id: 'L-C3-ORA-00202',
            qrCode: 'C3-00202-M7N',
            sourceType: 'C3',
            declaredWeight: 98.5,
          ),
        ],
      ),
    ];
  }
}
