import 'package:ba33_domain/ba33_domain.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

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

    // TODO(BA33-030): submit farmer declaration to API
    await Future<void>.delayed(const Duration(seconds: 1));

    final idGen = IdGenerator(namespace: 'transporter-declared');

    Declaration(
      id: idGen.nextLotId(),
      shepherdId: 'farmer-${state.farmerName}',
      weightCategory: state.weightCategory!,
      status: DeclarationStatus.announced,
      createdAt: DateTime.now(),
      latitude: state.latitude!,
      longitude: state.longitude!,
      notes: [
        if (state.farmerPhone.isNotEmpty) 'tel: ${state.farmerPhone}',
        if (state.surnom.isNotEmpty) 'surnom: ${state.surnom}',
        if (state.mazraa.isNotEmpty) 'mazraa: ${state.mazraa}',
        if (state.notes.isNotEmpty) state.notes,
      ].join(' | '),
      photoUrl: state.photoPath,
    );

    state = state.copyWith(isSubmitting: false, isSubmitted: true);
  }

  void reset() {
    state = const FarmerDeclarationFormState();
  }
}
