import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../shared/providers/api_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/providers/profession_provider.dart';

part 'declaration_view_model.g.dart';

enum BagType { pp, jute }

extension BagTypeX on BagType {
  String get apiValue => switch (this) {
        BagType.pp => 'PP',
        BagType.jute => 'jute',
      };
  String labelArabic() => switch (this) {
        BagType.pp => 'كياس بلاستيك (PP)',
        BagType.jute => 'كياس جوت',
      };
}

class DeclarationFormState {
  const DeclarationFormState({
    this.weightKg,
    this.bagCount,
    this.bagType,
    this.shearingDate,
    this.sheepBreed = '',
    this.lastParasiteTreatmentDate,
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

  final double? weightKg;
  final int? bagCount;
  final BagType? bagType;
  final DateTime? shearingDate;
  final String sheepBreed;
  final DateTime? lastParasiteTreatmentDate;
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
      weightKg != null &&
      weightKg! > 0 &&
      latitude != null &&
      longitude != null;

  DeclarationFormState copyWith({
    double? weightKg,
    int? bagCount,
    BagType? bagType,
    DateTime? shearingDate,
    String? sheepBreed,
    DateTime? lastParasiteTreatmentDate,
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
    bool clearError = false,
  }) {
    return DeclarationFormState(
      weightKg: weightKg ?? this.weightKg,
      bagCount: bagCount ?? this.bagCount,
      bagType: bagType ?? this.bagType,
      shearingDate: shearingDate ?? this.shearingDate,
      sheepBreed: sheepBreed ?? this.sheepBreed,
      lastParasiteTreatmentDate:
          lastParasiteTreatmentDate ?? this.lastParasiteTreatmentDate,
      surnom: surnom ?? this.surnom,
      mazraa: mazraa ?? this.mazraa,
      notes: notes ?? this.notes,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      locationName: locationName ?? this.locationName,
      photoPath: photoPath ?? this.photoPath,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSubmitted: isSubmitted ?? this.isSubmitted,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

@riverpod
class DeclarationViewModel extends _$DeclarationViewModel {
  @override
  DeclarationFormState build() => const DeclarationFormState();

  void setWeight(double? weight) =>
      state = state.copyWith(weightKg: weight, clearError: true);

  void setBagCount(int? count) =>
      state = state.copyWith(bagCount: count, clearError: true);

  void setBagType(BagType type) =>
      state = state.copyWith(bagType: type, clearError: true);

  void setShearingDate(DateTime? date) =>
      state = state.copyWith(shearingDate: date, clearError: true);

  void setSheepBreed(String breed) =>
      state = state.copyWith(sheepBreed: breed, clearError: true);

  void setParasiteTreatmentDate(DateTime? date) =>
      state =
          state.copyWith(lastParasiteTreatmentDate: date, clearError: true);

  void setLocation(double lat, double lng, {String? name}) =>
      state = state.copyWith(
        latitude: lat,
        longitude: lng,
        locationName: name,
        clearError: true,
      );

  void setSurnom(String surnom) => state = state.copyWith(surnom: surnom);

  void setMazraa(String mazraa) => state = state.copyWith(mazraa: mazraa);

  void setPhoto(String path) => state = state.copyWith(photoPath: path);

  void setNotes(String notes) => state = state.copyWith(notes: notes);

  Future<void> submit() async {
    if (!state.isValid) {
      state = state.copyWith(
        error: 'حدد الوزن و الموقع باش تكمل التصريح',
      );
      return;
    }

    final user = ref.read(authProvider);
    if (user == null) {
      state = state.copyWith(error: 'ما راكش داخل، سجل دخولك');
      return;
    }

    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final collectionService = ref.read(collectionServiceProvider);

      // Upload photo if present (non-blocking on failure)
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
          // Photo upload failure is non-blocking — proceed with the declaration.
        }
      }

      final profession = ref.read(professionProvider).value;

      await collectionService.declareWool({
        'userId': user.id,
        'estimatedWeightKg': state.weightKg!.toStringAsFixed(1),
        'latitude': state.latitude!.toString(),
        'longitude': state.longitude!.toString(),
        if (state.surnom.isNotEmpty) 'surnom': state.surnom,
        if (state.mazraa.isNotEmpty) 'mazraa': state.mazraa,
        if (state.notes.isNotEmpty) 'notes': state.notes,
        if (user.regionId.isNotEmpty) 'regionId': user.regionId,
        if (photoFileId != null) 'photoId': photoFileId,
        if (profession != null) 'profession': profession.apiValue,
        if (state.shearingDate != null)
          'shearingDate': _isoDate(state.shearingDate!),
        if (state.sheepBreed.isNotEmpty) 'sheepBreed': state.sheepBreed,
        if (state.bagCount != null) 'bagCount': state.bagCount,
        if (state.bagType != null) 'bagType': state.bagType!.apiValue,
        if (state.lastParasiteTreatmentDate != null)
          'lastParasiteTreatmentDate':
              _isoDate(state.lastParasiteTreatmentDate!),
      });

      state = state.copyWith(isSubmitting: false, isSubmitted: true);
    } catch (_) {
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

String _isoDate(DateTime d) {
  final y = d.year.toString().padLeft(4, '0');
  final m = d.month.toString().padLeft(2, '0');
  final dd = d.day.toString().padLeft(2, '0');
  return '$y-$m-$dd';
}
