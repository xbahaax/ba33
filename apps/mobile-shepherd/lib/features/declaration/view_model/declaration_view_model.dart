import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/auth_provider.dart';

part 'declaration_view_model.g.dart';

class DeclarationFormState {
  const DeclarationFormState({
    this.weightCategory,
    this.surnom = '',
    this.mazraa = '',
    this.notes = '',
    this.latitude,
    this.longitude,
    this.locationName,
    this.photoPath,
    this.isSubmitting = false,
    this.isSubmitted = false,
    this.error,
  });

  final WeightCategory? weightCategory;
  final String surnom;
  final String mazraa;
  final String notes;
  final double? latitude;
  final double? longitude;
  final String? locationName;
  final String? photoPath;
  final bool isSubmitting;
  final bool isSubmitted;
  final String? error;

  bool get isValid => weightCategory != null && latitude != null;

  DeclarationFormState copyWith({
    WeightCategory? weightCategory,
    String? surnom,
    String? mazraa,
    String? notes,
    double? latitude,
    double? longitude,
    String? locationName,
    String? photoPath,
    bool? isSubmitting,
    bool? isSubmitted,
    String? error,
  }) {
    return DeclarationFormState(
      weightCategory: weightCategory ?? this.weightCategory,
      surnom: surnom ?? this.surnom,
      mazraa: mazraa ?? this.mazraa,
      notes: notes ?? this.notes,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      locationName: locationName ?? this.locationName,
      photoPath: photoPath ?? this.photoPath,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      error: error,
    );
  }
}

@riverpod
class DeclarationViewModel extends _$DeclarationViewModel {
  @override
  DeclarationFormState build() => const DeclarationFormState();

  void selectWeight(WeightCategory category) {
    state = state.copyWith(weightCategory: category);
  }

  void setLocation(double lat, double lng, {String? name}) {
    state = state.copyWith(
      latitude: lat,
      longitude: lng,
      locationName: name,
    );
  }

  void setSurnom(String surnom) {
    state = state.copyWith(surnom: surnom);
  }

  void setMazraa(String mazraa) {
    state = state.copyWith(mazraa: mazraa);
  }

  void setPhoto(String path) {
    state = state.copyWith(photoPath: path);
  }

  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  Future<void> submit() async {
    if (!state.isValid) {
      state = state.copyWith(
        error: 'اختار الكمية و خلي الموقع يخدم',
      );
      return;
    }

    final user = ref.read(authProvider);
    if (user == null) {
      state = state.copyWith(error: 'ما راكش داخل، سجل دخولك');
      return;
    }

    state = state.copyWith(isSubmitting: true);

    // TODO(BA33-021): submit declaration to API
    await Future<void>.delayed(const Duration(seconds: 1));

    final idGen = IdGenerator(namespace: user.id);

    // Create local declaration
    Declaration(
      id: idGen.nextLotId(),
      shepherdId: user.id,
      weightCategory: state.weightCategory!,
      status: DeclarationStatus.announced,
      createdAt: DateTime.now(),
      latitude: state.latitude!,
      longitude: state.longitude!,
      notes: state.notes.isEmpty ? null : state.notes,
      photoUrl: state.photoPath,
    );

    state = state.copyWith(isSubmitting: false, isSubmitted: true);
  }

  void reset() {
    state = const DeclarationFormState();
  }
}
