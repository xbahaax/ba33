import 'dart:typed_data';

enum TransportLane { normal, urgentStandard, urgentColdChain }

enum JobStatus { pending, accepted, inProgress, delivered, cancelled }

enum TripPhase { loading, inTransit, delivering, completed }

class TemperatureReading {
  const TemperatureReading({
    required this.temperature,
    required this.recordedAt,
  });

  final double temperature;
  final DateTime recordedAt;

  static const double coldChainMax = 4.0;

  bool get isAlert => temperature > coldChainMax;
}

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
  final String sourceType;
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

class A1Alert {
  const A1Alert({
    required this.id,
    required this.depotName,
    required this.depotRegion,
    required this.lotsCount,
    required this.totalWeight,
    required this.firedAt,
    required this.slaDeadline,
    required this.triggerReason,
  });

  final String id;
  final String depotName;
  final String depotRegion;
  final int lotsCount;
  final double totalWeight;
  final DateTime firedAt;
  final DateTime slaDeadline;
  final String triggerReason;

  Duration get slaRemaining {
    final r = slaDeadline.difference(DateTime.now());
    return r.isNegative ? Duration.zero : r;
  }
}

class ActiveTripState {
  const ActiveTripState({
    required this.job,
    required this.phase,
    this.signatureBytes,
    this.receiverName,
    this.temperatureReadings = const [],
  });

  final TransportJob job;
  final TripPhase phase;
  final Uint8List? signatureBytes;
  final String? receiverName;
  final List<TemperatureReading> temperatureReadings;

  double? get latestTemperature =>
      temperatureReadings.isEmpty ? null : temperatureReadings.last.temperature;

  bool get hasTempAlert => temperatureReadings.any((r) => r.isAlert);

  ActiveTripState copyWith({
    TransportJob? job,
    TripPhase? phase,
    Uint8List? signatureBytes,
    String? receiverName,
    List<TemperatureReading>? temperatureReadings,
  }) {
    return ActiveTripState(
      job: job ?? this.job,
      phase: phase ?? this.phase,
      signatureBytes: signatureBytes ?? this.signatureBytes,
      receiverName: receiverName ?? this.receiverName,
      temperatureReadings: temperatureReadings ?? this.temperatureReadings,
    );
  }
}
