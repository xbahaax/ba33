import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'receipts_view_model.g.dart';

/// Fetches the shepherd's past declarations / receipts.
@riverpod
Future<List<Declaration>> receipts(ReceiptsRef ref) async {
  // TODO(BA33-024): fetch real receipts from API / local DB
  await Future<void>.delayed(const Duration(milliseconds: 500));

  // Mock data for development
  return [
    Declaration(
      id: 'shepherd-001-00001-X',
      shepherdId: 'shepherd-001',
      weightCategory: WeightCategory.smallPile,
      estimatedWeight: 15,
      status: DeclarationStatus.scheduledPickup,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      latitude: 36.7538,
      longitude: 3.0588,
      pickupScheduledAt: DateTime.now().add(const Duration(hours: 4)),
    ),
    Declaration(
      id: 'shepherd-001-00002-Y',
      shepherdId: 'shepherd-001',
      weightCategory: WeightCategory.oneBag,
      estimatedWeight: 5,
      status: DeclarationStatus.collected,
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      latitude: 36.7538,
      longitude: 3.0588,
      finalWeight: 4.8,
      priceEstimate: 2400,
    ),
    Declaration(
      id: 'shepherd-001-00003-Z',
      shepherdId: 'shepherd-001',
      weightCategory: WeightCategory.largePile,
      estimatedWeight: 55,
      status: DeclarationStatus.announced,
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      latitude: 36.7538,
      longitude: 3.0588,
    ),
  ];
}
