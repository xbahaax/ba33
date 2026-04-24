import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/auth_provider.dart';

part 'declaration_view_model.g.dart';

class DeclarationFormState {
  const DeclarationFormState({
    this.weightCategory,
    this.customWeight,
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
  final double? customWeight;
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

  bool get isValid =>
      weightCategory != null &&
      latitude != null &&
      (weightCategory != WeightCategory.custom ||
          (customWeight != null && customWeight! > 0));

  DeclarationFormState copyWith({
    WeightCategory? weightCategory,
    double? customWeight,
    bool clearCustomWeight = false,
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
      customWeight:
          clearCustomWeight ? null : (customWeight ?? this.customWeight),
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
    if (category != WeightCategory.custom) {
      state = state.copyWith(weightCategory: category, clearCustomWeight: true);
    } else {
      state = state.copyWith(weightCategory: category);
    }
  }

  void setCustomWeight(double? weight) =>
      state = state.copyWith(customWeight: weight);

  void setLocation(double lat, double lng, {String? name}) =>
      state = state.copyWith(
        latitude: lat,
        longitude: lng,
        locationName: name,
      );

  void setSurnom(String surnom) => state = state.copyWith(surnom: surnom);

  void setMazraa(String mazraa) => state = state.copyWith(mazraa: mazraa);

  void setPhoto(String path) => state = state.copyWith(photoPath: path);

  void setNotes(String notes) => state = state.copyWith(notes: notes);

  double _estimateWeight() {
    if (state.weightCategory == WeightCategory.custom) {
      return state.customWeight ?? 0;
    }
    switch (state.weightCategory!) {
      case WeightCategory.oneSheep:
        return 2.5;
      case WeightCategory.oneBag:
        return 5.0;
      case WeightCategory.smallPile:
        return 15.0;
      case WeightCategory.largePile:
        return 50.0;
      case WeightCategory.custom:
        return state.customWeight ?? 0;
    }
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

    try {
      final collectionService = ref.read(collectionServiceProvider);

      // Upload photo if present
      String? photoFileId;
      if (state.photoPath != null) {
        try {
          final filesService = ref.read(filesServiceProvider);
          final fileResult = await filesService.upload(
            state.photoPath!,
            'photo',
            uploadedBy: user.id,
          );
          photoFileId = fileResult['id'] as String?;
        } catch (_) {
          // Photo upload failure is non-blocking
        }
      }

      await collectionService.createPreLot({
        'sourceId': user.id,
        'estimatedWeightKg': _estimateWeight().toStringAsFixed(1),
        'latitude': state.latitude.toString(),
        'longitude': state.longitude.toString(),
        'notes': [
          if (state.surnom.isNotEmpty) 'surnom: ${state.surnom}',
          if (state.mazraa.isNotEmpty) 'mazraa: ${state.mazraa}',
          if (state.notes.isNotEmpty) state.notes,
        ].join(' | '),
        if (photoFileId != null) 'photoId': photoFileId,
      });

      state = state.copyWith(isSubmitting: false, isSubmitted: true);
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'فشل الإرسال، عاود حاول',
      );
    }
  }

  void reset() {
    state = const DeclarationFormState();
  }
}
