import 'dart:typed_data';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../jobs/model/transport_job.dart';

part 'active_trip_view_model.g.dart';

@riverpod
class ActiveTrip extends _$ActiveTrip {
  @override
  ActiveTripState? build() => null;

  void startJob(TransportJob job) {
    final updatedJob = TransportJob(
      id: job.id,
      originName: job.originName,
      originType: job.originType,
      destinationName: job.destinationName,
      destinationType: job.destinationType,
      lane: job.lane,
      status: JobStatus.accepted,
      requestedAt: job.requestedAt,
      slaDeadline: job.slaDeadline,
      lots: job.lots.map((l) => TransportLot(
            id: l.id,
            qrCode: l.qrCode,
            sourceType: l.sourceType,
            declaredWeight: l.declaredWeight,
          )).toList(),
    );
    state = ActiveTripState(job: updatedJob, phase: TripPhase.loading);
  }

  void loadLot(String qrCode, double confirmedWeight) {
    if (state == null) return;
    final lots = state!.job.lots.map((l) {
      if (l.qrCode == qrCode) {
        return l.copyWith(loadedWeight: confirmedWeight, isLoaded: true);
      }
      return l;
    }).toList();

    final updatedJob = _cloneJob(state!.job, lots: lots);
    state = state!.copyWith(job: updatedJob);
  }

  void startTrip() {
    if (state == null) return;
    state = state!.copyWith(phase: TripPhase.inTransit);
  }

  void startDelivering() {
    if (state == null) return;
    state = state!.copyWith(phase: TripPhase.delivering);
  }

  void deliverLot(String qrCode, double confirmedWeight) {
    if (state == null) return;
    final lots = state!.job.lots.map((l) {
      if (l.qrCode == qrCode) {
        return l.copyWith(deliveredWeight: confirmedWeight, isDelivered: true);
      }
      return l;
    }).toList();

    final updatedJob = _cloneJob(state!.job, lots: lots);
    state = state!.copyWith(job: updatedJob);
  }

  void saveSignature(Uint8List bytes, String receiverName) {
    if (state == null) return;
    state = state!.copyWith(
      signatureBytes: bytes,
      receiverName: receiverName,
    );
  }

  void completeDelivery() {
    if (state == null) return;
    state = state!.copyWith(phase: TripPhase.completed);
  }

  void reset() {
    state = null;
  }

  TransportJob _cloneJob(TransportJob job, {List<TransportLot>? lots}) {
    return TransportJob(
      id: job.id,
      originName: job.originName,
      originType: job.originType,
      destinationName: job.destinationName,
      destinationType: job.destinationType,
      lane: job.lane,
      status: job.status,
      requestedAt: job.requestedAt,
      slaDeadline: job.slaDeadline,
      lots: lots ?? job.lots,
    );
  }
}
