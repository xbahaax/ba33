import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/auth_provider.dart';

part 'receipts_view_model.g.dart';

/// Fetches the shepherd's past declarations / receipts.
@riverpod
Future<List<Declaration>> receipts(ReceiptsRef ref) async {
  final user = ref.watch(authProvider);
  if (user == null) return [];

  final collectionService = ref.watch(collectionServiceProvider);

  try {
    final data = await collectionService.listPreLots(regionId: user.regionId);
    return data.map((item) {
      final map = item as Map<String, dynamic>;
      final weight =
          double.tryParse(map['estimatedWeightKg']?.toString() ?? '');
      return Declaration(
        id: map['id'] as String? ?? '',
        shepherdId: map['sourceId'] as String? ?? '',
        weightCategory: _inferCategory(weight),
        estimatedWeight: weight,
        status: _mapStatus(map['status'] as String? ?? 'pending'),
        createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ??
            DateTime.now(),
        latitude:
            double.tryParse(map['locationLat']?.toString() ?? '') ?? 0,
        longitude:
            double.tryParse(map['locationLng']?.toString() ?? '') ?? 0,
        notes: map['notes'] as String?,
      );
    }).toList();
  } catch (e) {
    return [];
  }
}

WeightCategory _inferCategory(double? weight) {
  if (weight == null) return WeightCategory.custom;
  if (weight <= 3) return WeightCategory.oneSheep;
  if (weight <= 7) return WeightCategory.oneBag;
  if (weight <= 30) return WeightCategory.smallPile;
  if (weight > 30) return WeightCategory.largePile;
  return WeightCategory.custom;
}

DeclarationStatus _mapStatus(String status) {
  switch (status) {
    case 'pending':
      return DeclarationStatus.announced;
    case 'assigned':
      return DeclarationStatus.scheduledPickup;
    case 'completed':
      return DeclarationStatus.collected;
    case 'cancelled':
      return DeclarationStatus.cancelled;
    default:
      return DeclarationStatus.announced;
  }
}
