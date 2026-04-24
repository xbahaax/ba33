import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'lot_repository_provider.g.dart';

/// In-memory lot repository.
/// Will be replaced with Drift-backed persistence in a future phase.
@Riverpod(keepAlive: true)
class LotRepository extends _$LotRepository {
  final List<Lot> _lots = [];

  @override
  List<Lot> build() => List.unmodifiable(_lots);

  void addLot(Lot lot) {
    _lots.insert(0, lot);
    state = List.unmodifiable(_lots);
  }

  void updateLot(Lot updated) {
    final idx = _lots.indexWhere((l) => l.id == updated.id);
    if (idx != -1) {
      _lots[idx] = updated;
      state = List.unmodifiable(_lots);
    }
  }
}
