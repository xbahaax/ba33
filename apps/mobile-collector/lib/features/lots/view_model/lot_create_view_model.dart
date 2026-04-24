import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/id_generator_provider.dart';
import '../../../shared/providers/lot_repository_provider.dart';

part 'lot_create_view_model.g.dart';

/// Form state for lot creation.
class LotCreateState {
  const LotCreateState({
    this.weight = 0,
    this.sourceType = SourceType.c1,
    this.woolState = WoolState.clean,
    this.notes = '',
    this.isUrgent = false,
    this.isSaving = false,
    this.error,
  });

  final double weight;
  final SourceType sourceType;
  final WoolState woolState;
  final String notes;
  final bool isUrgent;
  final bool isSaving;
  final String? error;

  bool get isValid => weight > 0;

  LotCreateState copyWith({
    double? weight,
    SourceType? sourceType,
    WoolState? woolState,
    String? notes,
    bool? isUrgent,
    bool? isSaving,
    String? error,
  }) {
    return LotCreateState(
      weight: weight ?? this.weight,
      sourceType: sourceType ?? this.sourceType,
      woolState: woolState ?? this.woolState,
      notes: notes ?? this.notes,
      isUrgent: isUrgent ?? this.isUrgent,
      isSaving: isSaving ?? this.isSaving,
      error: error,
    );
  }
}

@riverpod
class LotCreateViewModel extends _$LotCreateViewModel {
  @override
  LotCreateState build() => const LotCreateState();

  void setWeight(double weight) {
    state = state.copyWith(weight: weight);
  }

  void setSourceType(SourceType type) {
    // C2 (slaughterhouse) is auto-urgent per spec
    state = state.copyWith(
      sourceType: type,
      isUrgent: type == SourceType.c2 ? true : state.isUrgent,
    );
  }

  void setWoolState(WoolState woolState) {
    state = state.copyWith(woolState: woolState);
  }

  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  void toggleUrgent() {
    // Cannot un-urgent a C2 lot
    if (state.sourceType == SourceType.c2) return;
    state = state.copyWith(isUrgent: !state.isUrgent);
  }

  /// Create the lot and add to repository.
  /// Returns the lot ID on success, null on failure.
  String? createLot() {
    if (!state.isValid) {
      state = state.copyWith(error: 'Weight is required');
      return null;
    }

    state = state.copyWith(isSaving: true, error: null);

    final idGen = ref.read(idGeneratorProvider);
    final lotId = idGen.nextLotId();
    final now = DateTime.now();

    final lot = Lot(
      id: lotId,
      collectorId: 'COL-001',
      sourceType: state.sourceType,
      weight: state.weight,
      woolState: state.woolState,
      status: LotStatus.collected,
      createdAt: now,
      latitude: 0,
      longitude: 0,
      isUrgent: state.isUrgent,
      notes: state.notes.isEmpty ? null : state.notes,
    );

    ref.read(lotRepositoryProvider.notifier).addLot(lot);
    state = state.copyWith(isSaving: false);
    return lotId;
  }
}
