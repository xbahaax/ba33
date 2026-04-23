import '../enums/lot_status.dart';
import '../enums/source_type.dart';
import '../enums/wool_state.dart';

/// A wool lot — the core entity in the NFN chain.
/// Framework-free: no Flutter, no Riverpod, no Drift imports.
class Lot {
  const Lot({
    required this.id,
    required this.collectorId,
    required this.sourceType,
    required this.weight,
    required this.woolState,
    required this.status,
    required this.createdAt,
    required this.latitude,
    required this.longitude,
    this.sourceId,
    this.isUrgent = false,
    this.notes,
    this.photoUrls = const [],
    this.voiceNoteUrl,
    this.signatureUrl,
    this.updatedAt,
  });

  final String id;
  final String collectorId;
  final SourceType sourceType;
  final double weight;
  final WoolState woolState;
  final LotStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final double latitude;
  final double longitude;
  final String? sourceId;
  final bool isUrgent;
  final String? notes;
  final List<String> photoUrls;
  final String? voiceNoteUrl;
  final String? signatureUrl;

  Lot copyWith({
    String? id,
    String? collectorId,
    SourceType? sourceType,
    double? weight,
    WoolState? woolState,
    LotStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    double? latitude,
    double? longitude,
    String? sourceId,
    bool? isUrgent,
    String? notes,
    List<String>? photoUrls,
    String? voiceNoteUrl,
    String? signatureUrl,
  }) {
    return Lot(
      id: id ?? this.id,
      collectorId: collectorId ?? this.collectorId,
      sourceType: sourceType ?? this.sourceType,
      weight: weight ?? this.weight,
      woolState: woolState ?? this.woolState,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      sourceId: sourceId ?? this.sourceId,
      isUrgent: isUrgent ?? this.isUrgent,
      notes: notes ?? this.notes,
      photoUrls: photoUrls ?? this.photoUrls,
      voiceNoteUrl: voiceNoteUrl ?? this.voiceNoteUrl,
      signatureUrl: signatureUrl ?? this.signatureUrl,
    );
  }
}
