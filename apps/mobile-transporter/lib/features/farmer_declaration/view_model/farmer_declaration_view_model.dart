import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../features/auth/view_model/auth_view_model.dart';
import '../../../shared/providers/api_provider.dart';

part 'farmer_declaration_view_model.g.dart';

class FarmerDeclarationFormState {
  const FarmerDeclarationFormState({
    this.farmerName = '',
    this.farmerPhone = '',
    this.surnom = '',
    this.mazraa = '',
    this.weightCategory,
    this.notes = '',
    this.latitude,
    this.longitude,
    this.locationName,
    this.photoPath,
    this.isSubmitting = false,
    this.isSubmitted = false,
    this.error,
  });

  final String farmerName;
  final String farmerPhone;
  final String surnom;
  final String mazraa;
  final WeightCategory? weightCategory;
  final String notes;
  final double? latitude;
  final double? longitude;
  final String? locationName;
  final String? photoPath;
  final bool isSubmitting;
  final bool isSubmitted;
  final String? error;

  bool get isValid =>
      farmerName.isNotEmpty && weightCategory != null && latitude != null;

  FarmerDeclarationFormState copyWith({
    String? farmerName,
    String? farmerPhone,
    String? surnom,
    String? mazraa,
    WeightCategory? weightCategory,
    String? notes,
    double? latitude,
    double? longitude,
    String? locationName,
    String? photoPath,
    bool? isSubmitting,
    bool? isSubmitted,
    String? error,
  }) {
    return FarmerDeclarationFormState(
      farmerName: farmerName ?? this.farmerName,
      farmerPhone: farmerPhone ?? this.farmerPhone,
      surnom: surnom ?? this.surnom,
      mazraa: mazraa ?? this.mazraa,
      weightCategory: weightCategory ?? this.weightCategory,
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
class FarmerDeclarationViewModel extends _$FarmerDeclarationViewModel {
  @override
  FarmerDeclarationFormState build() => const FarmerDeclarationFormState();

  void setFarmerName(String name) {
    state = state.copyWith(farmerName: name);
  }

  void setFarmerPhone(String phone) {
    state = state.copyWith(farmerPhone: phone);
  }

  void setSurnom(String surnom) {
    state = state.copyWith(surnom: surnom);
  }

  void setMazraa(String mazraa) {
    state = state.copyWith(mazraa: mazraa);
  }

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

  void setPhoto(String path) {
    state = state.copyWith(photoPath: path);
  }

  void setNotes(String notes) {
    state = state.copyWith(notes: notes);
  }

  Future<void> submit() async {
    if (!state.isValid) {
      state = state.copyWith(
        error: 'لازم تدخل اسم الفلاح، الكمية، و الموقع',
      );
      return;
    }

    state = state.copyWith(isSubmitting: true);

    try {
      final collectionSvc = ref.read(collectionServiceProvider);

      // Upload photo if present
      String? photoId;
      if (state.photoPath != null) {
        try {
          final filesSvc = ref.read(filesServiceProvider);
          final uploaded =
              await filesSvc.upload(state.photoPath!, 'photo');
          photoId = uploaded['id'] as String?;
        } catch (_) {
          // Photo upload failure is non-blocking
        }
      }

      final auth = ref.read(authStateProvider);
      final category = state.weightCategory!;

      await collectionSvc.declareWoolOnBehalf({
        'farmerName': state.farmerName,
        'farmerPhone':
            state.farmerPhone.isNotEmpty ? state.farmerPhone : null,
        'estimatedWeightKg': category.estimatedKg,
        'estimatedRange': category.estimatedRange,
        'latitude': state.latitude?.toString(),
        'longitude': state.longitude?.toString(),
        'surnom': state.surnom.isNotEmpty ? state.surnom : null,
        'mazraa': state.mazraa.isNotEmpty ? state.mazraa : null,
        'notes': state.notes.isNotEmpty ? state.notes : null,
        if (photoId != null) 'photoId': photoId,
        'declaringUserId': auth.userId,
      });

      state = state.copyWith(isSubmitting: false, isSubmitted: true);
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        error: 'ما قدرناش نبعثو التصريح، عاود حاول',
      );
    }
  }

  void reset() {
    state = const FarmerDeclarationFormState();
  }
}
