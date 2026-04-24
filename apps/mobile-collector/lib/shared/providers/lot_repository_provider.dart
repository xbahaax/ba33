import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'api_provider.dart';
import 'auth_provider.dart';

part 'lot_repository_provider.g.dart';

@Riverpod(keepAlive: true)
class LotRepository extends _$LotRepository {
  @override
  List<Lot> build() {
    _fetchLots();
    return [];
  }

  Future<void> _fetchLots() async {
    final user = ref.read(authProvider);
    if (user == null) return;

    try {
      final lotsService = ref.read(lotsServiceProvider);
      final data = await lotsService.listLots(collectorId: user.id);
      final lots = data.map((item) {
        final map = item as Map<String, dynamic>;
        return Lot(
          id: map['id'] as String? ?? '',
          collectorId: map['collectorId'] as String? ?? user.id,
          sourceType: _mapSourceType(map['sourceType'] as String?),
          weight: double.tryParse(
                  map['actualWeightKg']?.toString() ??
                      map['declaredWeightKg']?.toString() ??
                      '0') ??
              0,
          woolState: _mapWoolState(map['stateQuick'] as String?),
          status: _mapLotStatus(map['status'] as String?),
          createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ??
              DateTime.now(),
          latitude: double.tryParse(map['gpsLat']?.toString() ?? '0') ?? 0,
          longitude: double.tryParse(map['gpsLng']?.toString() ?? '0') ?? 0,
          isUrgent: map['isUrgent'] as bool? ?? false,
          notes: map['notes'] as String?,
        );
      }).toList();
      state = lots;
    } catch (_) {}
  }

  Future<void> addLot(Lot lot) async {
    try {
      final lotsService = ref.read(lotsServiceProvider);
      await lotsService.createLot({
        'sourceId': lot.sourceId ?? lot.collectorId,
        'sourceType': _sourceTypeToApi(lot.sourceType),
        'collectorId': lot.collectorId,
        'qrCode': lot.id,
        'declaredWeightKg': lot.weight.toStringAsFixed(2),
        'stateQuick': _woolStateToApi(lot.woolState),
        'isUrgent': lot.isUrgent,
        'gpsLat': lot.latitude.toStringAsFixed(6),
        'gpsLng': lot.longitude.toStringAsFixed(6),
        'notes': lot.notes,
      });
      // Refresh from server
      await _fetchLots();
    } catch (_) {
      // Fallback: add locally
      state = [lot, ...state];
    }
  }

  Future<void> refresh() async {
    await _fetchLots();
  }

  void updateLot(Lot updated) {
    final idx = state.indexWhere((l) => l.id == updated.id);
    if (idx != -1) {
      state = [...state]..[idx] = updated;
    }
  }

  static SourceType _mapSourceType(String? type) {
    switch (type) {
      case 'c1_shepherd':
        return SourceType.c1;
      case 'c2_slaughterhouse':
        return SourceType.c2;
      case 'c3_aggregator':
        return SourceType.c3;
      default:
        return SourceType.c1;
    }
  }

  static WoolState _mapWoolState(String? state) {
    switch (state) {
      case 'clean':
        return WoolState.clean;
      case 'dirty':
        return WoolState.dirty;
      case 'very_dirty':
        return WoolState.veryDirty;
      case 'contaminated':
        return WoolState.contaminated;
      case 'with_meat':
        return WoolState.withMeat;
      default:
        return WoolState.clean;
    }
  }

  static LotStatus _mapLotStatus(String? status) {
    switch (status) {
      case 'announced':
        return LotStatus.announced;
      case 'collected':
        return LotStatus.collected;
      case 'in_transit':
        return LotStatus.inTransit;
      case 'received_depot':
        return LotStatus.receivedDepot;
      default:
        return LotStatus.collected;
    }
  }

  static String _sourceTypeToApi(SourceType type) {
    switch (type) {
      case SourceType.c1:
        return 'c1_shepherd';
      case SourceType.c2:
        return 'c2_slaughterhouse';
      case SourceType.c3:
        return 'c3_aggregator';
    }
  }

  static String _woolStateToApi(WoolState s) {
    switch (s) {
      case WoolState.clean:
        return 'clean';
      case WoolState.dirty:
        return 'dirty';
      case WoolState.veryDirty:
        return 'very_dirty';
      case WoolState.contaminated:
        return 'contaminated';
      case WoolState.withMeat:
        return 'with_meat';
    }
  }
}
