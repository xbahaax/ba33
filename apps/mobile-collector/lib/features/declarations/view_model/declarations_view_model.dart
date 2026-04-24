import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/auth_provider.dart';

part 'declarations_view_model.g.dart';

/// Manages the list of shepherd declarations (pickup requests).
@Riverpod(keepAlive: true)
class DeclarationsViewModel extends _$DeclarationsViewModel {
  @override
  AsyncValue<List<Declaration>> build() {
    _loadDeclarations();
    return const AsyncValue.loading();
  }

  Future<void> _loadDeclarations() async {
    final user = ref.read(authProvider);
    if (user == null) {
      state = const AsyncValue.data([]);
      return;
    }

    try {
      final collectionService = ref.read(collectionServiceProvider);
      final data =
          await collectionService.listPreLots(regionId: user.regionId);
      final declarations = data.map((item) {
        final map = item as Map<String, dynamic>;
        return Declaration(
          id: map['id'] as String? ?? '',
          shepherdId: map['sourceId'] as String? ?? '',
          weightCategory: WeightCategory.custom,
          estimatedWeight:
              double.tryParse(map['estimatedWeightKg']?.toString() ?? ''),
          status: _mapStatus(map['status'] as String?),
          createdAt:
              DateTime.tryParse(map['createdAt']?.toString() ?? '') ??
                  DateTime.now(),
          latitude:
              double.tryParse(map['latitude']?.toString() ?? '0') ?? 0,
          longitude:
              double.tryParse(map['longitude']?.toString() ?? '0') ?? 0,
          notes: map['notes'] as String?,
        );
      }).toList();
      state = AsyncValue.data(declarations);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _loadDeclarations();
  }

  Future<void> schedulePickup(String declarationId) async {
    final user = ref.read(authProvider);
    if (user == null) return;

    final previous = state;
    try {
      final collectionService = ref.read(collectionServiceProvider);
      await collectionService.assignPreLot(declarationId, {
        'collectorId': user.id,
        'scheduledAt': DateTime.now()
            .add(const Duration(hours: 1))
            .toIso8601String(),
      });
      await refresh();
    } catch (e, st) {
      state = previous;
      rethrow;
    }
  }

  static DeclarationStatus _mapStatus(String? status) {
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
}
