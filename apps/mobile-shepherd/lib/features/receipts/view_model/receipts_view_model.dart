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
      return Declaration(
        id: map['id'] as String? ?? '',
        shepherdId: map['sourceId'] as String? ?? '',
        weightCategory: WeightCategory.custom,
        estimatedWeight:
            double.tryParse(map['estimatedWeightKg']?.toString() ?? ''),
        status: _mapStatus(map['status'] as String? ?? 'pending'),
        createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ??
            DateTime.now(),
        latitude: double.tryParse(map['latitude']?.toString() ?? '') ?? 0,
        longitude: double.tryParse(map['longitude']?.toString() ?? '') ?? 0,
        notes: map['notes'] as String?,
      );
    }).toList();
  } catch (e) {
    return [];
  }
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
