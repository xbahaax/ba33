import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'lot_list_view_model.g.dart';

@riverpod
class LotListViewModel extends _$LotListViewModel {
  @override
  AsyncValue<List<Lot>> build() {
    // TODO(BA33-001): load lots from local Drift DB
    return const AsyncValue.data([]);
  }

  Future<void> refreshLots() async {
    state = const AsyncValue.loading();
    // TODO(BA33-001): fetch from local DB
    state = const AsyncValue.data([]);
  }
}
