enum CollectionJobStatus {
  pending,
  assigned,
  accepted,
  inProgress,
  arrived,
  completed,
  cancelled,
}

enum CollectionJobUrgency { normal, urgent }

CollectionJobStatus _statusFromString(String? raw) {
  switch (raw) {
    case 'assigned':
      return CollectionJobStatus.assigned;
    case 'accepted':
      return CollectionJobStatus.accepted;
    case 'in_progress':
    case 'inProgress':
      return CollectionJobStatus.inProgress;
    case 'arrived':
      return CollectionJobStatus.arrived;
    case 'completed':
      return CollectionJobStatus.completed;
    case 'cancelled':
      return CollectionJobStatus.cancelled;
    default:
      return CollectionJobStatus.pending;
  }
}

CollectionJobUrgency _urgencyFromString(String? raw) {
  return raw == 'urgent'
      ? CollectionJobUrgency.urgent
      : CollectionJobUrgency.normal;
}

class CollectionJobSource {
  const CollectionJobSource({
    required this.id,
    required this.name,
    this.profession,
    this.contactPhone,
    this.address,
    this.latitude,
    this.longitude,
  });

  final String id;
  final String name;
  final String? profession;
  final String? contactPhone;
  final String? address;
  final double? latitude;
  final double? longitude;

  factory CollectionJobSource.fromJson(Map<String, dynamic> j) {
    return CollectionJobSource(
      id: j['id'] as String,
      name: j['name'] as String? ?? 'Source',
      profession: j['profession'] as String?,
      contactPhone: j['contactPhone'] as String?,
      address: j['address'] as String?,
      latitude: _toDouble(j['latitude']),
      longitude: _toDouble(j['longitude']),
    );
  }
}

class CollectionJobDepot {
  const CollectionJobDepot({
    required this.id,
    required this.name,
    this.address,
  });

  final String id;
  final String name;
  final String? address;

  factory CollectionJobDepot.fromJson(Map<String, dynamic> j) {
    return CollectionJobDepot(
      id: j['id'] as String,
      name: j['name'] as String? ?? 'Depot',
      address: j['address'] as String?,
    );
  }
}

class CollectionJobPreLot {
  const CollectionJobPreLot({
    required this.id,
    required this.estimatedWeightKg,
    this.notes,
    this.locationLat,
    this.locationLng,
  });

  final String id;
  final double estimatedWeightKg;
  final String? notes;
  final double? locationLat;
  final double? locationLng;

  factory CollectionJobPreLot.fromJson(Map<String, dynamic> j) {
    return CollectionJobPreLot(
      id: j['id'] as String,
      estimatedWeightKg: _toDouble(j['estimatedWeightKg']) ?? 0,
      notes: j['notes'] as String?,
      locationLat: _toDouble(j['locationLat']),
      locationLng: _toDouble(j['locationLng']),
    );
  }
}

class CollectionJob {
  const CollectionJob({
    required this.id,
    required this.status,
    required this.urgency,
    required this.source,
    required this.depot,
    required this.preLot,
    required this.createdAt,
    this.originLat,
    this.originLng,
    this.collectorId,
    this.startedAt,
    this.arrivedAt,
    this.completedAt,
    this.slaDeadline,
    this.lotId,
  });

  final String id;
  final CollectionJobStatus status;
  final CollectionJobUrgency urgency;
  final CollectionJobSource? source;
  final CollectionJobDepot? depot;
  final CollectionJobPreLot? preLot;
  final DateTime createdAt;
  final double? originLat;
  final double? originLng;
  final String? collectorId;
  final DateTime? startedAt;
  final DateTime? arrivedAt;
  final DateTime? completedAt;
  final DateTime? slaDeadline;
  final String? lotId;

  bool get isUrgent => urgency == CollectionJobUrgency.urgent;

  /// Source coordinates — prefer the pre-lot location, fall back to job origin
  /// then the source's registered address coordinates.
  double? get pickupLat =>
      preLot?.locationLat ?? originLat ?? source?.latitude;
  double? get pickupLng =>
      preLot?.locationLng ?? originLng ?? source?.longitude;

  Duration? get slaRemaining {
    if (slaDeadline == null) return null;
    final r = slaDeadline!.difference(DateTime.now());
    return r.isNegative ? Duration.zero : r;
  }

  bool get isOpenForCollector =>
      status == CollectionJobStatus.pending ||
      status == CollectionJobStatus.assigned ||
      status == CollectionJobStatus.accepted ||
      status == CollectionJobStatus.inProgress ||
      status == CollectionJobStatus.arrived;

  factory CollectionJob.fromJson(Map<String, dynamic> j) {
    return CollectionJob(
      id: j['id'] as String,
      status: _statusFromString(j['status'] as String?),
      urgency: _urgencyFromString(j['urgency'] as String?),
      source: j['source'] != null
          ? CollectionJobSource.fromJson(j['source'] as Map<String, dynamic>)
          : null,
      depot: j['depot'] != null
          ? CollectionJobDepot.fromJson(j['depot'] as Map<String, dynamic>)
          : null,
      preLot: j['preLot'] != null
          ? CollectionJobPreLot.fromJson(j['preLot'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      originLat: _toDouble(j['originLat']),
      originLng: _toDouble(j['originLng']),
      collectorId: j['collectorId'] as String?,
      startedAt: _toDateTime(j['startedAt']),
      arrivedAt: _toDateTime(j['arrivedAt']),
      completedAt: _toDateTime(j['completedAt']),
      slaDeadline: _toDateTime(j['slaDeadline']),
      lotId: j['lotId'] as String?,
    );
  }
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

DateTime? _toDateTime(dynamic v) {
  if (v == null) return null;
  return DateTime.tryParse(v.toString());
}
