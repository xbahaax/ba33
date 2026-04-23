import 'dart:typed_data';

enum TransportLane { normal, urgentStandard, urgentColdChain }

enum JobStatus { pending, accepted, inProgress, delivered, cancelled }

enum TripPhase { loading, inTransit, delivering, completed }

class TransportLot {
  TransportLot({
    required this.id,
    required this.qrCode,
    required this.sourceType,
    required this.declaredWeight,
    this.loadedWeight,
    this.deliveredWeight,
    this.isLoaded = false,
    this.isDelivered = false,
  });

  final String id;
  final String qrCode;
  final String sourceType; // 'C1', 'C2', 'C3'
  final double declaredWeight;
  double? loadedWeight;
  double? deliveredWeight;
  bool isLoaded;
  bool isDelivered;

  double get effectiveWeight => loadedWeight ?? declaredWeight;

  double? get weightDelta {
    if (loadedWeight == null || deliveredWeight == null) return null;
    return deliveredWeight! - loadedWeight!;
  }

  bool get hasMismatch {
    final delta = weightDelta;
    if (delta == null) return false;
    return delta.abs() > effectiveWeight * 0.02;
  }

  TransportLot copyWith({
    double? loadedWeight,
    double? deliveredWeight,
    bool? isLoaded,
    bool? isDelivered,
  }) {
    return TransportLot(
      id: id,
      qrCode: qrCode,
      sourceType: sourceType,
      declaredWeight: declaredWeight,
      loadedWeight: loadedWeight ?? this.loadedWeight,
      deliveredWeight: deliveredWeight ?? this.deliveredWeight,
      isLoaded: isLoaded ?? this.isLoaded,
      isDelivered: isDelivered ?? this.isDelivered,
    );
  }
}

class TransportJob {
  TransportJob({
    required this.id,
    required this.originName,
    required this.originType,
    required this.destinationName,
    required this.destinationType,
    required this.lane,
    required this.lots,
    required this.requestedAt,
    this.status = JobStatus.pending,
    this.slaDeadline,
    this.transporterId,
  });

  final String id;
  final String originName;
  final String originType;
  final String destinationName;
  final String destinationType;
  final TransportLane lane;
  JobStatus status;
  final List<TransportLot> lots;
  final DateTime requestedAt;
  final DateTime? slaDeadline;
  final String? transporterId;

  double get totalDeclaredWeight =>
      lots.fold(0.0, (sum, l) => sum + l.declaredWeight);

  double get totalLoadedWeight =>
      lots.fold(0.0, (sum, l) => sum + (l.loadedWeight ?? 0.0));

  double get totalDeliveredWeight =>
      lots.fold(0.0, (sum, l) => sum + (l.deliveredWeight ?? 0.0));

  int get lotsLoaded => lots.where((l) => l.isLoaded).length;
  int get lotsDelivered => lots.where((l) => l.isDelivered).length;
  bool get allLotsLoaded => lotsLoaded == lots.length;
  bool get allLotsDelivered => lotsDelivered == lots.length;
  bool get isUrgent => lane != TransportLane.normal;

  Duration? get slaRemaining {
    if (slaDeadline == null) return null;
    final remaining = slaDeadline!.difference(DateTime.now());
    return remaining.isNegative ? Duration.zero : remaining;
  }

  bool get isSlaBreached =>
      slaDeadline != null && DateTime.now().isAfter(slaDeadline!);

  bool get hasMismatch => lots.any((l) => l.hasMismatch);
}

class ActiveTripState {
  const ActiveTripState({
    required this.job,
    required this.phase,
    this.signatureBytes,
    this.receiverName,
  });

  final TransportJob job;
  final TripPhase phase;
  final Uint8List? signatureBytes;
  final String? receiverName;

  ActiveTripState copyWith({
    TransportJob? job,
    TripPhase? phase,
    Uint8List? signatureBytes,
    String? receiverName,
  }) {
    return ActiveTripState(
      job: job ?? this.job,
      phase: phase ?? this.phase,
      signatureBytes: signatureBytes ?? this.signatureBytes,
      receiverName: receiverName ?? this.receiverName,
    );
  }
}
