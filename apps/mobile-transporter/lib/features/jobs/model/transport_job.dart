import 'dart:convert';
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

  Map<String, dynamic> toJson() => {
        'temperature': temperature,
        'recordedAt': recordedAt.toIso8601String(),
      };

  factory TemperatureReading.fromJson(Map<String, dynamic> j) =>
      TemperatureReading(
        temperature: (j['temperature'] as num).toDouble(),
        recordedAt: DateTime.parse(j['recordedAt'] as String),
      );
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
  }) =>
      TransportLot(
        id: id,
        qrCode: qrCode,
        sourceType: sourceType,
        declaredWeight: declaredWeight,
        loadedWeight: loadedWeight ?? this.loadedWeight,
        deliveredWeight: deliveredWeight ?? this.deliveredWeight,
        isLoaded: isLoaded ?? this.isLoaded,
        isDelivered: isDelivered ?? this.isDelivered,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'qrCode': qrCode,
        'sourceType': sourceType,
        'declaredWeight': declaredWeight,
        'loadedWeight': loadedWeight,
        'deliveredWeight': deliveredWeight,
        'isLoaded': isLoaded,
        'isDelivered': isDelivered,
      };

  factory TransportLot.fromJson(Map<String, dynamic> j) => TransportLot(
        id: j['id'] as String,
        qrCode: j['qrCode'] as String,
        sourceType: j['sourceType'] as String,
        declaredWeight: (j['declaredWeight'] as num).toDouble(),
        loadedWeight: (j['loadedWeight'] as num?)?.toDouble(),
        deliveredWeight: (j['deliveredWeight'] as num?)?.toDouble(),
        isLoaded: j['isLoaded'] as bool? ?? false,
        isDelivered: j['isDelivered'] as bool? ?? false,
      );
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
      lots.fold(0.0, (s, l) => s + l.declaredWeight);
  double get totalLoadedWeight =>
      lots.fold(0.0, (s, l) => s + (l.loadedWeight ?? 0.0));
  double get totalDeliveredWeight =>
      lots.fold(0.0, (s, l) => s + (l.deliveredWeight ?? 0.0));

  int get lotsLoaded => lots.where((l) => l.isLoaded).length;
  int get lotsDelivered => lots.where((l) => l.isDelivered).length;
  bool get allLotsLoaded => lotsLoaded == lots.length;
  bool get allLotsDelivered => lotsDelivered == lots.length;
  bool get isUrgent => lane != TransportLane.normal;

  Duration? get slaRemaining {
    if (slaDeadline == null) return null;
    final r = slaDeadline!.difference(DateTime.now());
    return r.isNegative ? Duration.zero : r;
  }

  bool get isSlaBreached =>
      slaDeadline != null && DateTime.now().isAfter(slaDeadline!);

  bool get hasMismatch => lots.any((l) => l.hasMismatch);

  Map<String, dynamic> toJson() => {
        'id': id,
        'originName': originName,
        'originType': originType,
        'destinationName': destinationName,
        'destinationType': destinationType,
        'lane': lane.name,
        'status': status.name,
        'lots': lots.map((l) => l.toJson()).toList(),
        'requestedAt': requestedAt.toIso8601String(),
        'slaDeadline': slaDeadline?.toIso8601String(),
        'transporterId': transporterId,
      };

  factory TransportJob.fromJson(Map<String, dynamic> j) => TransportJob(
        id: j['id'] as String,
        originName: j['originName'] as String,
        originType: j['originType'] as String,
        destinationName: j['destinationName'] as String,
        destinationType: j['destinationType'] as String,
        lane: TransportLane.values.byName(j['lane'] as String),
        status: JobStatus.values.byName(j['status'] as String),
        lots: (j['lots'] as List)
            .map((e) => TransportLot.fromJson(e as Map<String, dynamic>))
            .toList(),
        requestedAt: DateTime.parse(j['requestedAt'] as String),
        slaDeadline: j['slaDeadline'] != null
            ? DateTime.parse(j['slaDeadline'] as String)
            : null,
        transporterId: j['transporterId'] as String?,
      );
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

class GpsPoint {
  const GpsPoint({
    required this.lat,
    required this.lng,
    required this.recordedAt,
    this.speedMps,
    this.accuracy,
  });

  final double lat;
  final double lng;
  final DateTime recordedAt;
  final double? speedMps;
  final double? accuracy;

  String get speedLabel {
    if (speedMps == null || speedMps! < 0) return '— km/h';
    return '${(speedMps! * 3.6).toStringAsFixed(0)} km/h';
  }
}

class ActiveTripState {
  const ActiveTripState({
    required this.job,
    required this.phase,
    this.signatureBytes,
    this.receiverName,
    this.temperatureReadings = const [],
    this.gpsPoints = const [],
    this.pendingSyncCount = 0,
  });

  final TransportJob job;
  final TripPhase phase;
  final Uint8List? signatureBytes;
  final String? receiverName;
  final List<TemperatureReading> temperatureReadings;
  final List<GpsPoint> gpsPoints;
  final int pendingSyncCount;

  double? get latestTemperature =>
      temperatureReadings.isEmpty ? null : temperatureReadings.last.temperature;
  bool get hasTempAlert => temperatureReadings.any((r) => r.isAlert);
  GpsPoint? get lastGpsPoint =>
      gpsPoints.isEmpty ? null : gpsPoints.last;

  ActiveTripState copyWith({
    TransportJob? job,
    TripPhase? phase,
    Uint8List? signatureBytes,
    String? receiverName,
    List<TemperatureReading>? temperatureReadings,
    List<GpsPoint>? gpsPoints,
    int? pendingSyncCount,
  }) =>
      ActiveTripState(
        job: job ?? this.job,
        phase: phase ?? this.phase,
        signatureBytes: signatureBytes ?? this.signatureBytes,
        receiverName: receiverName ?? this.receiverName,
        temperatureReadings: temperatureReadings ?? this.temperatureReadings,
        gpsPoints: gpsPoints ?? this.gpsPoints,
        pendingSyncCount: pendingSyncCount ?? this.pendingSyncCount,
      );

  // Serialise to JSON for Drift storage
  String toJsonString() => jsonEncode({
        'job': job.toJson(),
        'phase': phase.name,
        'receiverName': receiverName,
        'temperatureReadings':
            temperatureReadings.map((r) => r.toJson()).toList(),
        'pendingSyncCount': pendingSyncCount,
      });

  factory ActiveTripState.fromJsonString(String json,
      {Uint8List? signatureBytes, List<GpsPoint>? gpsPoints}) {
    final m = jsonDecode(json) as Map<String, dynamic>;
    return ActiveTripState(
      job: TransportJob.fromJson(m['job'] as Map<String, dynamic>),
      phase: TripPhase.values.byName(m['phase'] as String),
      receiverName: m['receiverName'] as String?,
      temperatureReadings: (m['temperatureReadings'] as List)
          .map((e) =>
              TemperatureReading.fromJson(e as Map<String, dynamic>))
          .toList(),
      signatureBytes: signatureBytes,
      gpsPoints: gpsPoints ?? [],
      pendingSyncCount: m['pendingSyncCount'] as int? ?? 0,
    );
  }
}
