import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

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
    // TODO(BA33-021): Fetch from API
    await Future<void>.delayed(const Duration(milliseconds: 500));
    state = AsyncValue.data([
      Declaration(
        id: 'DCL-001',
        shepherdId: 'SH-042',
        weightCategory: WeightCategory.smallPile,
        estimatedWeight: 15,
        status: DeclarationStatus.announced,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        latitude: 34.67,
        longitude: 3.25,
        notes: 'Near the main road, white bags',
      ),
      Declaration(
        id: 'DCL-002',
        shepherdId: 'SH-108',
        weightCategory: WeightCategory.largePile,
        estimatedWeight: 55,
        status: DeclarationStatus.scheduledPickup,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
        latitude: 34.71,
        longitude: 3.19,
        collectorId: 'COL-001',
        pickupScheduledAt: DateTime.now().add(const Duration(hours: 2)),
      ),
      Declaration(
        id: 'DCL-003',
        shepherdId: 'SH-015',
        weightCategory: WeightCategory.oneBag,
        estimatedWeight: 5,
        status: DeclarationStatus.announced,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        latitude: 34.65,
        longitude: 3.30,
        photoUrl: 'placeholder',
      ),
    ]);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _loadDeclarations();
  }

  void schedulePickup(String declarationId) {
    state.whenData((declarations) {
      final updated = declarations.map((d) {
        if (d.id == declarationId) {
          return d.copyWith(
            status: DeclarationStatus.scheduledPickup,
            collectorId: 'COL-001',
            pickupScheduledAt: DateTime.now().add(const Duration(hours: 1)),
          );
        }
        return d;
      }).toList();
      state = AsyncValue.data(updated);
    });
  }
}
