import '../enums/declaration_status.dart';
import '../enums/weight_category.dart';

/// A shepherd's wool availability declaration (pre-lot).
///
/// Created when a shepherd announces wool is ready for pickup.
/// Stays open until a collector finalizes it into a real [Lot].
class Declaration {
  const Declaration({
    required this.id,
    required this.shepherdId,
    required this.weightCategory,
    required this.status,
    required this.createdAt,
    required this.latitude,
    required this.longitude,
    this.estimatedWeight,
    this.photoUrl,
    this.notes,
    this.pickupScheduledAt,
    this.collectorId,
    this.finalWeight,
    this.priceEstimate,
  });

  final String id;
  final String shepherdId;
  final WeightCategory weightCategory;
  final double? estimatedWeight;
  final DeclarationStatus status;
  final DateTime createdAt;
  final double latitude;
  final double longitude;
  final String? photoUrl;
  final String? notes;
  final DateTime? pickupScheduledAt;
  final String? collectorId;
  final double? finalWeight;
  final double? priceEstimate;

  Declaration copyWith({
    String? id,
    String? shepherdId,
    WeightCategory? weightCategory,
    double? estimatedWeight,
    DeclarationStatus? status,
    DateTime? createdAt,
    double? latitude,
    double? longitude,
    String? photoUrl,
    String? notes,
    DateTime? pickupScheduledAt,
    String? collectorId,
    double? finalWeight,
    double? priceEstimate,
  }) {
    return Declaration(
      id: id ?? this.id,
      shepherdId: shepherdId ?? this.shepherdId,
      weightCategory: weightCategory ?? this.weightCategory,
      estimatedWeight: estimatedWeight ?? this.estimatedWeight,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      photoUrl: photoUrl ?? this.photoUrl,
      notes: notes ?? this.notes,
      pickupScheduledAt: pickupScheduledAt ?? this.pickupScheduledAt,
      collectorId: collectorId ?? this.collectorId,
      finalWeight: finalWeight ?? this.finalWeight,
      priceEstimate: priceEstimate ?? this.priceEstimate,
    );
  }
}
